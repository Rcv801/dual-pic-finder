import { getShopifyCredentials } from "../credentials";
import { toast } from "sonner";

/**
 * Makes a request to the Shopify GraphQL Admin API
 */
export const executeGraphQLQuery = async (
  query: string,
  variables: Record<string, any> = {}
): Promise<any> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    toast.error("Shopify credentials not found");
    throw new Error("Shopify credentials not found");
  }
  
  const { shopDomain, accessToken } = credentials;
  
  try {
    // Try with the simplified proxy first
    const simplifiedProxyUrl = "/api/shopify-simple";
    const originalProxyUrl = "/api/shopify-proxy";
    
    const requestBody = JSON.stringify({
      shopDomain,
      accessToken,
      targetEndpoint: "graphql.json", // GraphQL endpoint
      method: "POST",
      body: {
        query,
        variables
      },
    });
    
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
      // Add timeout to abort long requests
      signal: AbortSignal.timeout(10000) // 10-second timeout (increased from 3s)
    };
    
    // First try with simplified proxy
    console.log(`Making GraphQL request via simplified proxy: ${simplifiedProxyUrl}`);
    console.log(`Request variables:`, {
      ...variables,
      query: query.substring(0, 100) + "..." // Log truncated query for debugging
    });
    
    let response;
    try {
      response = await fetch(simplifiedProxyUrl, options);
      console.log(`Simplified proxy response status: ${response.status}`);
    } catch (error: any) {
      console.warn(`Failed to fetch using simplified proxy: ${error.message}`);
      console.log("Falling back to original proxy");
      
      try {
        response = await fetch(originalProxyUrl, options);
        console.log(`Original proxy response status: ${response?.status}`);
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
      toast.error("API rate limit exceeded. Please try again later.");
      throw new Error("Shopify API rate limit exceeded");
    }
    
    // Log response headers for debugging
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log("Response headers:", responseHeaders);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`GraphQL API Error (${response.status}):`, errorData);
      throw new Error(`Shopify GraphQL API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    console.log("GraphQL response received:", {
      status: response.status,
      hasData: !!responseData.data,
      hasErrors: !!(responseData.data?.errors || responseData.errors)
    });
    
    // Check for GraphQL errors
    if (responseData.data?.errors || responseData.errors) {
      const errors = responseData.data?.errors || responseData.errors;
      console.error("GraphQL errors:", errors);
      throw new Error(`GraphQL errors: ${errors[0]?.message || JSON.stringify(errors)}`);
    }
    
    // For a successful GraphQL response, the data should be in responseData.data.data
    if (responseData.data && responseData.data.data) {
      return responseData.data.data;
    }
    
    // If we didn't get the expected structure, return what we have
    return responseData.data;
  } catch (error: any) {
    // Detect if this is a timeout error
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      console.error("Shopify GraphQL API request timed out after 10 seconds");
      toast.error("Request to Shopify timed out. Network may be slow.");
      throw new Error("Shopify request timed out");
    }
    
    // Detect CORS errors (this is an approximation since CORS errors don't have a specific type)
    if (error.message && error.message.includes('CORS')) {
      console.error("Possible CORS issue with Shopify API request:", error);
      toast.error("CORS error connecting to Shopify API");
      throw new Error(`Shopify API CORS error: ${error.message}`);
    }
    
    console.error("Shopify GraphQL API request failed:", error);
    throw error;
  }
};

// Create a cache for GraphQL API responses
const graphqlCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache time

// Function that adds caching to GraphQL API requests
export const cachedGraphQLQuery = async (
  query: string,
  variables: Record<string, any> = {},
  forceRefresh: boolean = false
): Promise<any> => {
  const cacheKey = `${query}-${JSON.stringify(variables)}`;
  const cachedResponse = graphqlCache.get(cacheKey);
  
  // Return cached response if valid and not forcing refresh
  if (!forceRefresh && cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_TTL)) {
    console.log(`Using cached GraphQL response for query`);
    return cachedResponse.data;
  }
  
  console.log(`Making fresh GraphQL API request`);
  
  // Make the actual request
  const response = await executeGraphQLQuery(query, variables);
  
  // Cache the response
  graphqlCache.set(cacheKey, {
    data: response,
    timestamp: Date.now()
  });
  
  return response;
};

// Clear the entire GraphQL cache or a specific query
export const clearGraphQLCache = () => {
  graphqlCache.clear();
  console.log("GraphQL cache cleared");
};
