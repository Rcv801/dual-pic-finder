
import { toast } from "sonner";
import { ShopifyProductsResponse } from "./types";
import { cachedShopifyRequest } from "./api";

// Store pagination links for search and regular requests separately
const paginationCursors = {
  regular: new Map<number, string>(),
  search: new Map<number, string>()
};

// Fetch products from Shopify store with pagination
export const fetchShopifyProducts = async (
  page: number = 1,
  limit: number = 50,
  searchQuery: string = ""
): Promise<ShopifyProductsResponse> => {
  try {
    console.log('\n=== FRONTEND REQUEST DETAILS ===');
    console.log(`Page: ${page}, Limit: ${limit}, Search Query: "${searchQuery}"`);
    
    // Determine whether we're doing a search or regular fetch
    const isSearchMode = searchQuery.trim().length > 0;
    console.log(`Search mode: ${isSearchMode ? 'YES' : 'NO'}`);
    
    // Clear pagination cache when doing a new search with a new query
    if (isSearchMode && page === 1) {
      clearPaginationCache('search');
      console.log('Search pagination cache cleared for new search');
    }
    
    // Base endpoint preparation
    let endpoint = `products.json?limit=${limit}`;
    
    // If we're in search mode
    if (isSearchMode) {
      const formattedQuery = encodeURIComponent(searchQuery.trim());
      
      // For first page of search, use the query parameter
      if (page === 1) {
        endpoint = `products.json?limit=${limit}&query=${formattedQuery}`;
        console.log(`Search endpoint (first page): ${endpoint}`);
        console.log(`Original query: "${searchQuery}"`);
        console.log(`Encoded query: "${formattedQuery}"`);
        console.log(`IMPORTANT: This is a first page search request`);
      } 
      // For subsequent pages, use the cursor from search pagination
      else {
        const cursorMap = paginationCursors.search;
        const cachedCursor = cursorMap.get(page);
        
        // If we have a cached cursor for this page, use it
        if (cachedCursor) {
          endpoint = `products.json?limit=${limit}&page_info=${cachedCursor}`;
          console.log(`Search with pagination, using cached cursor for page ${page}`);
          console.log(`Cursor: ${cachedCursor}`);
          
          // DO NOT add query parameter when using cursor-based pagination
          // as Shopify API doesn't support combining both
        } 
        // If we don't have a cursor for the requested page, we need to fetch the previous page first
        else {
          const prevPageCursor = cursorMap.get(page - 1);
          
          if (!prevPageCursor && page > 1) {
            console.log(`No cursor for search page ${page-1}. Fetching previous page first...`);
            const previousPageResponse = await fetchShopifyProducts(page - 1, limit, searchQuery);
            
            if (!previousPageResponse.nextPageCursor) {
              // No cursor means no more pages
              console.log(`No more search results available for "${searchQuery}"`);
              return { products: [], hasNextPage: false, nextPageCursor: "" };
            }
            
            // Now we should have the previous page cursor cached, try again
            return fetchShopifyProducts(page, limit, searchQuery);
          }
          
          if (!prevPageCursor) {
            console.log(`Cannot find cursor for search page ${page-1}`);
            return { products: [], hasNextPage: false, nextPageCursor: "" };
          }
          
          endpoint = `products.json?limit=${limit}&page_info=${prevPageCursor}`;
          console.log(`Using cursor from previous search page: ${endpoint}`);
          console.log(`Previous page cursor: ${prevPageCursor}`);
          
          // DO NOT add query parameter when using cursor-based pagination
        }
      }
    } 
    // Regular product listing (no search)
    else {
      // First page - simple request
      if (page === 1) {
        endpoint = `products.json?limit=${limit}`;
        console.log(`Regular product listing (first page): ${endpoint}`);
      } 
      // Subsequent pages - use regular pagination cursors
      else {
        const cursorMap = paginationCursors.regular;
        const cachedCursor = cursorMap.get(page);
        
        if (cachedCursor) {
          endpoint = `products.json?limit=${limit}&page_info=${cachedCursor}`;
          console.log(`Regular pagination, using cached cursor for page ${page}`);
          console.log(`Cursor: ${cachedCursor}`);
        } else {
          const prevPageCursor = cursorMap.get(page - 1);
          
          if (!prevPageCursor && page > 1) {
            console.log(`No cursor for regular page ${page-1}. Fetching previous page first...`);
            const previousPageResponse = await fetchShopifyProducts(page - 1, limit, "");
            
            if (!previousPageResponse.nextPageCursor) {
              return { products: [], hasNextPage: false, nextPageCursor: "" };
            }
            
            // Now we should have the previous page cursor cached, try again
            return fetchShopifyProducts(page, limit, "");
          }
          
          if (!prevPageCursor) {
            return { products: [], hasNextPage: false, nextPageCursor: "" };
          }
          
          endpoint = `products.json?limit=${limit}&page_info=${prevPageCursor}`;
          console.log(`Using cursor from previous regular page: ${endpoint}`);
          console.log(`Previous page cursor: ${prevPageCursor}`);
        }
      }
    }
    
    console.log(`Final endpoint being called: ${endpoint}`);
    
    // NEW: Don't use cache for search requests
    const { data, headers } = await cachedShopifyRequest(
      endpoint, 
      "GET", 
      null, 
      isSearchMode || page > 1  // Force refresh for search or pagination
    );
    
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
        
        // Store the cursor in the appropriate map based on whether we're in search mode
        const cursorMap = isSearchMode ? paginationCursors.search : paginationCursors.regular;
        cursorMap.set(page + 1, nextPageCursor);
        
        console.log(`Saved ${isSearchMode ? 'search' : 'regular'} cursor for page ${page + 1}`);
        console.log(`Next page cursor: ${nextPageCursor}`);
      }
    }
    
    // Log search results or failure
    if (isSearchMode) {
      console.log(`Search results for "${searchQuery}":`);
      console.log(`- Total products: ${data.products?.length || 0}`);
      
      // NEW: Added search relevance checking
      if (data.products?.length > 0) {
        console.log(`- First product: ${data.products[0].title}`);
        console.log(`- Last product: ${data.products[data.products.length - 1].title}`);
        
        // Check how many products actually contain the search term in their title
        const searchTerm = searchQuery.toLowerCase().trim();
        const matchingProducts = data.products.filter(
          product => product.title.toLowerCase().includes(searchTerm)
        );
        
        console.log(`\n=== SEARCH TERM MATCHING ===`);
        console.log(`Products with "${searchTerm}" in title: ${matchingProducts.length} out of ${data.products.length}`);
        
        if (matchingProducts.length > 0) {
          console.log("Matching product titles:");
          matchingProducts.slice(0, 5).forEach((p, i) => {
            console.log(`${i+1}. ${p.title}`);
          });
        } else {
          console.log("No products directly match the search term in title.");
          console.log("First 5 returned product titles:");
          data.products.slice(0, 5).forEach((p, i) => {
            console.log(`${i+1}. ${p.title}`);
          });
        }
        
        // If search returned products but none match the term in title, show a warning
        if (matchingProducts.length === 0 && data.products.length > 0) {
          console.warn(`WARNING: Shopify returned ${data.products.length} products for search "${searchQuery}" but none contain the term in their title.`);
          console.warn("This might indicate that Shopify search is not working as expected.");
        }
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

// Clear pagination cache - can specify 'search', 'regular', or clear both
export const clearPaginationCache = (type?: 'search' | 'regular'): void => {
  if (!type || type === 'regular') {
    paginationCursors.regular.clear();
    console.log("Regular pagination cache cleared");
  }
  if (!type || type === 'search') {
    paginationCursors.search.clear();
    console.log("Search pagination cache cleared");
  }
};
