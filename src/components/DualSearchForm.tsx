
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DualSearchFormProps {
  onSearch: (product1: string, product2: string) => void;
  isLoading: boolean;
}

const DualSearchForm = ({ onSearch, isLoading }: DualSearchFormProps) => {
  const [product1, setProduct1] = useState("");
  const [product2, setProduct2] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(product1.trim(), product2.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="product1" className="block text-sm font-medium">
            Product 1
          </label>
          <div className="relative">
            <Input
              id="product1"
              placeholder="e.g., laptop, smartphone"
              value={product1}
              onChange={(e) => setProduct1(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="product2" className="block text-sm font-medium">
            Product 2
          </label>
          <div className="relative">
            <Input
              id="product2"
              placeholder="e.g., headphones, watch"
              value={product2}
              onChange={(e) => setProduct2(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-brand-500 hover:bg-brand-600 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Find Product Images"}
      </Button>
    </form>
  );
};

export default DualSearchForm;
