import { toast } from "sonner";

// Updated types for Shopify credentials using Direct Token Authentication
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
    // Use CORS proxy to avoid CORS issues
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const targetUrl = `https://${shopDomain}/admin/api/2025-04/shop.json`;
    
    console.log("Testing connection to:", targetUrl);
    
    const response = await fetch(
      `${corsProxy}${targetUrl}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
          "Origin": window.location.origin
        }
      }
    );
    
    if (!response.ok) {
      console.error("Shopify connection test failed:", response.status, await response.text());
      return false;
    }
    
    const data = await response.json();
    console.log("Shopify connection successful:", data);
    return true;
  } catch (error) {
    console.error("Failed to test Shopify connection:", error);
    return false;
  }
};

// Fetch products from Shopify store
export const fetchShopifyProducts = async (): Promise<ShopifyProduct[]> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    toast.error("Shopify credentials not found");
    return [];
  }
  
  const { shopDomain, accessToken } = credentials;
  
  try {
    // Use CORS proxy to avoid CORS issues
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const targetUrl = `https://${shopDomain}/admin/api/2025-04/products.json?limit=50`;
    
    const response = await fetch(
      `${corsProxy}${targetUrl}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
          "Origin": window.location.origin
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Products fetched successfully:", data);
    return data.products || [];
  } catch (error) {
    console.error("Failed to fetch Shopify products:", error);
    toast.error("Failed to fetch products from Shopify");
    return [];
  }
};

// Add image to an existing Shopify product
export const addImageToExistingProduct = async (
  productId: number,
  imageUrl: string
): Promise<boolean> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    toast.error("Shopify credentials not found");
    return false;
  }
  
  const { shopDomain, accessToken } = credentials;
  
  try {
    // Use CORS proxy to avoid CORS issues
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const targetUrl = `https://${shopDomain}/admin/api/2025-04/products/${productId}/images.json`;
    
    const response = await fetch(
      `${corsProxy}${targetUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
          "Origin": window.location.origin
        },
        body: JSON.stringify({
          image: {
            src: imageUrl
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to add image: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Image added successfully:", data);
    
    toast.success("Image added to existing product successfully!");
    return true;
  } catch (error) {
    console.error("Failed to add image to Shopify product:", error);
    toast.error("Failed to add image to Shopify product");
    return false;
  }
};

// Upload an image to Shopify as a product image (keeping for backward compatibility)
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
  
  try {
    // Use CORS proxy to avoid CORS issues
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const targetUrl = `https://${shopDomain}/admin/api/2025-04/products.json`;
    
    const response = await fetch(
      `${corsProxy}${targetUrl}`,
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
    console.log("Upload successful:", data);
    
    toast.success("Image uploaded to Shopify successfully!");
    return true;
  } catch (error) {
    console.error("Failed to upload image to Shopify:", error);
    toast.error("Failed to upload image to Shopify");
    return false;
  }
};
