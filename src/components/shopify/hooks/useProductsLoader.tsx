
import { useState, useCallback, useEffect } from "react";
import { ShopifyProduct, ShopifyProductsResponse } from "@/services/shopify/types";
import { fetchShopifyProducts, clearPaginationCache } from "@/services/shopify/products";
import { toast } from "sonner";

export function useProductsLoader() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (page: number, query: string) => {
    setIsLoadingProducts(true);
    setError(null);
    
    try {
      console.log(`Loading products for page ${page}, query: ${query}`);
      const response: ShopifyProductsResponse = await fetchShopifyProducts(page, 50, query);
      
      if (response.products.length > 0) {
        setProducts(response.products);
        setHasNextPage(response.hasNextPage);
        
        // Set first product as selected if none is selected yet
        if (selectedProductId === null) {
          setSelectedProductId(response.products[0].id);
        }
        
        setTotalProducts(prev => {
          if (page === 1) {
            return response.products.length * (response.hasNextPage ? 2 : 1);
          }
          return prev;
        });
      } else if (query) {
        // Clear products for search with no results
        setProducts([]);
        setHasNextPage(false);
        toast.info(`No products found matching "${query}"`);
      } else if (page === 1) {
        // No products at all in the store
        setProducts([]);
        setHasNextPage(false);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Failed to load products. You may have reached the API rate limit. Please try again later.");
      // Show empty state on error
      setProducts([]);
      setHasNextPage(false);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedProductId]);

  // Initial load of products
  useEffect(() => {
    loadProducts(1, "");
  }, []);

  // Load products when page or search query changes
  useEffect(() => {
    loadProducts(currentPage, searchQuery);
  }, [currentPage, searchQuery, loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery !== searchInputValue) {
      // Reset pagination cache when search query changes
      clearPaginationCache();
      setSearchQuery(searchInputValue);
      setCurrentPage(1); // Reset to first page when search changes
    }
  };

  const clearSearch = () => {
    if (searchQuery !== "") {
      clearPaginationCache();
      setSearchInputValue("");
      setSearchQuery("");
      setCurrentPage(1); // Reset to first page when search is cleared
    }
  };

  const goToPage = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
  };

  return {
    products,
    selectedProductId,
    isLoadingProducts,
    currentPage,
    hasNextPage,
    searchQuery,
    searchInputValue,
    totalProducts,
    error,
    setSelectedProductId,
    setSearchInputValue,
    handleSearch,
    clearSearch,
    goToPage
  };
}
