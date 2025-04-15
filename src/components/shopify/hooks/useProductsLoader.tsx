
import { useState, useCallback, useEffect } from "react";
import { ShopifyProduct, ShopifyProductsResponse } from "@/services/shopify/types";
import { fetchShopifyProducts, clearPaginationCache } from "@/services/shopify/products";
import { clearApiCache } from "@/services/shopify/api";
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
  const [lastLoadParams, setLastLoadParams] = useState<{page: number, query: string} | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const loadProducts = useCallback(async (page: number, query: string, forceRefresh: boolean = false) => {
    setIsLoadingProducts(true);
    setError(null);
    setLastLoadParams({page, query});
    
    try {
      console.log(`Loading products for page ${page}, query: "${query}"`);
      const isSearchRequest = query.trim().length > 0;
      
      // Set search active flag based on whether there's a query
      setIsSearchActive(isSearchRequest);
      
      // Always force refresh for search queries to avoid stale results
      const response: ShopifyProductsResponse = await fetchShopifyProducts(page, 50, query);
      
      console.log(`Response received: ${response.products.length} products, hasNextPage: ${response.hasNextPage}`);
      
      if (response.products.length > 0) {
        // Update the products state with search results
        setProducts(response.products);
        setHasNextPage(response.hasNextPage);
        
        // Set first product as selected if none is selected yet
        if (selectedProductId === null && response.products.length > 0) {
          setSelectedProductId(response.products[0].id);
        }
        
        setTotalProducts(prev => {
          if (page === 1) {
            return response.products.length * (response.hasNextPage ? 2 : 1);
          }
          return prev;
        });
        
        // For search queries, verify if search results actually match the query
        if (query) {
          const searchTerm = query.toLowerCase();
          const matchingProducts = response.products.filter(p => 
            p.title.toLowerCase().includes(searchTerm)
          );
          
          if (matchingProducts.length === 0 && response.products.length > 0) {
            console.warn(`Warning: None of the returned products contain "${query}" in their title.`);
            console.warn("Shopify search might be using broader match criteria.");
            
            // Show a toast to let the user know about the search results
            toast.info(`No exact matches for "${query}". Showing related products.`, {
              duration: 4000
            });
          }
        }
      } else if (query) {
        // Clear products for search with no results
        console.log(`Search "${query}" returned no products. Clearing product list.`);
        setProducts([]);
        setHasNextPage(false);
        setSelectedProductId(null);
        toast.info(`No products found matching "${query}"`);
      } else if (page === 1) {
        // No products at all in the store
        console.log("No products found in store (empty response)");
        setProducts([]);
        setHasNextPage(false);
        setSelectedProductId(null);
      }
    } catch (error: any) {
      console.error("Error loading products:", error);
      
      // Provide more detailed error information
      let errorMessage = "Failed to load products. ";
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes("rate limit") || error.message.includes("429")) {
          errorMessage += "You've hit API rate limits. ";
        } else if (error.message.includes("CORS") || error.message.includes("Origin")) {
          errorMessage += "CORS proxy service is returning errors. ";
        } else if (error.message.includes("page cannot be passed") || error.message.includes("query cannot be passed")) {
          errorMessage += "Pagination error with search results. ";
          console.error("Pagination + query error details:", error);
          
          // Reset to first page on pagination error
          if (currentPage > 1) {
            setCurrentPage(1);
            return; // Will trigger a re-fetch via useEffect
          }
        }
      }
      
      errorMessage += "Consider setting up a serverless proxy function.";
      setError(errorMessage);
      
      // Show empty state on error
      setProducts([]);
      setHasNextPage(false);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedProductId, currentPage]);

  // Refresh products by forcing a cache refresh
  const refreshProducts = useCallback(() => {
    // Clear caches to force a fresh fetch
    clearPaginationCache();
    clearApiCache();
    
    toast.info("Refreshing product list...");
    
    // Reset to first page
    setCurrentPage(1);
    
    // Force reload with current search query
    loadProducts(1, searchQuery, true);
  }, [searchQuery, loadProducts]);

  // Retry function when API call fails
  const retryLoading = useCallback(() => {
    if (lastLoadParams) {
      // Clear caches to force a fresh fetch
      clearPaginationCache();
      clearApiCache();
      
      // Retry with the last params
      loadProducts(lastLoadParams.page, lastLoadParams.query, true);
      toast.info("Retrying product load...");
    }
  }, [lastLoadParams, loadProducts]);

  // Initial load of products
  useEffect(() => {
    loadProducts(1, "");
  }, []);

  // Load products when page or search query changes
  useEffect(() => {
    console.log(`Effect triggered: page=${currentPage}, query="${searchQuery}"`);
    // Always force refresh for searches to avoid stale results
    loadProducts(currentPage, searchQuery, searchQuery !== "");
  }, [currentPage, searchQuery, loadProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Search submitted: "${searchInputValue}" (current query: "${searchQuery}")`);
    
    if (searchQuery !== searchInputValue) {
      // Reset pagination cache when search query changes
      clearPaginationCache('search');
      clearApiCache(); // Clear API cache as well to force fresh results
      
      setSearchQuery(searchInputValue);
      setCurrentPage(1); // Reset to first page when search changes
      console.log(`Search query updated to: "${searchInputValue}"`);
      
      // Display a toast to indicate search is in progress
      if (searchInputValue) {
        toast.info(`Searching for "${searchInputValue}"...`);
      }
    }
  };

  const clearSearch = () => {
    if (searchQuery !== "") {
      console.log("Clearing search");
      clearPaginationCache();
      clearApiCache(); // Clear API cache to ensure fresh results
      setSearchInputValue("");
      setSearchQuery("");
      setCurrentPage(1); // Reset to first page when search is cleared
      setIsSearchActive(false); // Explicitly set search inactive
      toast.info("Search cleared");
    }
  };

  const goToPage = (page: number) => {
    if (page < 1) return;
    console.log(`Navigating to page ${page}`);
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
