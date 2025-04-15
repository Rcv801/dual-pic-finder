
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
    const apiVersion = '2025-04';
    const shopifyUrl = `https://${shopDomain}/admin/api/${apiVersion}/${targetEndpoint}`;
    
    // Enhanced logging for all requests
    console.log('\n=== SHOPIFY API REQUEST DETAILS ===');
    console.log(`Full Shopify URL: ${shopifyUrl}`);
    console.log(`Request method: ${method}`);
    console.log(`Request endpoint: ${targetEndpoint}`);
    
    // Log search query if present
    if (targetEndpoint.includes('query=')) {
      try {
        const searchQuery = targetEndpoint.match(/query=([^&]*)/)?.[1] || 'No query found';
        console.log(`Search query (decoded): ${decodeURIComponent(searchQuery)}`);
        
        // NEW: Additional debug info for search requests
        console.log('SEARCH DEBUG: This is a product search request');
        console.log(`SEARCH DEBUG: Raw endpoint: ${targetEndpoint}`);
        console.log(`SEARCH DEBUG: Search term: ${decodeURIComponent(searchQuery)}`);
      } catch (e) {
        console.log(`Error decoding search query: ${e.message}`);
      }
    }
    
    // Log pagination info if present
    if (targetEndpoint.includes('page_info=')) {
      console.log(`Request includes pagination cursor`);
      // NEW: Additional debug info for pagination
      const pageInfo = targetEndpoint.match(/page_info=([^&]*)/)?.[1] || 'No cursor found';
      console.log(`PAGINATION DEBUG: Using cursor: ${pageInfo}`);
    }

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
    
    // Enhanced logging for responses
    console.log('\n=== SHOPIFY API RESPONSE DETAILS ===');
    console.log(`Response status: ${shopifyResponse.status}`);
    console.log(`Response status text: ${shopifyResponse.statusText}`);

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

    // Log detailed error information if the response isn't successful
    if (!shopifyResponse.ok) {
      console.log('\n=== SHOPIFY API ERROR DETAILS ===');
      console.log(`Error status: ${shopifyResponse.status}`);
      console.log('Error response:', responseData);
      
      if (shopifyResponse.status === 400 && responseData.errors) {
        // Log specific error messages
        Object.entries(responseData.errors).forEach(([key, value]) => {
          console.log(`Error in ${key}: ${value}`);
        });
      }
    }
    else {
      // Log response data details for successful responses
      if (isJson && responseData.products) {
        console.log(`Total products returned: ${responseData.products.length}`);
        
        // NEW: Enhanced product response logging
        console.log('\n=== PRODUCTS IN RESPONSE ===');
        console.log(`Number of products returned by Shopify: ${responseData.products.length}`);
        
        if (responseData.products.length > 0) {
          console.log('First product:', {
            id: responseData.products[0].id,
            title: responseData.products[0].title
          });
          
          // Show first 5 product titles to verify search results
          const firstFiveProducts = responseData.products.slice(0, 5).map(p => p.title);
          console.log('First 5 product titles:', firstFiveProducts);
          
          if (targetEndpoint.includes('query=')) {
            // For search requests, show if the search term appears in the titles
            try {
              const searchQuery = targetEndpoint.match(/query=([^&]*)/)?.[1] || '';
              const decodedQuery = decodeURIComponent(searchQuery).toLowerCase();
              console.log(`\nSEARCH RELEVANCE CHECK for "${decodedQuery}":`);
              
              const matchingProducts = responseData.products.filter(p => 
                p.title.toLowerCase().includes(decodedQuery)
              );
              
              console.log(`Products with "${decodedQuery}" in title: ${matchingProducts.length} out of ${responseData.products.length}`);
              
              if (matchingProducts.length > 0) {
                console.log('Matching products:', matchingProducts.slice(0, 3).map(p => p.title));
              }
            } catch (e) {
              console.log(`Error in search relevance check: ${e.message}`);
            }
          }
        } else {
          console.log('No products found in response');
        }
      }
    }

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
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Error proxying request to Shopify API', 
      message: error.message 
    });
  }
}
