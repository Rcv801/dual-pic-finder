
import { useState } from "react";

export function useShopifyPagination() {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const goToPage = (page: number) => {
    if (page < 1) return;
    console.log(`Navigating to page ${page}`);
    setCurrentPage(page);
  };

  return {
    currentPage,
    hasNextPage,
    totalProducts,
    setCurrentPage,
    setHasNextPage,
    setTotalProducts,
    goToPage,
  };
}
