
import { getShopifyCredentials } from './credentials';
import { getProxiedUrl, switchToNextProxy } from './cors';

export interface ShopifyProduct {
  id: string;
  title: string;
  images: { id: string; src: string; }[];
  image?: { id: string; src: string; };
}

// Fetch products from Shopify with proxy fallback
export const fetchShopifyProducts = async (): Promise<ShopifyProduct[]> => {
  const credentials = getShopifyCredentials();
  if (!credentials) {
    throw new Error('Shopify credentials not found');
  }

  const { storeDomain, accessToken } = credentials;
  
  // Try all proxies if needed
  let attemptsLeft = 3; // Assuming 3 proxies from cors.ts
  let lastError = null;
  
  while (attemptsLeft > 0) {
    try {
      const apiUrl = getProxiedUrl('products.json', storeDomain);
      
      console.log(`Fetching products from: ${apiUrl} (Attempt ${4 - attemptsLeft}/${3})`);
      
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
      console.error(`Error fetching Shopify products (Attempt ${4 - attemptsLeft}/${3}):`, error);
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

  const { storeDomain, accessToken } = credentials;
  
  // Try all proxies if needed
  let attemptsLeft = 3; // Assuming 3 proxies from cors.ts
  let lastError = null;
  
  while (attemptsLeft > 0) {
    try {
      const apiUrl = getProxiedUrl(`products/${productId}/images.json`, storeDomain);
      
      console.log(`Uploading image to product ${productId} (Attempt ${4 - attemptsLeft}/${3})`);
      
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
      console.error(`Error uploading image (Attempt ${4 - attemptsLeft}/${3}):`, error);
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
