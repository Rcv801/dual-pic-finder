
import { ShopifyProduct } from "@/services/shopify";
import { SearchBar } from "./SearchBar";
import { ProductList } from "./ProductList";
import { PaginationControls } from "./PaginationControls";

interface ExistingProductTabProps {
  products: ShopifyProduct[];
  isLoadingProducts: boolean;
  selectedProductId: number | null;
  currentPage: number;
  hasNextPage: boolean;
  searchQuery: string;
  searchInputValue: string;
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
