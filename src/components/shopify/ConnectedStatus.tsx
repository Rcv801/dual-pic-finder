
import { Button } from "@/components/ui/button";
import { ShoppingBag, XCircle } from "lucide-react";
import { clearShopifyCredentials, getShopifyCredentials } from "@/services/shopifyService";
import { toast } from "sonner";

interface ConnectedStatusProps {
  onDisconnect: () => void;
}

const ConnectedStatus = ({ onDisconnect }: ConnectedStatusProps) => {
  const handleDisconnect = () => {
    clearShopifyCredentials();
    toast.info("Disconnected from Shopify store");
    onDisconnect();
  };

  const credentials = getShopifyCredentials();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-green-600 flex items-center gap-1">
        <ShoppingBag className="h-4 w-4" />
        Connected to {credentials?.storeDomain}
      </span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDisconnect}
        className="text-red-500 hover:text-red-700 hover:bg-red-100 gap-1"
        title="Disconnect from Shopify"
      >
        <XCircle className="h-4 w-4" />
        Disconnect
      </Button>
    </div>
  );
};

export default ConnectedStatus;
