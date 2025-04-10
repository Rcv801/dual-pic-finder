
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageResult } from "@/services/searchService";
import { Download, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImageDetailModalProps {
  image: ImageResult | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (image: ImageResult) => void;
}

const ImageDetailModal = ({ image, isOpen, onClose, onDownload }: ImageDetailModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    if (image) {
      setIsLoading(true);
      onDownload(image);
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (image && navigator.share) {
      navigator.share({
        title: image.title,
        text: `Check out this image: ${image.title}`,
        url: image.imageUrl,
      }).catch(error => {
        console.error("Error sharing:", error);
        toast.error("Couldn't share image");
      });
    } else {
      toast.info("Share functionality not supported on this browser");
    }
  };

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{image.title}</DialogTitle>
          <DialogDescription className="flex items-center">
            <span>Source: {image.source}</span>
            <ExternalLink className="ml-1 h-3 w-3" />
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-auto relative">
          <img
            src={image.imageUrl}
            alt={image.title}
            className="object-contain max-h-full w-auto mx-auto"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=2070&auto=format&fit=crop';
              e.currentTarget.alt = 'Image failed to load';
            }}
          />
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            disabled={!navigator.share}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailModal;
