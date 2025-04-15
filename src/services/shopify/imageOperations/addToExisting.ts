
import { toast } from "sonner";
import { makeShopifyRequest } from "../api";
import { clearApiCache } from "../api";
import { clearGraphQLCache } from "../graphql/client";

export const addImageToExistingProduct = async (
  productId: number,
  imageUrl: string
): Promise<boolean> => {
  try {
    console.log(`Adding image to product ${productId}: ${imageUrl}`);
    const endpoint = `products/${productId}/images.json`;
    
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
    
    console.log("Full image upload response:", JSON.stringify(result));
    
    if (!result || !result.data) {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid response from Shopify API");
    }
    
    if (!result.data.image) {
      console.error("No image data in response:", result.data);
      throw new Error("Image data missing in API response");
    }
    
    console.log("Image upload successful, image ID:", result.data.image.id);
    toast.success("Image added to product successfully!");
    
    // Clear both REST and GraphQL caches
    clearApiCache();
    clearGraphQLCache();
    
    return true;
  } catch (error) {
    console.error("Failed to add image to Shopify product:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to add image: ${errorMessage}`);
    return false;
  }
};
