
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2 } from "lucide-react";

interface MultiSearchFormProps {
  onSearch: (products: string[]) => void;
  isLoading: boolean;
}

const DualSearchForm = ({ onSearch, isLoading }: MultiSearchFormProps) => {
  // Start with just one product field
  const [products, setProducts] = useState<string[]>([""]); 

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(products.map(p => p.trim()));
  };

  const updateProduct = (index: number, value: string) => {
    const newProducts = [...products];
    newProducts[index] = value;
    setProducts(newProducts);
  };

  const addProduct = () => {
    if (products.length < 4) {
      setProducts([...products, ""]);
    }
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      const newProducts = [...products];
      newProducts.splice(index, 1);
      setProducts(newProducts);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {products.map((product, index) => (
          <div key={index} className="space-y-2 relative">
            <label htmlFor={`product${index + 1}`} className="block text-sm font-medium">
              Product {index + 1}
            </label>
            <div className="relative">
              <Input
                id={`product${index + 1}`}
                placeholder={`e.g., product ${index + 1}`}
                value={product}
                onChange={(e) => updateProduct(index, e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between">
        {products.length < 4 && (
          <Button 
            type="button" 
            variant="outline"
            onClick={addProduct}
            disabled={isLoading || products.length >= 4}
            className="text-brand-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product ({products.length}/4)
          </Button>
        )}
        {products.length >= 4 && (
          <span className="text-xs text-gray-500 italic mt-2">
            Maximum of 4 products reached
          </span>
        )}
        <Button 
          type="submit" 
          className="bg-brand-500 hover:bg-brand-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Find Product Images"}
        </Button>
      </div>
    </form>
  );
};

export default DualSearchForm;
