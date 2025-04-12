
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
    // Clear pagination cache when doing a search with a new query
    if (searchQuery && page === 1) {
      clearPaginationCache();
    }
    
    // Build base URL with pagination parameters
    let endpoint = `products.json?limit=${limit}`;
    
    // Add search query if provided - use the query parameter for better partial matching
    if (searchQuery) {
      // Format search query - ensure proper encoding
      const formattedQuery = encodeURIComponent(searchQuery.trim());
      
      // Use 'query' parameter instead of 'title' for better search capabilities
      endpoint += `&query=${formattedQuery}`;
      
      console.log(`Searching for products with query parameter: "${searchQuery}" (encoded: ${formattedQuery})`);
    }
    
    // For pages beyond first, use cached cursor for pagination
    if (page > 1) {
      const cachedCursor = cursorCache.get(page);
      
      if (cachedCursor) {
        // Use cached cursor
        endpoint = `products.json?limit=${limit}&page_info=${cachedCursor}`;
        
        // When using cursor-based pagination, we still need to add the search query
        if (searchQuery) {
          const formattedQuery = encodeURIComponent(searchQuery.trim());
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
        
        // Add search query if provided
        if (searchQuery) {
          const formattedQuery = encodeURIComponent(searchQuery.trim());
          endpoint += `&query=${formattedQuery}`;
        }
      }
    }
    
    console.log(`Fetching products from endpoint: ${endpoint}`);
    
    // Force refresh for search queries to ensure latest results
    const forceRefresh = !!searchQuery;
    
    // Use the cached API request to reduce actual API calls
    const { data, headers } = await cachedShopifyRequest(endpoint, "GET", null, forceRefresh);
    
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
      const productCount = data.products ? data.products.length : 0;
      console.log(`Search for "${searchQuery}" returned ${productCount} products`);
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
