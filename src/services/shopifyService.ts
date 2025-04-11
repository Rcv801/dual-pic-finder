
import { toast } from "sonner";

// Updated types for Shopify credentials using Direct Token Authentication
export interface ShopifyCredentials {
  shopDomain: string; // e.g., "yourstore.myshopify.com"
  accessToken: string; // Admin API Access Token
}

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
  
  // We'll use a CORS proxy for this client-side implementation
  // In production, this should be handled server-side
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  
  try {
    // Try to fetch shop information to verify credentials
    const response = await fetch(
      `${corsProxy}https://${shopDomain}/admin/api/2025-04/shop.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Origin": window.location.origin,
          "X-Shopify-Access-Token": accessToken // Using the Admin API Access Token
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to connect: ${response.status}`);
    }
    
    const data = await response.json();
    return true;
  } catch (error) {
    console.error("Failed to test Shopify connection:", error);
    return false;
  }
};

// Upload an image to Shopify as a product image
export const uploadImageToShopify = async (
  imageUrl: string,
  title: string
): Promise<boolean> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
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
          "X-Shopify-Access-Token": accessToken, // Using the Admin API Access Token
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
