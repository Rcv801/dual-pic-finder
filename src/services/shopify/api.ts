
import { getProxiedUrl, switchToNextProxy } from './cors';
import { getShopifyCredentials } from './credentials';

export interface ApiRequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  customDomain?: string;
  customToken?: string;
  maxAttempts?: number;
}

// Generic function to make Shopify API requests with proxy fallback
export const makeShopifyApiRequest = async <T>(options: ApiRequestOptions): Promise<T> => {
  const { 
    endpoint, 
    method = 'GET', 
    body = null, 
    customDomain = null, 
    customToken = null,
    maxAttempts = 3
  } = options;
  
  // Get credentials from storage (or use custom ones if provided)
  let credentials;
  
  if (customDomain && customToken) {
    credentials = { storeDomain: customDomain, accessToken: customToken };
  } else {
    credentials = getShopifyCredentials();
    if (!credentials) {
      throw new Error('Shopify credentials not found');
    }
  }

  const { storeDomain, accessToken } = credentials;
  
  // Try all proxies if needed
  let attemptsLeft = maxAttempts;
  let lastError = null;
  
  while (attemptsLeft > 0) {
    try {
      const apiUrl = getProxiedUrl(endpoint, storeDomain);
      
      console.log(`Making Shopify API request to: ${apiUrl} (Attempt ${maxAttempts - attemptsLeft + 1}/${maxAttempts})`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      };
      
      const requestOptions: RequestInit = {
        method,
        headers
      };
      
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(apiUrl, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Shopify API error response:', errorText);
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error in Shopify API request (Attempt ${maxAttempts - attemptsLeft + 1}/${maxAttempts}):`, error);
      lastError = error;
      
      // Try next proxy
      const hasMoreProxies = switchToNextProxy();
      if (!hasMoreProxies) {
        break; // No more proxies to try
      }
      
      attemptsLeft--;
    }
  }
  
  // If we get here, all proxies failed
  throw new Error(`All CORS proxies failed during API request. Last error: ${lastError?.message || 'Unknown error'}`);
};

