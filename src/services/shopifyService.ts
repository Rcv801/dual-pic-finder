
interface ShopifyCredentials {
  storeName: string;
  accessToken: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  images: { id: string; src: string; }[];
  image?: { id: string; src: string; };
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

// Available CORS proxies to try (in order of preference)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];

// Track which proxy is currently working
let currentProxyIndex = 0;

// Helper function to construct API URLs with CORS proxy
const getProxiedUrl = (endpoint: string, storeName: string): string => {
  const shopifyApiUrl = `https://${storeName}.myshopify.com/admin/api/2023-07/${endpoint}`;
  
  // Use the current proxy
  const corsProxy = CORS_PROXIES[currentProxyIndex];
  
  // Different proxies use different URL formats
  if (corsProxy === 'https://api.allorigins.win/raw?url=') {
    return `${corsProxy}${encodeURIComponent(shopifyApiUrl)}`;
  }
  
  return `${corsProxy}${encodeURIComponent(shopifyApiUrl)}`;
};

// Try the next proxy in the list
const switchToNextProxy = (): boolean => {
  if (currentProxyIndex < CORS_PROXIES.length - 1) {
    currentProxyIndex++;
    console.log(`Switching to next CORS proxy: ${CORS_PROXIES[currentProxyIndex]}`);
    return true;
  }
  // Reset to first proxy for next attempt
  currentProxyIndex = 0;
  return false;
};

// Fetch products from Shopify with proxy fallback
export const fetchShopifyProducts = async (): Promise<ShopifyProduct[]> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    throw new Error('Shopify credentials not found');
  }

  const { storeName, accessToken } = credentials;
  
  // Try all proxies if needed
  let attemptsLeft = CORS_PROXIES.length;
  let lastError = null;
  
  while (attemptsLeft > 0) {
    try {
      const apiUrl = getProxiedUrl('products.json', storeName);
      
      console.log(`Fetching products from: ${apiUrl} (Attempt ${CORS_PROXIES.length - attemptsLeft + 1}/${CORS_PROXIES.length})`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Shopify API error response:', errorText);
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.products?.length || 0} products`);
      return data.products || [];
    } catch (error) {
      console.error(`Error fetching Shopify products with proxy ${currentProxyIndex + 1}/${CORS_PROXIES.length}:`, error);
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
  throw new Error(`All CORS proxies failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

// Upload image to a Shopify product with proxy fallback
export const uploadImageToShopifyProduct = async (
  productId: string,
  imageUrl: string,
  imageAlt: string
): Promise<boolean> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    throw new Error('Shopify credentials not found');
  }

  const { storeName, accessToken } = credentials;
  
  // Try all proxies if needed
  let attemptsLeft = CORS_PROXIES.length;
  let lastError = null;
  
  while (attemptsLeft > 0) {
    try {
      const apiUrl = getProxiedUrl(`products/${productId}/images.json`, storeName);
      
      console.log(`Uploading image to product ${productId} via proxy ${currentProxyIndex + 1}/${CORS_PROXIES.length}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        },
        body: JSON.stringify({
          image: {
            src: imageUrl,
            alt: imageAlt
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Shopify API upload error:', errorText);
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Image uploaded successfully:', data);
      return true;
    } catch (error) {
      console.error(`Error uploading image with proxy ${currentProxyIndex + 1}/${CORS_PROXIES.length}:`, error);
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
  throw new Error(`All CORS proxies failed during image upload. Last error: ${lastError?.message || 'Unknown error'}`);
};
