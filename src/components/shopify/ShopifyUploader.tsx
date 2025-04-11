
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageResult } from "@/services/searchService";
import { uploadImageToShopify } from "@/services/shopifyService";
import { Upload } from "lucide-react";

interface ShopifyUploaderProps {
  image: ImageResult;
}

const ShopifyUploader = ({ image }: ShopifyUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [customTitle, setCustomTitle] = useState(image.title || "");

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const success = await uploadImageToShopify(
        image.imageUrl,
        customTitle || image.title
      );
      
      if (!success) {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading to Shopify:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload to Shopify</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Title
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter product title"
          />
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload to Shopify"}
          </Button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        <p>
          This will create a new product in your Shopify store with this image.
        </p>
      </div>
    </div>
  );
};

export default ShopifyUploader;
