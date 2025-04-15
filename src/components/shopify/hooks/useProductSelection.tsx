
import { useState } from "react";
import { ShopifyProduct } from "@/services/shopify/types";

export function useProductSelection() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  return {
    products,
    selectedProductId,
    isLoadingProducts,
    setProducts,
    setSelectedProductId,
    setIsLoadingProducts,
  };
}
