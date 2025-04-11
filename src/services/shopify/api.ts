
import { toast } from "sonner";
import { ShopifyCredentials, ShopifyProductsResponse } from "./types";
import { getShopifyCredentials } from "./credentials";

// Base function to make authenticated Shopify API requests
export const makeShopifyRequest = async (
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<any> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    toast.error("Shopify credentials not found");
    throw new Error("Shopify credentials not found");
  }
  
  const { shopDomain, accessToken } = credentials;
  
  try {
    // Use CORS proxy to avoid CORS issues
    const corsProxy = "https://cors-anywhere.herokuapp.com/";
    const targetUrl = `https://${shopDomain}/admin/api/2025-04/${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
        "Origin": window.location.origin
      }
    };
    
    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${corsProxy}${targetUrl}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      throw new Error(`Shopify API request failed: ${response.status}`);
    }
    
    return {
      data: await response.json(),
      headers: response.headers
    };
  } catch (error) {
    console.error("Shopify API request failed:", error);
    throw error;
  }
};
