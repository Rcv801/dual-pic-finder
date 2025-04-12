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
    
    // Log the full response for debugging
    console.log("Full image upload response:", JSON.stringify(result));
    
    if (!result || !result.data) {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid response from Shopify API");
    }
    
    // Check if the image data exists in the response
    if (!result.data.image) {
      console.error("No image data in response:", result.data);
      throw new Error("Image data missing in API response");
    }
    
    console.log("Image upload successful, image ID:", result.data.image.id);
    toast.success("Image added to product successfully!");
    
    // Clear any API cache that might be relevant
    clearApiCache();
    
    return true;
  } catch (error) {
    console.error("Failed to add image to Shopify product:", error);
    // More specific error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to add image: ${errorMessage}`);
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
    
    // Log the full response for debugging
    console.log("Full product creation response:", JSON.stringify(result));
    
    if (!result || !result.data) {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid response from Shopify API");
    }
    
    // Check if the product data exists in the response
    if (!result.data.product) {
      console.error("No product data in response:", result.data);
      throw new Error("Product data missing in API response");
    }
    
    console.log("Product creation successful, product ID:", result.data.product.id);
    toast.success("New product with image created successfully!");
    
    // Clear any API cache that might be relevant
    clearApiCache();
    
    return true;
  } catch (error) {
    console.error("Failed to create product with image:", error);
    // More specific error message
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to create product: ${errorMessage}`);
    return false;
  }
};

// Import the clearApiCache function
import { clearApiCache } from "./api";
