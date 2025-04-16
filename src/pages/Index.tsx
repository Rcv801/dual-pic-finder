import { useState, useEffect } from "react";
import DualSearchForm from "@/components/DualSearchForm";
import ImageResults from "@/components/ImageResults";
import { ImageResult, performMultiSearch } from "@/services/searchService";
import SearchHistory from "@/components/SearchHistory";
import ComparisonView from "@/components/ComparisonView";
import { Button } from "@/components/ui/button";
import { SplitSquareVertical } from "lucide-react";

const MAX_HISTORY_ITEMS = 10;

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ [key: string]: ImageResult[] }>({});
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[][]>([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleSearch = async (products: string[]) => {
    setIsLoading(true);
    
    const validProducts = products.filter(Boolean);
    setSearchTerms(validProducts);
    
    try {
      const results = await performMultiSearch(validProducts);
      setSearchResults(results);
      
      if (Object.keys(results).length > 0) {
        const searchTermsString = JSON.stringify(validProducts.sort());
        
        const isDuplicate = searchHistory.some(
          historyItem => JSON.stringify(historyItem.sort()) === searchTermsString
        );
        
        if (!isDuplicate) {
          setSearchHistory(prev => [
            validProducts,
            ...prev.slice(0, MAX_HISTORY_ITEMS - 1)
          ]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (terms: string[]) => {
    handleSearch(terms);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const getGridCols = () => {
    const resultCount = Object.keys(searchResults).length;
    if (resultCount <= 2) return "lg:grid-cols-2";
    return "lg:grid-cols-2 xl:grid-cols-2";
  };

  const canCompare = Object.keys(searchResults).length > 1;

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <DualSearchForm onSearch={handleSearch} isLoading={isLoading} />
          
          <div className="flex gap-2 self-end">
            <SearchHistory 
              history={searchHistory}
              onSelectHistory={handleSelectHistory}
              onClearHistory={handleClearHistory}
            />
            
            {canCompare && (
              <Button 
                variant="default"
                size="sm"
                onClick={() => setIsComparing(true)}
                className="gap-2"
              >
                <SplitSquareVertical className="h-4 w-4" />
                Compare
              </Button>
            )}
          </div>
        </div>
        
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

      {isComparing && (
        <ComparisonView 
          searchResults={searchResults}
          onExit={() => setIsComparing(false)}
        />
      )}

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
