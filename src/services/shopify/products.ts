
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
    // Check if we already have the cursor for this page in cache
    const cachedCursor = cursorCache.get(page);
    
    // Build base URL with pagination parameters
    let endpoint = `products.json?limit=${limit}`;
    
    // Add search query if provided - using a case-insensitive search approach
    if (searchQuery) {
      // Use title field with asterisk wildcard for partial matches
      const formattedQuery = encodeURIComponent(searchQuery.trim());
      endpoint += `&title=${formattedQuery}*`;
      
      // Clear pagination cache when doing a search
      if (page === 1) {
        clearPaginationCache();
      }
    }
    
    // For pages beyond first, use cached cursor or fetch previous page
    if (page > 1) {
      if (cachedCursor) {
        // Use cached cursor
        endpoint = `products.json?limit=${limit}&page_info=${cachedCursor}`;
        
        // If search query exists, we need to append it again
        if (searchQuery) {
          const formattedQuery = encodeURIComponent(searchQuery.trim());
          endpoint += `&title=${formattedQuery}*`;
        }
      } else {
        // We need cursor from previous page - check if we can get from cache
        const prevPageCursor = cursorCache.get(page - 1);
        
        // If we don't have previous page cursor, we need to fetch it
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
        
        // If search query exists, we need to append it again
        if (searchQuery) {
          const formattedQuery = encodeURIComponent(searchQuery.trim());
          endpoint += `&title=${formattedQuery}*`;
        }
      }
    }
    
    console.log(`Fetching products from endpoint: ${endpoint}`);
    
    // Use the cached API request to reduce actual API calls
    const { data, headers } = await cachedShopifyRequest(endpoint, "GET", null, searchQuery ? true : false);
    
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
    
    // Cache pagination cursors from Link header
    const cursorInfo = extractCursorFromLinkHeader(linkHeader);
    if (cursorInfo.nextCursor) {
      cursorCache.set(page + 1, cursorInfo.nextCursor);
    }
    
    return { 
      products: data.products || [],
      hasNextPage,
      nextPageCursor
    };
  } catch (error) {
    console.error("Failed to fetch Shopify products:", error);
    toast.error("Failed to fetch products from Shopify");
    return { products: [], hasNextPage: false, nextPageCursor: "" };
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
};

