import { toast } from "sonner";
import { makeShopifyRequest } from "./api";

// Add image to an existing Shopify product
export const addImageToExistingProduct = async (
  productId: number,
  imageUrl: string
): Promise<boolean> => {
  try {
    const endpoint = `products/${productId}/images.json`;
    
    await makeShopifyRequest(
      endpoint,
      "POST",
      {
        image: {
          src: imageUrl
        }
      }
    );
    
    toast.success("Image added to existing product successfully!");
    return true;
  } catch (error) {
    console.error("Failed to add image to Shopify product:", error);
    toast.error("Failed to add image to Shopify product");
    return false;
  }
};

// Upload an image to Shopify as a product image (keeping for backward compatibility)
export const uploadImageToShopify = async (
  imageUrl: string,
  title: string
): Promise<boolean> => {
  try {
    await makeShopifyRequest(
      "products.json",
      "POST",
      {
        product: {
          title: title || "Imported Product",
          images: [
            {
              src: imageUrl
            }
          ]
        }
      }
    );
    
    toast.success("Image uploaded to Shopify successfully!");
    return true;
  } catch (error) {
    console.error("Failed to upload image to Shopify:", error);
    toast.error("Failed to upload image to Shopify");
    return false;
  }
};
