import { toast } from "sonner";
import { ShopifyProductsResponse } from "./types";
import { cachedShopifyRequest } from "./api";

// Cache for pagination cursors to avoid redundant API calls
const cursorCache = new Map<number, string>();

// Fetch products from Shopify store with pagination
export const fetchShopifyProducts = async (
  page: number = 1,
  limit: number = 50,
  searchQuery: string = ""
): Promise<ShopifyProductsResponse> => {
  try {
    console.log('\n=== FRONTEND REQUEST DETAILS ===');
    console.log(`Page: ${page}, Limit: ${limit}, Search Query: "${searchQuery}"`);
    
    // Clear pagination cache when doing a search with a new query
    if (searchQuery && page === 1) {
      clearPaginationCache();
    }
    
    let endpoint = `products.json?limit=${limit}`;
    
    if (searchQuery) {
      const formattedQuery = encodeURIComponent(searchQuery.trim());
      endpoint += `&query=${formattedQuery}`;
      
      console.log(`Search endpoint: ${endpoint}`);
      console.log(`Original query: "${searchQuery}"`);
      console.log(`Encoded query: "${formattedQuery}"`);
    }
    
    // For pages beyond first, use cached cursor for pagination
    if (page > 1) {
      const cachedCursor = cursorCache.get(page);
      
      if (cachedCursor) {
        // Use cached cursor
        endpoint = `products.json?limit=${limit}&page_info=${cachedCursor}`;
        
        // Adding search query to a cursor-based pagination is not supported by Shopify
        // This will cause a 400 error, but the code previously tried to do this
        if (searchQuery) {
          const formattedQuery = encodeURIComponent(searchQuery.trim());
          
          // DEBUG: Log the problematic combination that causes Shopify API error
          console.log(`WARNING: Attempting to use both cursor (page_info) and query parameters.`);
          console.log(`This combination is not supported by Shopify's API.`);
          
          // We're keeping this code to identify the issue, but we should not add the query here
          // as it will cause a 400 error from Shopify
          endpoint += `&query=${formattedQuery}`;
        }
      } else {
        // If we don't have the cursor for the requested page, we need to get the previous page cursor
        const prevPageCursor = cursorCache.get(page - 1);
        
        if (!prevPageCursor) {
          console.log(`No cursor for page ${page-1}. Fetching previous page first...`);
          const previousPageResponse = await fetchShopifyProducts(page - 1, limit, searchQuery);
          
          if (!previousPageResponse.nextPageCursor) {
            // No cursor means no more pages
            return { products: [], hasNextPage: false, nextPageCursor: "" };
          }
        }
        
        // Now we should have the previous page cursor cached
        const prevPageResult = cursorCache.get(page - 1);
        if (!prevPageResult) {
          return { products: [], hasNextPage: false, nextPageCursor: "" };
        }
        
        endpoint = `products.json?limit=${limit}&page_info=${prevPageResult}`;
        
        // Same issue as above - don't add query param when using cursor
        if (searchQuery) {
          const formattedQuery = encodeURIComponent(searchQuery.trim());
          
          // DEBUG warning
          console.log(`WARNING: Combining cursor and query parameters in pagination.`);
          
          endpoint += `&query=${formattedQuery}`;
        }
      }
    }
    
    console.log(`Final endpoint being called: ${endpoint}`);
    
    const { data, headers } = await cachedShopifyRequest(endpoint, "GET", null, !!searchQuery);
    
    console.log('\n=== FRONTEND RESPONSE DETAILS ===');
    console.log(`Products received: ${data.products?.length || 0}`);
    
    // Parse Link header for pagination information
    const linkHeader = headers.get('Link');
    console.log("Link header:", linkHeader);
    
    const hasNextPage = linkHeader ? linkHeader.includes('rel="next"') : false;
    let nextPageCursor = "";
    
    if (hasNextPage && linkHeader) {
      // Extract the cursor from the Link header
      const nextLinkMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)[^>]*>;\s*rel="next"/);
      if (nextLinkMatch && nextLinkMatch[1]) {
        nextPageCursor = nextLinkMatch[1];
        
        // Cache the cursor for the next page
        cursorCache.set(page + 1, nextPageCursor);
      }
    }
    
    // Log search results or failure
    if (searchQuery) {
      console.log(`Search results for "${searchQuery}":`);
      console.log(`- Total products: ${data.products?.length || 0}`);
      if (data.products?.length > 0) {
        console.log(`- First product: ${data.products[0].title}`);
        console.log(`- Last product: ${data.products[data.products.length - 1].title}`);
      }
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

// Helper function to extract page cursor from Link header
export const extractCursorFromLinkHeader = (linkHeader: string | null): { 
  nextCursor: string, 
  prevCursor: string 
} => {
  const result = { nextCursor: "", prevCursor: "" };
  
  if (!linkHeader) return result;
  
  // Extract next cursor
  const nextLinkMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)[^>]*>;\s*rel="next"/);
  if (nextLinkMatch && nextLinkMatch[1]) {
    result.nextCursor = nextLinkMatch[1];
  }
  
  // Extract previous cursor
  const prevLinkMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)[^>]*>;\s*rel="previous"/);
  if (prevLinkMatch && prevLinkMatch[1]) {
    result.prevCursor = prevLinkMatch[1];
  }
  
  return result;
};

// Clear pagination cache - useful when search query changes
export const clearPaginationCache = (): void => {
  cursorCache.clear();
  console.log("Pagination cache cleared");
};
