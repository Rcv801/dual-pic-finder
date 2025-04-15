
import { toast } from "sonner";
import { ShopifyProductsResponse } from "./types";
import { cachedShopifyRequest } from "./api";
import { 
  clearPaginationCache, 
  getPaginationCursor, 
  storePaginationCursor,
  extractCursorFromLinkHeader 
} from "./pagination";
import { buildProductEndpoint, analyzeSearchResults } from "./endpoints";

// Fetch products from Shopify store with pagination
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
      console.log('Search pagination cache cleared for new search');
    }
    
    // Get cached cursor or previous page cursor
    const cachedCursor = getPaginationCursor(page, isSearchMode);
    const prevPageCursor = cachedCursor || (page > 1 ? getPaginationCursor(page - 1, isSearchMode) : undefined);
    
    // Build the endpoint
    const endpoint = buildProductEndpoint(page, limit, searchQuery, prevPageCursor);
    
    // Make the request
    const { data, headers } = await cachedShopifyRequest(
      endpoint, 
      "GET", 
      null, 
      isSearchMode || page > 1
    );
    
    console.log('\n=== FRONTEND RESPONSE DETAILS ===');
    console.log(`Products received: ${data.products?.length || 0}`);
    
    // Handle pagination
    const linkHeader = headers.get('Link');
    console.log("Link header:", linkHeader);
    
    const hasNextPage = linkHeader ? linkHeader.includes('rel="next"') : false;
    let nextPageCursor = "";
    
    if (hasNextPage && linkHeader) {
      const nextLinkMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)[^>]*>;\s*rel="next"/);
      if (nextLinkMatch && nextLinkMatch[1]) {
        nextPageCursor = nextLinkMatch[1];
        storePaginationCursor(page + 1, nextPageCursor, isSearchMode);
      }
    }
    
    // Analyze search results if in search mode
    if (isSearchMode) {
      analyzeSearchResults(data.products || [], searchQuery);
    }
    
    return { 
      products: data.products || [],
      hasNextPage,
      nextPageCursor
    };
  } catch (error) {
    console.error('\n=== FRONTEND ERROR ===');
    console.error('Error in fetchShopifyProducts:', error);
    toast.error("Failed to fetch products from Shopify");
    throw error;
  }
};

// Re-export pagination utilities for convenience
export { clearPaginationCache, extractCursorFromLinkHeader };

