
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, RefreshCw, Upload } from "lucide-react";

interface UploadActionButtonsProps {
  isUploading: boolean;
  activeTab: string;
  selectedProductId?: number;
  onUpload: () => void;
  onRefresh: () => void;
}

export const UploadActionButtons = ({
  isUploading,
  activeTab,
  selectedProductId,
  onUpload,
  onRefresh
}: UploadActionButtonsProps) => {
  return (
    <div className="pt-2 flex space-x-2">
      <Button 
        onClick={onUpload} 
        disabled={isUploading || (activeTab === "existing" && !selectedProductId)}
        className="flex-grow gap-2"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : activeTab === "existing" ? (
          <PlusCircle className="h-4 w-4" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isUploading ? "Uploading..." : activeTab === "existing" 
          ? "Add Image to Product" 
          : "Create New Product with Image"}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        title="Refresh Products"
        disabled={isUploading}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};
