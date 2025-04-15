import { useCallback, useEffect } from "react";
import { ShopifyProductsResponse } from "@/services/shopify/types";
import { fetchShopifyProducts, clearAllCaches } from "@/services/shopify/products";
import { toast } from "sonner";

import { useShopifySearch } from "./useShopifySearch";
import { useShopifyPagination } from "./useShopifyPagination";
import { useProductSelection } from "./useProductSelection";
import { useProductsError } from "./useProductsError";

export function useProductsLoader() {
  const {
    searchQuery,
    searchInputValue,
    isSearchActive,
    setSearchInputValue,
    setIsSearchActive,
    handleSearch,
    clearSearch,
  } = useShopifySearch();

  const {
    currentPage,
    hasNextPage,
    totalProducts,
    setCurrentPage,
    setHasNextPage,
    setTotalProducts,
    goToPage,
  } = useShopifyPagination();

  const {
    products,
    selectedProductId,
    isLoadingProducts,
    setProducts,
    setSelectedProductId,
    setIsLoadingProducts,
  } = useProductSelection();

  const {
    error,
    setError,
    lastLoadParams,
    setLastLoadParams,
    retryLoading: baseRetryLoading,
  } = useProductsError();

  const loadProducts = useCallback(async (page: number, query: string, forceRefresh: boolean = false) => {
    setIsLoadingProducts(true);
    setError(null);
    setLastLoadParams({page, query});
    
    try {
      console.log(`Loading products for page ${page}, query: "${query}"`);
      const isSearchRequest = query.trim().length > 0;
      setIsSearchActive(isSearchRequest);
      
      const response: ShopifyProductsResponse = await fetchShopifyProducts(page, 50, query);
      console.log(`Response received: ${response.products.length} products, hasNextPage: ${response.hasNextPage}`);
      
      if (response.products.length > 0) {
        setProducts(response.products);
        setHasNextPage(response.hasNextPage);
        
        if (selectedProductId === null && response.products.length > 0) {
          setSelectedProductId(response.products[0].id);
        }
        
        setTotalProducts(prev => {
          if (page === 1) {
            return response.products.length * (response.hasNextPage ? 2 : 1);
          }
          return prev;
        });
        
        if (query) {
          const searchTerm = query.toLowerCase();
          const matchingProducts = response.products.filter(p => 
            p.title.toLowerCase().includes(searchTerm)
          );
          
          if (matchingProducts.length === 0 && response.products.length > 0) {
            console.warn(`Warning: None of the returned products contain "${query}" in their title.`);
            toast.info(`No exact matches for "${query}". Showing related products.`, {
              duration: 4000
            });
          }
        }
      } else if (query) {
        setProducts([]);
        setHasNextPage(false);
        setSelectedProductId(null);
        toast.info(`No products found matching "${query}"`);
      } else if (page === 1) {
        setProducts([]);
        setHasNextPage(false);
        setSelectedProductId(null);
      }
    } catch (error: any) {
      console.error("Error loading products:", error);
      let errorMessage = "Failed to load products. ";
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes("rate limit")) {
          errorMessage += "You've hit API rate limits. ";
        } else if (error.message.includes("CORS")) {
          errorMessage += "CORS proxy service is returning errors. ";
        } else if (error.message.includes("page cannot be passed") || error.message.includes("GraphQL errors")) {
          errorMessage += "Search pagination error. ";
          if (currentPage > 1) {
            setCurrentPage(1);
            return;
          }
        }
      }
      
      errorMessage += "Consider setting up a serverless proxy function.";
      setError(errorMessage);
      setProducts([]);
      setHasNextPage(false);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedProductId, currentPage, setIsSearchActive]);

  const retryLoading = useCallback(() => {
    baseRetryLoading(loadProducts);
  }, [baseRetryLoading, loadProducts]);

  const refreshProducts = useCallback(() => {
    clearAllCaches();
    toast.info("Refreshing product list...");
    setCurrentPage(1);
    loadProducts(1, searchQuery, true);
  }, [searchQuery, loadProducts, setCurrentPage]);

  useEffect(() => {
    loadProducts(1, "");
  }, []);

  useEffect(() => {
    console.log(`Effect triggered: page=${currentPage}, query="${searchQuery}"`);
    loadProducts(currentPage, searchQuery, searchQuery !== "");
  }, [currentPage, searchQuery, loadProducts]);

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
    isSearchActive,
    setSelectedProductId,
    setSearchInputValue,
    handleSearch,
    clearSearch,
    goToPage,
    retryLoading,
    refreshProducts
  };
}
