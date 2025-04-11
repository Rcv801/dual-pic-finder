
import { getProxiedUrl, switchToNextProxy } from './cors';

export interface ShopifyCredentials {
  storeDomain: string;
  accessToken: string;
}

// Validate Shopify credentials by attempting to fetch products
export const validateShopifyCredentials = async (credentials: ShopifyCredentials): Promise<boolean> => {
  const { storeDomain, accessToken } = credentials;
  
  // Try all proxies if needed
  let attemptsLeft = 3; // Assuming 3 proxies from cors.ts
  
  while (attemptsLeft > 0) {
    try {
      const apiUrl = getProxiedUrl('products.json?limit=1', storeDomain);
      
      console.log(`Validating credentials with store ${storeDomain} (Attempt ${4 - attemptsLeft}/${3})`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        }
      });

      if (!response.ok) {
        console.error('Validation failed:', response.status, response.statusText);
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      // If we get here, the credentials are valid
      console.log('Shopify credentials validated successfully');
      return true;
    } catch (error) {
      console.error(`Validation error (Attempt ${4 - attemptsLeft}/${3}):`, error);
      
      // Try next proxy
      const hasMoreProxies = switchToNextProxy();
      if (!hasMoreProxies) {
        break; // No more proxies to try
      }
      
      attemptsLeft--;
    }
  }
  
  // If we get here, all proxies failed
  return false;
};
