
// Types for Shopify API interactions

export interface ShopifyCredentials {
  shopDomain: string; // e.g., "yourstore.myshopify.com"
  accessToken: string; // Admin API Access Token
}

export interface ShopifyProduct {
  id: number;
  graphqlId?: string;  // GraphQL ID in the format "gid://shopify/Product/1234567890"
  title: string;
  description?: string;
  handle?: string;
  image?: {
    id?: string;
    src: string;
    alt?: string;
  };
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
  hasNextPage: boolean;
  nextPageCursor?: string | null;
}
