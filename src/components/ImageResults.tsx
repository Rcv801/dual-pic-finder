
import { ImageResult } from "@/services/searchService";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, AlertCircle } from "lucide-react";

interface ImageResultsProps {
  title: string;
  results: ImageResult[];
  isLoading: boolean;
}

const ImageResults = ({ title, results, isLoading }: ImageResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <CardContent className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  // Check if all images are fallbacks
  const hasFallbackImages = results.some(image => image.isFallback);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        {hasFallbackImages && (
          <div className="flex items-center text-amber-600 text-sm gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>Using generic images</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((image) => (
          <Card 
            key={image.id} 
            className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-slide-up ${
              image.isFallback ? 'border-amber-200' : ''
            }`}
          >
            <div className="aspect-square relative overflow-hidden">
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {image.isFallback && (
                <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 rounded-full p-1">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            <CardContent className="p-3 space-y-1">
              <h3 className="font-medium text-sm line-clamp-1">{image.title}</h3>
              <div className="flex items-center text-xs text-gray-500">
                <span>{image.source}</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ImageResults;
