
import { makeShopifyApiRequest } from './api';

export interface ShopifyProduct {
  id: string;
  title: string;
  images: { id: string; src: string; }[];
  image?: { id: string; src: string; };
}

// Fetch products from Shopify
export const fetchShopifyProducts = async (): Promise<ShopifyProduct[]> => {
  try {
    const data = await makeShopifyApiRequest<{ products: ShopifyProduct[] }>({
      endpoint: 'products.json'
    });
    
    console.log(`Successfully fetched ${data.products?.length || 0} products`);
    return data.products || [];
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error; // Re-throw to let caller handle it
  }
};

// Upload image to a Shopify product
export const uploadImageToShopifyProduct = async (
  productId: string,
  imageUrl: string,
  imageAlt: string
): Promise<boolean> => {
  try {
    const data = await makeShopifyApiRequest({
      endpoint: `products/${productId}/images.json`,
      method: 'POST',
      body: {
        image: {
          src: imageUrl,
          alt: imageAlt
        }
      }
    });
    
    console.log('Image uploaded successfully:', data);
    return true;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error; // Re-throw to let caller handle it
  }
};
