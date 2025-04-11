
import { toast } from "sonner";
import { ShopifyProductsResponse } from "./types";
import { makeShopifyRequest } from "./api";

// Fetch products from Shopify store with pagination
export const fetchShopifyProducts = async (
  page: number = 1,
  limit: number = 50,
  searchQuery: string = ""
): Promise<ShopifyProductsResponse> => {
  try {
    // Build base URL with pagination parameters
    let endpoint = `products.json?limit=${limit}`;
    
    // Add search query if provided
    if (searchQuery) {
      // Use query parameter for search (title contains the search term)
      endpoint += `&title=${encodeURIComponent(searchQuery)}`;
    }
    
    // For pagination, we need to use page_info with cursor for subsequent pages
    // First page doesn't require cursor
    if (page > 1) {
      const previousPageResponse = await fetchShopifyProducts(page - 1, limit, searchQuery);
      if (previousPageResponse.nextPageCursor) {
        endpoint = `products.json?limit=${limit}&page_info=${previousPageResponse.nextPageCursor}`;
        
        // If search query exists, we need to append it again as page_info can override other params
        if (searchQuery) {
          endpoint += `&title=${encodeURIComponent(searchQuery)}`;
        }
      } else {
        // No cursor means no more pages
        return { products: [], hasNextPage: false, nextPageCursor: "" };
      }
    }
    
    console.log(`Fetching products from endpoint: ${endpoint}`);
    
    const { data, headers } = await makeShopifyRequest(endpoint);
    
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
      }
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

