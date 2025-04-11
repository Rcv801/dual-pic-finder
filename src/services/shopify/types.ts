
// Types for Shopify API interactions

export interface ShopifyCredentials {
  shopDomain: string; // e.g., "yourstore.myshopify.com"
  accessToken: string; // Admin API Access Token
}

export interface ShopifyProduct {
  id: number;
  title: string;
  image?: {
    src: string;
  };
}

export interface ShopifyProductsResponse {
  products: ShopifyProduct[];
  hasNextPage: boolean;
  nextPageCursor?: string;
}
