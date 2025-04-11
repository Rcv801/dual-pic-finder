
import { ShopifyProduct } from "@/services/shopify";
import { SearchBar } from "./SearchBar";
import { ProductList } from "./ProductList";
import { PaginationControls } from "./PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExistingProductTabProps {
  products: ShopifyProduct[];
  isLoadingProducts: boolean;
  selectedProductId: number | null;
  currentPage: number;
  hasNextPage: boolean;
  searchQuery: string;
  searchInputValue: string;
  error?: string | null;
  setSelectedProductId: (id: number) => void;
  setSearchInputValue: (value: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  clearSearch: () => void;
  goToPage: (page: number) => void;
  retryLoading?: () => void;
}

export function ExistingProductTab({
  products,
  isLoadingProducts,
  selectedProductId,
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
  retryLoading
}: ExistingProductTabProps) {
  return (
    <div className="space-y-4">
      <SearchBar 
        searchInputValue={searchInputValue}
        onSearchInputChange={setSearchInputValue}
        onSearch={handleSearch}
        onClear={clearSearch}
      />

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div className="w-full">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="flex flex-col space-y-2">
              <span>{error}</span>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  You might need to set up a serverless proxy for this to work reliably
                </p>
                {retryLoading && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={retryLoading}
                    className="ml-2"
                  >
                    <RefreshCcw className="h-3 w-3 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <ProductList 
        products={products}
        isLoading={isLoadingProducts}
        selectedProductId={selectedProductId}
        onSelectProduct={setSelectedProductId}
        searchQuery={searchQuery}
      />

      {(!isLoadingProducts && products.length > 0) && (
        <PaginationControls 
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onPageChange={goToPage}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}
