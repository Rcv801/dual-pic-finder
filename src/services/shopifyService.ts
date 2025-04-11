
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

// Helper function to construct API URLs with CORS proxy
const getProxiedUrl = (endpoint: string, storeName: string): string => {
  // Using a free CORS proxy service - consider setting up your own for production
  const corsProxy = 'https://corsproxy.io/?';
  const shopifyApiUrl = `https://${storeName}.myshopify.com/admin/api/2023-07/${endpoint}`;
  return `${corsProxy}${encodeURIComponent(shopifyApiUrl)}`;
};

// Fetch products from Shopify
export const fetchShopifyProducts = async (): Promise<ShopifyProduct[]> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    throw new Error('Shopify credentials not found');
  }

  const { storeName, accessToken } = credentials;
  
  try {
    const apiUrl = getProxiedUrl('products.json', storeName);
    
    console.log(`Fetching products from: ${apiUrl}`);
    
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
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
};

// Upload image to a Shopify product
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
  
  try {
    const apiUrl = getProxiedUrl(`products/${productId}/images.json`, storeName);
    
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
    console.error('Error uploading image to Shopify:', error);
    throw error;
  }
};
