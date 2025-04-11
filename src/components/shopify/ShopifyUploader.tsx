import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ImageResult } from "@/services/searchService";
import { 
  ShopifyProduct, 
  ShopifyProductsResponse,
  addImageToExistingProduct, 
  fetchShopifyProducts,
  uploadImageToShopify 
} from "@/services/shopifyService";
import { Upload, PlusCircle, Loader2, Search, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);

  const loadProducts = useCallback(async (page: number, query: string) => {
    setIsLoadingProducts(true);
    try {
      const response: ShopifyProductsResponse = await fetchShopifyProducts(page, 50, query);
      setProducts(response.products);
      setHasNextPage(response.hasNextPage);
      
      if (response.products.length > 0 && selectedProductId === null) {
        setSelectedProductId(response.products[0].id);
      }
      
      setTotalProducts(prev => {
        if (page === 1) {
          return response.products.length * (response.hasNextPage ? 2 : 1);
        }
        return prev;
      });
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    loadProducts(1, "");
  }, []);

  useEffect(() => {
    loadProducts(currentPage, searchQuery);
  }, [currentPage, searchQuery, loadProducts]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInputValue);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInputValue("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
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
          <form onSubmit={handleSearch} className="flex space-x-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by title..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchInputValue && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="sm">Search</Button>
          </form>

          {isLoadingProducts ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">
                {searchQuery ? `No products found matching "${searchQuery}"` : "No products found in your Shopify store."}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery ? (
                  <button 
                    onClick={clearSearch} 
                    className="text-blue-500 hover:underline"
                  >
                    Clear search
                  </button>
                ) : (
                  "Try creating a product first or switch to \"Create New Product\"."
                )}
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[200px] rounded-md border p-2">
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
              </ScrollArea>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => goToPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationLink isActive>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                  
                  {hasNextPage && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => goToPage(currentPage + 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
              
              <p className="text-sm text-gray-500">
                {searchQuery ? `Showing results for "${searchQuery}"` : "The image will be added to the selected product."}
              </p>
            </>
          )}
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
