
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
    
    // Handle pagination properly
    if (page > 1) {
      // For page 2 and beyond, we need to calculate the offset
      const offset = (page - 1) * limit;
      endpoint += `&page_info=${offset}`;
    }
    
    console.log("Fetching products from endpoint:", endpoint);
    
    const { data, headers } = await makeShopifyRequest(endpoint);
    
    // Check if we have more pages by examining the Link header
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
    return { products: [], hasNextPage: false };
  }
};
