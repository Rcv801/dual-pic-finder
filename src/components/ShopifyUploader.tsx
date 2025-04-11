
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageResult } from "@/services/searchService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fetchShopifyProducts, uploadImageToShopifyProduct, hasShopifyCredentials } from "@/services/shopifyService";

interface ShopifyProduct {
  id: string;
  title: string;
  images: { id: string; src: string }[];
  image?: { id: string; src: string };
}

interface ShopifyUploaderProps {
  image: ImageResult;
}

const ShopifyUploader = ({ image }: ShopifyUploaderProps) => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!hasShopifyCredentials()) {
      setError("No Shopify credentials found. Please reconnect your store.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const shopifyProducts = await fetchShopifyProducts();
      setProducts(shopifyProducts);
    } catch (err) {
      console.error("Error fetching Shopify products:", err);
      setError("Failed to load products from Shopify. Please check your store connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleUpload = async () => {
    if (!selectedProductId) {
      toast.error("Please select a product first");
      return;
    }

    setIsUploading(true);
    try {
      await uploadImageToShopifyProduct(selectedProductId, image.imageUrl, image.title);
      toast.success("Image uploaded to product successfully");
    } catch (err) {
      toast.error("Failed to upload image to product");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
        <div className="flex items-center text-amber-700 gap-2 mb-4">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadProducts}
          className="w-full flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin mr-2" />
        <span className="text-sm text-gray-500">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="product-select" className="text-sm font-medium">
          Select Product
        </label>
        <Select
          value={selectedProductId}
          onValueChange={setSelectedProductId}
        >
          <SelectTrigger id="product-select">
            <SelectValue placeholder="Choose a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleUpload}
        disabled={!selectedProductId || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload to Shopify
          </>
        )}
      </Button>
    </div>
  );
};

export default ShopifyUploader;
