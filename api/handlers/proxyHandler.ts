
import { corsHeaders, handleOptions } from '../utils/corsHeaders';
import { buildShopifyUrl } from '../utils/urlBuilder';
import { logRequestDetails, logResponseHeaders, logResponseDetails } from '../utils/logging';

export const handleProxyRequest = async (req: any, res: any) => {
  try {
    // Set additional debugging headers
    res.setHeader('X-Proxy-Debug', 'true');
    res.setHeader('X-Proxy-Version', '1.1');
    
    // Parse the request body
    const { shopDomain, accessToken, targetEndpoint, method, body } = req.body;

    // Validate required parameters
    if (!shopDomain || !accessToken || !targetEndpoint) {
      return res.status(400).json({ 
        error: 'Missing required parameters: shopDomain, accessToken, and targetEndpoint are required' 
      });
    }

    // Build the target Shopify API URL
    const shopifyUrl = buildShopifyUrl(shopDomain, targetEndpoint);
    
    // Log request details
    logRequestDetails(shopifyUrl, method, targetEndpoint, body);

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
        'User-Agent': 'DualPicFinder/1.0'
      },
      // Set a timeout for the request to Shopify API
      signal: AbortSignal.timeout(8000) // 8 second timeout
    };

    // Add body for non-GET requests if provided
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    // Make the request to Shopify API
    console.log(`Making ${method} request to Shopify: ${shopifyUrl}`);
    console.log('Request headers:', fetchOptions.headers);
    
    try {
      const shopifyResponse = await fetch(shopifyUrl, fetchOptions);
      
      // Get response headers to pass back to client
      const responseHeaders: Record<string, string> = {};
      shopifyResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'link' || 
            key.toLowerCase().startsWith('x-shopify') ||
            key.toLowerCase() === 'content-type' ||
            key.toLowerCase() === 'date') {
          responseHeaders[key] = value;
        }
      });
      
      // Add debug headers
      responseHeaders['x-proxy-status'] = 'success';
      responseHeaders['x-proxy-shopify-status'] = shopifyResponse.status.toString();

      // Check if response is JSON
      const contentType = shopifyResponse.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      // Parse the response based on content type
      const responseData = isJson ? await shopifyResponse.json() : await shopifyResponse.text();

      // Log response details
      logResponseDetails(shopifyResponse, responseData);

      // Return response with status code and headers
      return res.status(shopifyResponse.status).json({
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        headers: responseHeaders,
        data: responseData,
      });
    } catch (fetchError) {
      console.error('\n=== SHOPIFY API FETCH ERROR ===');
      console.error('Error details:', fetchError);
      console.error('Shop domain:', shopDomain);
      console.error('Target endpoint:', targetEndpoint);
      
      // Return a detailed error response
      return res.status(500).json({ 
        error: 'Error sending request to Shopify API', 
        message: (fetchError as Error).message,
        type: (fetchError as Error).name,
        endpoint: targetEndpoint,
        domain: shopDomain.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() // For privacy, don't send full domain
      });
    }
  } catch (error) {
    console.error('\n=== SHOPIFY API ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', (error as Error).stack);
    
    // Set error headers
    res.setHeader('X-Proxy-Status', 'error');
    res.setHeader('X-Proxy-Error-Type', (error as Error).name || 'Unknown');
    
    return res.status(500).json({ 
      error: 'Error proxying request to Shopify API', 
      message: (error as Error).message,
      type: (error as Error).name || 'Unknown',
      timestamp: new Date().toISOString()
    });
  }
};
