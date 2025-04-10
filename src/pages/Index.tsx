
import { useState } from "react";
import DualSearchForm from "@/components/DualSearchForm";
import ImageResults from "@/components/ImageResults";
import { ImageResult, performDualSearch } from "@/services/searchService";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [product1Results, setProduct1Results] = useState<ImageResult[]>([]);
  const [product2Results, setProduct2Results] = useState<ImageResult[]>([]);
  const [searchTerms, setSearchTerms] = useState({ product1: "", product2: "" });

  const handleSearch = async (product1: string, product2: string) => {
    setIsLoading(true);
    setSearchTerms({ product1, product2 });
    
    try {
      const { product1Results, product2Results } = await performDualSearch(product1, product2);
      setProduct1Results(product1Results);
      setProduct2Results(product2Results);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-brand-600 text-center">
            Dual Product Image Finder
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Search for two products at once and compare their images
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <DualSearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(product1Results.length > 0 || isLoading) && (
            <ImageResults
              title={`${searchTerms.product1 || "Product 1"} Images`}
              results={product1Results}
              isLoading={isLoading}
            />
          )}
          
          {(product2Results.length > 0 || isLoading) && (
            <ImageResults
              title={`${searchTerms.product2 || "Product 2"} Images`}
              results={product2Results}
              isLoading={isLoading}
            />
          )}
        </div>
        
        {!isLoading && product1Results.length === 0 && product2Results.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-xl font-medium text-gray-600">
              Enter product names above to find images
            </h2>
            <p className="text-gray-500 mt-2">
              Try searching for "laptop", "smartphone", "headphones", "watch", or "camera"
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Dual Product Image Finder &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Images provided by Unsplash for demonstration purposes</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
