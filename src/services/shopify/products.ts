
import { toast } from "sonner";
import { ShopifyProductsResponse } from "./types";
import { clearPaginationCache, getPaginationCursor, storePaginationCursor } from "./pagination";
import { clearApiCache } from "./api";
import { cachedGraphQLQuery, clearGraphQLCache } from "./graphql/client";
import { PRODUCTS_QUERY, transformGraphQLProducts } from "./graphql/productQueries";

// Fetch products from Shopify store with pagination using GraphQL
export const fetchShopifyProducts = async (
  page: number = 1,
  limit: number = 50,
  searchQuery: string = ""
): Promise<ShopifyProductsResponse> => {
  try {
    console.log('\n=== FRONTEND REQUEST DETAILS ===');
    console.log(`Page: ${page}, Limit: ${limit}, Search Query: "${searchQuery}"`);
    
    const isSearchMode = searchQuery.trim().length > 0;
    console.log(`Search mode: ${isSearchMode ? 'YES' : 'NO'}`);
    
    // Clear pagination cache for new searches
    if (isSearchMode && page === 1) {
      clearPaginationCache('search');
      clearGraphQLCache();
      console.log('Search pagination cache cleared for new search');
    }
    
    // Get pagination cursor for current page
    const cachedCursor = getPaginationCursor(page, isSearchMode);
    const cursor = cachedCursor || (page > 1 ? getPaginationCursor(page - 1, isSearchMode) : null);
    
    console.log(`Using cursor: ${cursor || 'NONE'} for page ${page}`);
    
    // Prepare GraphQL variables
    const variables = {
      first: limit,
      after: cursor,
      query: isSearchMode ? searchQuery : ""
    };
    
    // Make the GraphQL request
    const data = await cachedGraphQLQuery(
      PRODUCTS_QUERY, 
      variables,
      isSearchMode || page > 1
    );
    
    console.log('\n=== FRONTEND RESPONSE DETAILS ===');
    const productCount = data?.products?.edges?.length || 0;
    console.log(`Products received: ${productCount}`);
    
    // Transform GraphQL response to match our existing format
    const transformedResponse = transformGraphQLProducts(data);
    
    // Store next page cursor for pagination
    if (transformedResponse.hasNextPage && transformedResponse.nextPageCursor) {
      storePaginationCursor(page + 1, transformedResponse.nextPageCursor, isSearchMode);
      console.log(`Stored cursor for page ${page + 1}: ${transformedResponse.nextPageCursor}`);
    }
    
    // Analyze search results if in search mode
    if (isSearchMode && productCount > 0) {
      console.log(`\n=== SEARCH TERM MATCHING ===`);
      const searchTerm = searchQuery.toLowerCase().trim();
      const matchingProducts = transformedResponse.products.filter(
        product => product.title.toLowerCase().includes(searchTerm)
      );
      
      console.log(`Products with "${searchTerm}" in title: ${matchingProducts.length} out of ${productCount}`);
      
      if (matchingProducts.length > 0) {
        console.log("Matching product titles:");
        matchingProducts.slice(0, 5).forEach((p, i) => {
          console.log(`${i+1}. ${p.title}`);
        });
      } else {
        console.log("No products directly match the search term in title.");
        console.log("First 5 returned product titles:");
        transformedResponse.products.slice(0, 5).forEach((p, i) => {
          console.log(`${i+1}. ${p.title}`);
        });
      }
    }
    
    return transformedResponse;
  } catch (error) {
    console.error('\n=== FRONTEND ERROR ===');
    console.error('Error in fetchShopifyProducts:', error);
    toast.error("Failed to fetch products from Shopify");
    throw error;
  }
};

// Re-export pagination utilities for convenience
export { clearPaginationCache };

// Export functions to clear caches
export const clearAllCaches = () => {
  clearPaginationCache();
  clearApiCache();
  clearGraphQLCache();
  console.log("All Shopify caches cleared");
};
