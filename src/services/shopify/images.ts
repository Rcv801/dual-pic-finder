import { toast } from "sonner";
import { makeShopifyRequest } from "./api";

// Add image to an existing Shopify product
export const addImageToExistingProduct = async (
  productId: number,
  imageUrl: string
): Promise<boolean> => {
  try {
    console.log(`Adding image to product ${productId}: ${imageUrl}`);
    const endpoint = `products/${productId}/images.json`;
    
    // Use object notation to ensure proper JSON structure
    const payload = {
      image: {
        src: imageUrl,
        position: 1,
        alt: "Uploaded from Image Finder"
      }
    };
    
    const result = await makeShopifyRequest(
      endpoint,
      "POST",
      payload
    );
    
    if (!result || !result.data || !result.data.image) {
      throw new Error("Invalid response from Shopify API");
    }
    
    console.log("Image upload response:", result);
    toast.success("Image added to product successfully!");
    
    // Clear any API cache that might be relevant
    clearApiCache();
    
    return true;
  } catch (error) {
    console.error("Failed to add image to Shopify product:", error);
    toast.error("Failed to add image to Shopify product. Please check console for details.");
    return false;
  }
};

// Upload an image to Shopify as a product image (keeping for backward compatibility)
export const uploadImageToShopify = async (
  imageUrl: string,
  title: string
): Promise<boolean> => {
  try {
    console.log(`Creating new product with image: ${imageUrl}`);
    
    // Use object notation to ensure proper JSON structure
    const payload = {
      product: {
        title: title || "Imported Product",
        body_html: "<p>Product imported from Image Finder</p>",
        vendor: "Image Finder",
        product_type: "Imported",
        images: [
          {
            src: imageUrl,
            position: 1,
            alt: "Uploaded from Image Finder"
          }
        ]
      }
    };
    
    const result = await makeShopifyRequest(
      "products.json",
      "POST",
      payload
    );
    
    if (!result || !result.data || !result.data.product) {
      throw new Error("Invalid response from Shopify API");
    }
    
    console.log("Product creation response:", result);
    toast.success("New product with image created successfully!");
    
    // Clear any API cache that might be relevant
    clearApiCache();
    
    return true;
  } catch (error) {
    console.error("Failed to create product with image:", error);
    toast.error("Failed to create product with image. Please check console for details.");
    return false;
  }
};

// Import the clearApiCache function
import { clearApiCache } from "./api";
