
import { toast } from "sonner";
import { ShopifyCredentials } from "./types";

// Check if we have stored Shopify credentials
export const hasShopifyCredentials = (): boolean => {
  const credentials = localStorage.getItem("shopify_credentials");
  if (!credentials) return false;
  
  try {
    const parsed = JSON.parse(credentials) as ShopifyCredentials;
    return !!(parsed.shopDomain && parsed.accessToken);
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

// Test the Shopify connection by making a simple API call
export const testShopifyConnection = async (credentials: ShopifyCredentials): Promise<boolean> => {
  const { shopDomain, accessToken } = credentials;
  
  try {
    // Use our Vercel serverless proxy instead of direct CORS proxy
    const proxyUrl = "https://dual-pic-finder.vercel.app/api/shopify-proxy";
    
    console.log("Testing connection to Shopify shop:", shopDomain);
    
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shopDomain,
        accessToken,
        targetEndpoint: "shop.json",
        method: "GET",
        body: null,
      }),
    });
    
    if (!response.ok) {
      console.error("Shopify connection test failed:", response.status, await response.text());
      return false;
    }
    
    const responseData = await response.json();
    console.log("Shopify connection successful:", responseData.data);
    return true;
  } catch (error) {
    console.error("Failed to test Shopify connection:", error);
    return false;
  }
};
