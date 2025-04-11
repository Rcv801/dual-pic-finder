
import { makeShopifyApiRequest } from './api';

export interface ShopifyCredentials {
  storeDomain: string;
  accessToken: string;
}

// Validate Shopify credentials by attempting to fetch products
export const validateShopifyCredentials = async (credentials: ShopifyCredentials): Promise<boolean> => {
  const { storeDomain, accessToken } = credentials;
  
  console.log(`Validating credentials with store ${storeDomain}`);
  
  try {
    // Just try to fetch a single product to validate credentials
    await makeShopifyApiRequest({
      endpoint: 'products.json?limit=1',
      customDomain: storeDomain,
      customToken: accessToken
    });
    
    // If we get here, the credentials are valid
    console.log('Shopify credentials validated successfully');
    return true;
  } catch (error) {
    console.error('Validation failed:', error);
    return false;
  }
};
