
// Vercel Serverless Function to proxy Shopify API requests

// Set CORS headers to allow requests from any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

// Handle preflight OPTIONS requests
const handleOptions = (req, res) => {
  res.status(200).send(null);
};

// Main handler function
export default async function handler(req, res) {
  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  try {
    // Only allow POST method for our proxy (which will contain details about the actual request)
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
    const apiVersion = '2025-04'; // Use latest Shopify API version
    const shopifyUrl = `https://${shopDomain}/admin/api/${apiVersion}/${targetEndpoint}`;
    
    console.log(`Proxying request to: ${shopifyUrl}`);

    // Prepare fetch options
    const fetchOptions = {
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
    const shopifyResponse = await fetch(shopifyUrl, fetchOptions);
    
    // Get the response headers to pass them back to the client
    const responseHeaders = {};
    shopifyResponse.headers.forEach((value, key) => {
      // Only include relevant headers
      if (key.toLowerCase() === 'link' || 
          key.toLowerCase().startsWith('x-shopify')) {
        responseHeaders[key] = value;
      }
    });

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
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Error proxying request to Shopify API', 
      message: error.message 
    });
  }
}
