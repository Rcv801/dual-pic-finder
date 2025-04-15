
import { useState } from "react";
import { clearPaginationCache } from "@/services/shopify/products";
import { clearApiCache } from "@/services/shopify/api";
import { toast } from "sonner";

export function useProductsError() {
  const [error, setError] = useState<string | null>(null);
  const [lastLoadParams, setLastLoadParams] = useState<{page: number, query: string} | null>(null);

  const retryLoading = async (loadProducts: (page: number, query: string, forceRefresh: boolean) => Promise<void>) => {
    if (lastLoadParams) {
      clearPaginationCache();
      clearApiCache();
      await loadProducts(lastLoadParams.page, lastLoadParams.query, true);
      toast.info("Retrying product load...");
    }
  };

  return {
    error,
    setError,
    lastLoadParams,
    setLastLoadParams,
    retryLoading,
  };
}
