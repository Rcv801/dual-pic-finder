
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import ConnectDialog from "./ConnectDialog";
import { hasShopifyCredentials, clearShopifyCredentials } from "@/services/shopifyService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ShopifyConnect = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Check credentials on initial load and when dialog closes
  const checkConnection = () => {
    setIsConnected(hasShopifyCredentials());
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleDisconnect = () => {
    clearShopifyCredentials();
    setIsConnected(false);
    toast.success("Disconnected from Shopify");
  };

  return (
    <>
      {isConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Shopify
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDisconnect}>
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsDialogOpen(true)} 
          className="gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Connect Shopify
        </Button>
      )}

      <ConnectDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onConnected={checkConnection}
      />
    </>
  );
};

export default ShopifyConnect;
