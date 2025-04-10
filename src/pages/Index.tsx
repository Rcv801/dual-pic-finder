
import { useState } from "react";
import DualSearchForm from "@/components/DualSearchForm";
import ImageResults from "@/components/ImageResults";
import { ImageResult, performMultiSearch } from "@/services/searchService";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ [key: string]: ImageResult[] }>({});
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const handleSearch = async (products: string[]) => {
    setIsLoading(true);
    
    // Filter out empty strings
    const validProducts = products.filter(Boolean);
    setSearchTerms(validProducts);
    
    try {
      const results = await performMultiSearch(validProducts);
      setSearchResults(results);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate the grid columns based on search result count
  const getGridCols = () => {
    const resultCount = Object.keys(searchResults).length;
    if (resultCount <= 2) return "lg:grid-cols-2";
    return "lg:grid-cols-2 xl:grid-cols-2";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-brand-600 text-center">
            Multi-Product Image Finder
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Search for up to four products at once and compare their images
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <DualSearchForm onSearch={handleSearch} isLoading={isLoading} />
        
        <div className={`grid grid-cols-1 ${getGridCols()} gap-8`}>
          {Object.entries(searchResults).map(([term, results]) => (
            <ImageResults
              key={term}
              title={`${term} Images`}
              results={results}
              isLoading={isLoading}
            />
          ))}
          
          {isLoading && searchTerms.map((term, index) => (
            <ImageResults
              key={`loading-${index}`}
              title={`${term} Images`}
              results={[]}
              isLoading={true}
            />
          ))}
        </div>
        
        {!isLoading && Object.keys(searchResults).length === 0 && (
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
          <p>Multi-Product Image Finder &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Images provided by Unsplash for demonstration purposes</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
