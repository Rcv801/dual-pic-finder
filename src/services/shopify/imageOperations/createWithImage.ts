
import { toast } from "sonner";
import { makeShopifyRequest } from "../api";
import { clearApiCache } from "../api";

export const uploadImageToShopify = async (
  imageUrl: string,
  title: string
): Promise<boolean> => {
  try {
    console.log(`Creating new product with image: ${imageUrl}`);
    
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
    
    console.log("Full product creation response:", JSON.stringify(result));
    
    if (!result || !result.data) {
      console.error("Invalid response structure:", result);
      throw new Error("Invalid response from Shopify API");
    }
    
    if (!result.data.product) {
      console.error("No product data in response:", result.data);
      throw new Error("Product data missing in API response");
    }
    
    console.log("Product creation successful, product ID:", result.data.product.id);
    toast.success("New product with image created successfully!");
    
    clearApiCache();
    
    return true;
  } catch (error) {
    console.error("Failed to create product with image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Failed to create product: ${errorMessage}`);
    return false;
  }
};
