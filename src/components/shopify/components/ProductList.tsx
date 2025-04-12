
import { Loader2 } from "lucide-react";
import { ShopifyProduct } from "@/services/shopify";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductListProps {
  products: ShopifyProduct[];
  isLoading: boolean;
  selectedProductId: number | null;
  onSelectProduct: (productId: number) => void;
  searchQuery: string;
}

export function ProductList({
  products,
  isLoading,
  selectedProductId,
  onSelectProduct,
  searchQuery
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">
          {searchQuery ? `No products found matching "${searchQuery}"` : "No products found in your Shopify store."}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {searchQuery 
            ? "Try different search terms or use partial words"
            : "Try creating a product first or switch to \"Create New Product\"."
          }
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[200px] rounded-md border p-2">
      <RadioGroup
        value={selectedProductId?.toString()}
        onValueChange={(value) => onSelectProduct(Number(value))}
      >
        {products.map((product) => (
          <div key={product.id} className="flex items-start space-x-2 py-2">
            <RadioGroupItem value={product.id.toString()} id={`product-${product.id}`} />
            <div className="grid gap-1.5">
              <Label htmlFor={`product-${product.id}`} className="font-medium">
                {product.title}
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </ScrollArea>
  );
}
