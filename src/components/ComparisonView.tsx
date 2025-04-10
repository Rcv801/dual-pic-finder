
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MultiSearchResults } from "@/services/searchService";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Grid2X2, Maximize, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonViewProps {
  searchResults: MultiSearchResults;
  onExit: () => void;
}

const ComparisonView = ({ searchResults, onExit }: ComparisonViewProps) => {
  const [selectedImages, setSelectedImages] = useState<{[key: string]: number}>({});
  const [layout, setLayout] = useState<"grid" | "fullWidth">("grid");
  
  const productTerms = Object.keys(searchResults);
  
  // When a product has no selection, default to first image
  const ensureSelections = () => {
    const selections = { ...selectedImages };
    productTerms.forEach(term => {
      if (selections[term] === undefined && searchResults[term]?.length > 0) {
        selections[term] = 0;
      }
    });
    return selections;
  };

  const handleImageSelect = (term: string, index: number) => {
    setSelectedImages(prev => ({
      ...prev,
      [term]: index
    }));
  };

  const allSelections = ensureSelections();
  
  // Calculate grid class based on number of products
  const getGridClass = () => {
    const count = productTerms.length;
    switch(count) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 3: return "grid-cols-1 md:grid-cols-3";
      case 4: return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2";
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto flex flex-col">
      <div className="bg-card shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={onExit}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Comparison
        </Button>
        <h2 className="text-xl font-semibold">Image Comparison</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLayout(layout === "grid" ? "fullWidth" : "grid")}
        >
          {layout === "grid" ? (
            <>
              <Maximize className="h-4 w-4 mr-2" />
              Full Width
            </>
          ) : (
            <>
              <Grid2X2 className="h-4 w-4 mr-2" />
              Grid View
            </>
          )}
        </Button>
      </div>

      <div className={cn(
        "p-4 flex-grow", 
        layout === "grid" ? `grid ${getGridClass()} gap-4` : "flex flex-wrap"
      )}>
        {productTerms.map(term => {
          const results = searchResults[term] || [];
          const selectedIndex = allSelections[term] ?? 0;
          const selectedImage = results[selectedIndex];
          
          if (!selectedImage) return null;
          
          return (
            <div 
              key={term}
              className={cn(
                "flex flex-col h-full",
                layout === "fullWidth" && "min-w-full md:min-w-[50%] p-2"
              )}
            >
              <h3 className="text-lg font-medium mb-2">{term}</h3>
              <div className="relative flex-grow mb-2 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="object-contain max-h-[70vh] max-w-full"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=2070&auto=format&fit=crop';
                    e.currentTarget.alt = 'Image failed to load';
                  }}
                />
                {selectedImage.isFallback && (
                  <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 rounded-full p-1">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
              
              <div className="flex overflow-x-auto gap-2 p-1">
                {results.map((image, index) => (
                  <Card
                    key={image.id}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 cursor-pointer overflow-hidden transition-all",
                      selectedIndex === index ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => handleImageSelect(term, index)}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="object-cover w-full h-full"
                    />
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonView;
