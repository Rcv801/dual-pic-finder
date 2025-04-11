
import { getProxiedUrl, switchToNextProxy, getCurrentProxyName } from './cors';
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
    maxAttempts = 4  // Increase default attempts
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
  let errorDetails = [];
  
  while (attemptsLeft > 0) {
    try {
      const apiUrl = getProxiedUrl(endpoint, storeDomain);
      const proxyName = getCurrentProxyName();
      
      console.log(`Making Shopify API request with ${proxyName} to: ${apiUrl} (Attempt ${maxAttempts - attemptsLeft + 1}/${maxAttempts})`);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      };
      
      // Use different fetch options depending on the proxy
      const requestOptions: RequestInit = {
        method,
        headers,
        mode: 'cors',
        credentials: 'omit' // Don't send cookies to avoid CORS preflight issues
      };
      
      if (body) {
        requestOptions.body = JSON.stringify(body);
      }
      
      const response = await fetch(apiUrl, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        const errorMsg = `Shopify API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 150)}`;
        console.error(`Shopify API error response (${response.status}):`, errorText);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('Successful API response:', JSON.stringify(data).substring(0, 150) + '...');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in Shopify API request (Attempt ${maxAttempts - attemptsLeft + 1}/${maxAttempts}):`, error);
      lastError = error;
      errorDetails.push(`Proxy: ${getCurrentProxyName()}, Error: ${errorMessage}`);
      
      // Try next proxy
      const hasMoreProxies = switchToNextProxy();
      attemptsLeft--;
      
      if (attemptsLeft === 0) {
        break; // No more attempts left
      }
      
      // Small delay before trying the next proxy to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // If we get here, all proxies failed
  const detailedError = `All connection methods failed. Errors: ${JSON.stringify(errorDetails)}`;
  console.error(detailedError);
  throw new Error(`All connection methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
};
