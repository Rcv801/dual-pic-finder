
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImageResult } from "@/services/searchService";
import { 
  ShopifyProduct, 
  addImageToExistingProduct, 
  fetchShopifyProducts,
  uploadImageToShopify 
} from "@/services/shopifyService";
import { Upload, PlusCircle, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShopifyUploaderProps {
  image: ImageResult;
}

const ShopifyUploader = ({ image }: ShopifyUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [customTitle, setCustomTitle] = useState(image.title || "");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const fetchedProducts = await fetchShopifyProducts();
        setProducts(fetchedProducts);
        if (fetchedProducts.length > 0) {
          setSelectedProductId(fetchedProducts[0].id);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const handleUploadToNew = async () => {
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

  const handleAddToExisting = async () => {
    if (!selectedProductId) return;
    
    setIsUploading(true);
    try {
      const success = await addImageToExistingProduct(
        selectedProductId,
        image.imageUrl
      );
      
      if (!success) {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error adding image to product:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = () => {
    if (activeTab === "existing") {
      handleAddToExisting();
    } else {
      handleUploadToNew();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload to Shopify</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="existing">Add to Existing Product</TabsTrigger>
          <TabsTrigger value="new">Create New Product</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="space-y-4">
          {isLoadingProducts ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No products found in your Shopify store.</p>
              <p className="text-sm text-gray-400 mt-1">
                Try creating a product first or switch to "Create New Product".
              </p>
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
              <RadioGroup
                value={selectedProductId?.toString()}
                onValueChange={(value) => setSelectedProductId(Number(value))}
              >
                {products.map((product) => (
                  <div key={product.id} className="flex items-start space-x-2 py-2">
                    <RadioGroupItem value={product.id.toString()} id={`product-${product.id}`} />
                    <div className="grid gap-1.5">
                      <Label htmlFor={`product-${product.id}`} className="font-medium">
                        {product.title}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            The image will be added to the selected product.
          </p>
        </TabsContent>
        
        <TabsContent value="new" className="space-y-3">
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
          
          <p className="text-sm text-gray-500">
            This will create a new product in your Shopify store with this image.
          </p>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-4" />
      
      <div className="pt-2">
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || (activeTab === "existing" && !selectedProductId)}
          className="w-full gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : activeTab === "existing" ? (
            <PlusCircle className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Uploading..." : activeTab === "existing" 
            ? "Add Image to Product" 
            : "Create New Product with Image"}
        </Button>
      </div>
    </div>
  );
};

export default ShopifyUploader;
