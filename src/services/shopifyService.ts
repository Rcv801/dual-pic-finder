
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

// Update existing credentials
export const updateShopifyCredentials = (credentials: ShopifyCredentials): void => {
  saveShopifyCredentials(credentials);
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

// Fetch products from Shopify
export const fetchShopifyProducts = async (): Promise<ShopifyProduct[]> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    throw new Error('Shopify credentials not found');
  }

  const { storeName, accessToken } = credentials;
  
  try {
    const response = await fetch(
      `https://${storeName}.myshopify.com/admin/api/2023-07/products.json`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.products;
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
    const response = await fetch(
      `https://${storeName}.myshopify.com/admin/api/2023-07/products/${productId}/images.json`,
      {
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
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error uploading image to Shopify:', error);
    throw error;
  }
};
