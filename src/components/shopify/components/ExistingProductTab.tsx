
import { ShopifyProduct } from "@/services/shopify";
import { SearchBar } from "./SearchBar";
import { ProductList } from "./ProductList";
import { PaginationControls } from "./PaginationControls";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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
  goToPage
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
          <AlertDescription>{error}</AlertDescription>
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
