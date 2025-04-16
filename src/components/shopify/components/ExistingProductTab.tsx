
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
  refreshProducts?: () => void;
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
  retryLoading,
  refreshProducts
}: ExistingProductTabProps) {
  // Detect the type of error to show more specific guidance
  const getErrorActions = () => {
    if (!error) return null;
    
    const isTimeoutError = error.includes('timed out');
    const isCorsError = error.includes('CORS');
    const isRateLimitError = error.includes('rate limit');
    const isProxyError = error.includes('proxy');
    
    return (
      <div className="flex flex-col gap-2 mt-3">
        {isTimeoutError && (
          <p className="text-xs text-gray-500">
            The request to Shopify timed out. This could be due to slow network conditions or a Shopify API delay.
          </p>
        )}
        
        {isCorsError && (
          <p className="text-xs text-gray-500">
            A CORS error occurred. This happens when your browser blocks the request for security reasons.
          </p>
        )}
        
        {isRateLimitError && (
          <p className="text-xs text-gray-500">
            You've reached Shopify's API rate limits. Please wait a few minutes before trying again.
          </p>
        )}
        
        {isProxyError && (
          <p className="text-xs text-gray-500">
            The serverless proxy function may not be properly deployed or configured.
          </p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => window.open('https://dual-pic-finder.vercel.app/api/shopify-proxy', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Test Proxy
          </Button>
          
          <div className="flex space-x-2">
            {refreshProducts && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshProducts}
                className="text-xs"
              >
                <RefreshCcw className="h-3 w-3 mr-2" />
                Refresh Cache
              </Button>
            )}
            
            {retryLoading && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={retryLoading}
                className="text-xs"
              >
                <RefreshCcw className="h-3 w-3 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

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
              {getErrorActions()}
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
        isSearchActive={searchQuery.length > 0}
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
