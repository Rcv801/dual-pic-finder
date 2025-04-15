export const logRequestDetails = (shopifyUrl: string, method: string, targetEndpoint: string, body?: any) => {
  console.log('\n=== SHOPIFY API REQUEST DETAILS ===');
  console.log(`Full Shopify URL: ${shopifyUrl}`);
  console.log(`Request method: ${method}`);
  console.log(`Request endpoint: ${targetEndpoint}`);
  
  if (targetEndpoint === 'graphql.json' && body) {
    console.log('GraphQL Request:');
    if (body.query) {
      console.log(`Query: ${body.query.substring(0, 100)}...`);
    }
    if (body.variables) {
      console.log('Variables:', body.variables);
    }
  }
  
  logSearchDetails(targetEndpoint);
  logPaginationDetails(targetEndpoint);
};

const logSearchDetails = (targetEndpoint: string) => {
  if (targetEndpoint.includes('query=')) {
    try {
      const searchQuery = targetEndpoint.match(/query=([^&]*)/)?.[1] || 'No query found';
      console.log(`Search query (decoded): ${decodeURIComponent(searchQuery)}`);
      console.log('SEARCH DEBUG: This is a product search request');
      console.log(`SEARCH DEBUG: Raw endpoint: ${targetEndpoint}`);
      console.log(`SEARCH DEBUG: Search term: ${decodeURIComponent(searchQuery)}`);
    } catch (e) {
      console.log(`Error decoding search query: ${(e as Error).message}`);
    }
  }
};

const logPaginationDetails = (targetEndpoint: string) => {
  if (targetEndpoint.includes('page_info=')) {
    console.log(`Request includes pagination cursor`);
    const pageInfo = targetEndpoint.match(/page_info=([^&]*)/)?.[1] || 'No cursor found';
    console.log(`PAGINATION DEBUG: Using cursor: ${pageInfo}`);
  }
};

export const logResponseHeaders = (headers: Headers): void => {
  console.log('\n=== RESPONSE HEADERS ===');
  headers.forEach((value, key) => {
    if (key.toLowerCase() === 'link' || key.toLowerCase().startsWith('x-shopify')) {
      console.log(`${key}: ${value}`);
    }
  });
};

export const logResponseDetails = (response: Response, responseData: any) => {
  console.log('\n=== SHOPIFY API RESPONSE DETAILS ===');
  console.log(`Response status: ${response.status}`);
  console.log(`Response status text: ${response.statusText}`);

  if (!response.ok) {
    logErrorDetails(response.status, responseData);
  } else {
    logSuccessDetails(responseData);
  }
};

const logErrorDetails = (status: number, responseData: any) => {
  console.log('\n=== SHOPIFY API ERROR DETAILS ===');
  console.log(`Error status: ${status}`);
  console.log('Error response:', responseData);
  
  if (status === 400 && responseData.errors) {
    Object.entries(responseData.errors).forEach(([key, value]) => {
      console.log(`Error in ${key}: ${value}`);
    });
  }
};

const logSuccessDetails = (responseData: any) => {
  if (responseData.products) {
    logProductDetails(responseData.products);
  }
};

const logProductDetails = (products: any[]) => {
  console.log('\n=== PRODUCTS IN RESPONSE ===');
  console.log(`Number of products returned by Shopify: ${products.length}`);
  
  if (products.length > 0) {
    console.log('First product:', {
      id: products[0].id,
      title: products[0].title
    });
    
    const firstFiveProducts = products.slice(0, 5).map(p => p.title);
    console.log('First 5 product titles:', firstFiveProducts);
  } else {
    console.log('No products found in response');
  }
};
