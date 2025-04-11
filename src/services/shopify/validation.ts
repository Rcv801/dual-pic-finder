
import { makeShopifyApiRequest, testShopConnection } from './api';

export interface ShopifyCredentials {
  storeDomain: string;
  accessToken: string;
}

// Validate Shopify credentials by attempting to fetch shop info or products
export const validateShopifyCredentials = async (credentials: ShopifyCredentials): Promise<boolean> => {
  const { storeDomain, accessToken } = credentials;
  
  console.log(`Validating credentials with store ${storeDomain}`);
  
  try {
    // First try with shop.json which is a simpler endpoint
    const shopConnected = await testShopConnection(credentials);
    
    if (shopConnected) {
      console.log('Shopify credentials validated successfully using shop.json');
      return true;
    }
    
    // If shop.json fails, try products as a fallback
    await makeShopifyApiRequest({
      endpoint: 'products.json?limit=1',
      customDomain: storeDomain,
      customToken: accessToken
    });
    
    // If we get here, the credentials are valid
    console.log('Shopify credentials validated successfully using products.json');
    return true;
  } catch (error) {
    console.error('Validation failed:', error);
    return false;
  }
};
