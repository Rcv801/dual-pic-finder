
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
    // Use the Vercel serverless proxy endpoint
    const proxyUrl = "/api/shopify-proxy";
    
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shopDomain,
        accessToken,
        targetEndpoint: "graphql.json", // GraphQL endpoint
        method: "POST",
        body: {
          query,
          variables
        },
      }),
    };
    
    console.log("Making GraphQL request to Shopify via proxy");
    
    const response = await fetch(proxyUrl, options);
    
    if (response.status === 429) {
      toast.error("API rate limit exceeded. Please try again later.");
      throw new Error("Shopify API rate limit exceeded");
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`GraphQL API Error (${response.status}):`, errorData);
      throw new Error(`Shopify GraphQL API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const responseData = await response.json();
    
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
  } catch (error) {
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
