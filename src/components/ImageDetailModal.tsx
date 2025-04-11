
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageResult } from "@/services/searchService";
import { Download, ExternalLink, Share2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasShopifyCredentials } from "@/services/shopifyService";
import ShopifyUploader from "./shopify/ShopifyUploader";

interface ImageDetailModalProps {
  image: ImageResult | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (image: ImageResult) => void;
}

const ImageDetailModal = ({ image, isOpen, onClose, onDownload }: ImageDetailModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const shopifyConnected = hasShopifyCredentials();

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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
          <TabsList className="mb-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {shopifyConnected && (
              <TabsTrigger value="shopify" className="gap-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                Shopify
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="preview" className="flex-grow overflow-auto relative m-0">
            <img
              src={image.imageUrl}
              alt={image.title}
              className="object-contain max-h-full w-auto mx-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=2070&auto=format&fit=crop';
                e.currentTarget.alt = 'Image failed to load';
              }}
            />
          </TabsContent>
          
          {shopifyConnected && (
            <TabsContent value="shopify" className="m-0 p-4 flex-grow overflow-auto">
              <ShopifyUploader image={image} />
            </TabsContent>
          )}
        </Tabs>
        
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
