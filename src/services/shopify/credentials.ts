
interface ShopifyCredentials {
  storeDomain: string;
  accessToken: string;
}

// Store credentials in localStorage
export const saveShopifyCredentials = (credentials: ShopifyCredentials): void => {
  localStorage.setItem('shopifyCredentials', JSON.stringify(credentials));
};

// Retrieve credentials from localStorage
export const getShopifyCredentials = (): ShopifyCredentials | null => {
  const credentials = localStorage.getItem('shopifyCredentials');
  if (credentials) {
    try {
      return JSON.parse(credentials);
    } catch (e) {
      console.error('Failed to parse Shopify credentials:', e);
    }
  }
  return null;
};

// Clear credentials from localStorage
export const clearShopifyCredentials = (): void => {
  localStorage.removeItem('shopifyCredentials');
};

// Check if credentials exist
export const hasShopifyCredentials = (): boolean => {
  return !!getShopifyCredentials();
};
