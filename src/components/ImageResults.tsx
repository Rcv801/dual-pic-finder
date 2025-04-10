
import { useState } from "react";
import { ImageResult } from "@/services/searchService";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, AlertCircle, Loader2, Info, Download } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ImageDetailModal from "./ImageDetailModal";
import { toast } from "sonner";

interface ImageResultsProps {
  title: string;
  results: ImageResult[];
  isLoading: boolean;
}

const ImageResults = ({ title, results, isLoading }: ImageResultsProps) => {
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  const handleImageDownload = async (image: ImageResult) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${image.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Image downloaded successfully");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
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
  const allFallbacks = results.every(image => image.isFallback);
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
      
      {allFallbacks && (
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200 mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>
            Currently showing generic images. Live web search requires a valid API key.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {results.map((image) => (
          <Card 
            key={image.id} 
            className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-slide-up ${
              image.isFallback ? 'border-amber-200' : ''
            }`}
          >
            <div 
              className="aspect-square relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.imageUrl}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=2070&auto=format&fit=crop';
                  e.currentTarget.alt = 'Image failed to load';
                }}
              />
              {image.isFallback && (
                <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 rounded-full p-1">
                  <AlertCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            <CardContent className="p-3 space-y-1">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm line-clamp-1">{image.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageDownload(image);
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span>{image.source}</span>
                <ExternalLink className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ImageDetailModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        onDownload={handleImageDownload}
      />
    </div>
  );
};

export default ImageResults;
