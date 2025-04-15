
import { useState } from "react";
import { toast } from "sonner";
import { clearPaginationCache } from "@/services/shopify/products";
import { clearApiCache } from "@/services/shopify/api";

export function useShopifySearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Search submitted: "${searchInputValue}" (current query: "${searchQuery}")`);
    
    if (searchQuery !== searchInputValue) {
      // Reset pagination cache when search query changes
      clearPaginationCache('search');
      clearApiCache(); // Clear API cache as well to force fresh results
      
      setSearchQuery(searchInputValue);
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
      clearApiCache();
      setSearchInputValue("");
      setSearchQuery("");
      setIsSearchActive(false);
      toast.info("Search cleared");
    }
  };

  return {
    searchQuery,
    searchInputValue,
    isSearchActive,
    setSearchInputValue,
    setIsSearchActive,
    handleSearch,
    clearSearch,
  };
}
