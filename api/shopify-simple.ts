
export default async function handler(req: any, res: any) {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };
  
  // Set all CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Set debugging headers
  res.setHeader('X-Proxy-Version', '2.0-simplified');
  res.setHeader('X-Request-Method', req.method);

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted',
      allowedMethods: 'POST, OPTIONS'
    });
  }

  try {
    // Parse the request body
    const { shopDomain, accessToken, targetEndpoint, method, body } = req.body;

    // Validate required parameters
    if (!shopDomain || !accessToken || !targetEndpoint) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        message: 'shopDomain, accessToken, and targetEndpoint are required' 
      });
    }

    // Build the Shopify API URL
    const API_VERSION = '2025-04';
    const shopifyUrl = targetEndpoint === 'graphql.json'
      ? `https://${shopDomain}/admin/api/${API_VERSION}/graphql.json`
      : `https://${shopDomain}/admin/api/${API_VERSION}/${targetEndpoint}`;
    
    console.log(`Making ${method || 'GET'} request to Shopify: ${shopifyUrl}`);
    
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

    try {
      // Make the request to Shopify API
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

      // Return response with status code and headers
      return res.status(shopifyResponse.status).json({
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        headers: responseHeaders,
        data: responseData,
      });
    } catch (fetchError: any) {
      console.error('Shopify API fetch error:', fetchError);
      
      // Return a detailed error response
      return res.status(500).json({ 
        error: 'Error sending request to Shopify API', 
        message: fetchError.message,
        type: fetchError.name,
        endpoint: targetEndpoint
      });
    }
  } catch (error: any) {
    console.error('Shopify proxy error:', error);
    
    return res.status(500).json({ 
      error: 'Error proxying request to Shopify API', 
      message: error.message,
      type: error.name || 'Unknown',
      timestamp: new Date().toISOString()
    });
  }
}
