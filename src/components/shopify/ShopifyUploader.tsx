
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageResult } from "@/services/searchService";
import { 
  addImageToExistingProduct, 
  uploadImageToShopify 
} from "@/services/shopify";
import { PlusCircle, Loader2, Upload, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useProductsLoader } from "./hooks/useProductsLoader";
import { ExistingProductTab } from "./components/ExistingProductTab";
import { NewProductTab } from "./components/NewProductTab";
import { clearApiCache } from "@/services/shopify/api";

interface ShopifyUploaderProps {
  image: ImageResult;
}

const ShopifyUploader = ({ image }: ShopifyUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [customTitle, setCustomTitle] = useState(image.title || "");
  const [activeTab, setActiveTab] = useState("existing");
  const [uploadStatus, setUploadStatus] = useState<{success: boolean; message: string} | null>(null);
  
  const { 
    products,
    selectedProductId,
    isLoadingProducts,
    currentPage,
    hasNextPage,
    searchQuery,
    searchInputValue,
    error,
    setSelectedProductId,
    setSearchInputValue,
    handleSearch,
    clearSearch,
    goToPage,
    retryLoading,
    refreshProducts
  } = useProductsLoader();

  const handleRefresh = () => {
    clearApiCache();
    refreshProducts();
    setUploadStatus(null);
  };

  const handleUploadToNew = async () => {
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const success = await uploadImageToShopify(
        image.imageUrl,
        customTitle || image.title
      );
      
      if (success) {
        setUploadStatus({
          success: true,
          message: "New product created successfully! It may take a few minutes to appear in your Shopify store."
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading to Shopify:", error);
      setUploadStatus({
        success: false,
        message: "Failed to create product. Please check console for details."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddToExisting = async () => {
    if (!selectedProductId) return;
    
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const success = await addImageToExistingProduct(
        selectedProductId,
        image.imageUrl
      );
      
      if (success) {
        setUploadStatus({
          success: true,
          message: "Image added to product successfully! It may take a few minutes to appear in your Shopify store."
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error adding image to product:", error);
      setUploadStatus({
        success: false,
        message: "Failed to add image to product. Please check console for details."
      });
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
        
        <TabsContent value="existing">
          <ExistingProductTab 
            products={products}
            isLoadingProducts={isLoadingProducts}
            selectedProductId={selectedProductId}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            searchQuery={searchQuery}
            searchInputValue={searchInputValue}
            error={error}
            setSelectedProductId={setSelectedProductId}
            setSearchInputValue={setSearchInputValue}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            goToPage={goToPage}
            retryLoading={retryLoading}
          />
        </TabsContent>
        
        <TabsContent value="new">
          <NewProductTab 
            customTitle={customTitle}
            setCustomTitle={setCustomTitle}
          />
        </TabsContent>
      </Tabs>
      
      {uploadStatus && (
        <Alert variant={uploadStatus.success ? "default" : "destructive"}>
          <AlertDescription>
            {uploadStatus.message}
          </AlertDescription>
        </Alert>
      )}
      
      <Separator className="my-4" />
      
      <div className="pt-2 flex space-x-2">
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || (activeTab === "existing" && !selectedProductId)}
          className="flex-grow gap-2"
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
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          title="Refresh Products"
          disabled={isUploading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ShopifyUploader;
