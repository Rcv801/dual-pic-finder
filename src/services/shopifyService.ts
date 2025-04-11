
import { toast } from "sonner";

// Types for Shopify credentials and tokens
export interface ShopifyCredentials {
  apiKey: string;
  apiSecretKey: string;
  shopDomain: string; // e.g., "yourstore.myshopify.com"
  accessToken?: string;
}

// Check if we have stored Shopify credentials
export const hasShopifyCredentials = (): boolean => {
  const credentials = localStorage.getItem("shopify_credentials");
  if (!credentials) return false;
  
  try {
    const parsed = JSON.parse(credentials) as ShopifyCredentials;
    return !!(parsed.apiKey && parsed.shopDomain && parsed.accessToken);
  } catch (e) {
    return false;
  }
};

// Store Shopify credentials securely (localStorage in this demo)
export const storeShopifyCredentials = (credentials: ShopifyCredentials): void => {
  localStorage.setItem("shopify_credentials", JSON.stringify(credentials));
};

// Retrieve stored Shopify credentials
export const getShopifyCredentials = (): ShopifyCredentials | null => {
  const credentials = localStorage.getItem("shopify_credentials");
  if (!credentials) return null;
  
  try {
    return JSON.parse(credentials) as ShopifyCredentials;
  } catch (e) {
    console.error("Failed to parse Shopify credentials:", e);
    return null;
  }
};

// Clear Shopify credentials (for logout/disconnect)
export const clearShopifyCredentials = (): void => {
  localStorage.removeItem("shopify_credentials");
};

// Initialize OAuth flow - redirects to Shopify auth page
export const initiateShopifyAuth = (credentials: ShopifyCredentials): void => {
  const { apiKey, shopDomain } = credentials;
  
  // Define required scopes
  const scopes = "write_products,read_products";
  
  // Create redirect URI - this should be your app's callback endpoint
  const redirectUri = `${window.location.origin}/shopify-callback`;
  
  // Build the authorization URL
  const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  // Redirect to Shopify authorization page
  window.location.href = authUrl;
};

// Exchange temporary code for permanent access token
export const exchangeCodeForToken = async (
  code: string,
  credentials: ShopifyCredentials
): Promise<string | null> => {
  const { apiKey, apiSecretKey, shopDomain } = credentials;
  
  // We'll use a CORS proxy for this client-side implementation
  // In production, this should be handled server-side
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  
  try {
    const response = await fetch(`${corsProxy}https://${shopDomain}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": window.location.origin
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecretKey,
        code
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to exchange code for token:", error);
    toast.error("Failed to complete Shopify authentication");
    return null;
  }
};

// Upload an image to Shopify as a product image
export const uploadImageToShopify = async (
  imageUrl: string,
  title: string
): Promise<boolean> => {
  const credentials = getShopifyCredentials();
  if (!credentials || !credentials.accessToken) {
    toast.error("Shopify credentials not found");
    return false;
  }
  
  const { shopDomain, accessToken } = credentials;
  
  // First, create a new product with the image
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  
  try {
    // Create a product with the image
    const response = await fetch(
      `${corsProxy}https://${shopDomain}/admin/api/2025-04/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
          "Origin": window.location.origin
        },
        body: JSON.stringify({
          product: {
            title: title || "Imported Product",
            images: [
              {
                src: imageUrl
              }
            ]
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }
    
    const data = await response.json();
    
    toast.success("Image uploaded to Shopify successfully!");
    return true;
  } catch (error) {
    console.error("Failed to upload image to Shopify:", error);
    toast.error("Failed to upload image to Shopify");
    return false;
  }
};
