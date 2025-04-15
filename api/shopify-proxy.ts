
import { corsHeaders, handleOptions } from './utils/corsHeaders';
import { buildShopifyUrl } from './utils/urlBuilder';
import { logRequestDetails, logResponseDetails } from './utils/logging';

export default async function handler(req: any, res: any) {
  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  try {
    // Only allow POST method for our proxy
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

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
      },
    };

    // Add body for non-GET requests if provided
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    // Make the request to Shopify API
    console.log(`Making ${method} request to Shopify: ${shopifyUrl}`);
    const shopifyResponse = await fetch(shopifyUrl, fetchOptions);
    
    // Get response headers to pass back to client
    const responseHeaders: Record<string, string> = {};
    shopifyResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'link' || key.toLowerCase().startsWith('x-shopify')) {
        responseHeaders[key] = value;
      }
    });

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
  } catch (error) {
    console.error('\n=== SHOPIFY API ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', (error as Error).stack);
    return res.status(500).json({ 
      error: 'Error proxying request to Shopify API', 
      message: (error as Error).message 
    });
  }
}
