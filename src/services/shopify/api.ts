
import { toast } from "sonner";
import { ShopifyCredentials } from "./types";
import { getShopifyCredentials } from "./credentials";

// Base function to make authenticated Shopify API requests with retry logic
export const makeShopifyRequest = async (
  endpoint: string,
  method: string = "GET",
  body?: any,
  retryCount: number = 0
): Promise<any> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    toast.error("Shopify credentials not found");
    throw new Error("Shopify credentials not found");
  }
  
  const { shopDomain, accessToken } = credentials;
  
  try {
    // Use the simplified endpoint first
    const proxyUrl = "/api/shopify-simple";
    console.log(`Making ${method} request to Shopify via simplified proxy: ${endpoint}`);
    
    const options: RequestInit = {
      method: "POST", // Always POST to our proxy
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shopDomain,
        accessToken,
        targetEndpoint: endpoint,
        method,
        body: body || null,
      }),
    };
    
    // Try with simplified proxy first
    let response;
    try {
      response = await fetch(proxyUrl, options);
    } catch (error: any) {
      console.error(`Failed to fetch using simplified proxy: ${error.message}`);
      
      // If simplified proxy fails, try the original proxy
      console.log("Falling back to original proxy...");
      try {
        response = await fetch("/api/shopify-proxy", options);
      } catch (fallbackError: any) {
        console.error(`Both proxy requests failed:`, fallbackError);
        toast.error("Failed to connect to any Shopify API proxy");
        throw new Error(`Shopify proxy connection failed: ${fallbackError.message}`);
      }
    }
    
    if (!response) {
      throw new Error("No response received from proxy");
    }
    
    if (response.status === 429) {
      // Rate limit exceeded - implement exponential backoff
      if (retryCount < 5) {
        const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Rate limited. Retrying in ${backoffTime}ms...`);
        
        // Show toast for first retry only to avoid spam
        if (retryCount === 0) {
          toast.info(`Shopify API rate limited. Retrying in ${backoffTime/1000}s...`);
        }
        
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return makeShopifyRequest(endpoint, method, body, retryCount + 1);
      } else {
        toast.error("API rate limit exceeded. Please try again later.");
        throw new Error("Shopify API rate limit exceeded");
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error (${response.status}):`, errorData);
      throw new Error(`Shopify API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    
    return {
      data: responseData.data,
      headers: new Headers(responseData.headers || {})
    };
  } catch (error) {
    console.error("Shopify API request failed:", error);
    throw error;
  }
};

// Create a cache for API responses
const apiCache = new Map<string, { data: any, timestamp: number, headers: Headers }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache time

// Function that adds caching to API requests
export const cachedShopifyRequest = async (
  endpoint: string,
  method: string = "GET",
  body?: any,
  forceRefresh: boolean = false
): Promise<any> => {
  // Only cache GET requests
  if (method !== "GET") {
    return makeShopifyRequest(endpoint, method, body);
  }
  
  const cacheKey = endpoint;
  const cachedResponse = apiCache.get(cacheKey);
  
  // Return cached response if valid and not forcing refresh
  if (!forceRefresh && cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_TTL)) {
    console.log(`Using cached response for ${endpoint}`);
    return cachedResponse;
  }
  
  console.log(`Making fresh API request for ${endpoint}`);
  
  // Make the actual request
  const response = await makeShopifyRequest(endpoint, method, body);
  
  // Cache the response
  apiCache.set(cacheKey, {
    ...response,
    timestamp: Date.now()
  });
  
  return response;
};

// Clear the entire cache or a specific endpoint
export const clearApiCache = (endpoint?: string) => {
  if (endpoint) {
    apiCache.delete(endpoint);
    console.log(`Cache cleared for endpoint: ${endpoint}`);
  } else {
    apiCache.clear();
    console.log("Complete API cache cleared");
  }
};
