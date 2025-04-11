import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, LogOut, Store, Edit, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  saveShopifyCredentials, 
  clearShopifyCredentials, 
  hasShopifyCredentials,
  getShopifyCredentials,
  updateShopifyCredentials
} from "@/services/shopifyService";
import { toast } from "sonner";

interface ShopifyConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const ShopifyConnect = ({ onConnect, onDisconnect }: ShopifyConnectProps) => {
  const [storeName, setStoreName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [open, setOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(hasShopifyCredentials());
  const [isEditing, setIsEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (isEditing && editDialogOpen) {
      const creds = getShopifyCredentials();
      if (creds) {
        setStoreName(creds.storeName);
        setAccessToken(creds.accessToken);
      }
    }
  }, [isEditing, editDialogOpen]);

  const handleConnect = () => {
    if (!storeName.trim() || !accessToken.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      saveShopifyCredentials({ storeName: storeName.trim(), accessToken: accessToken.trim() });
      setIsConnected(true);
      toast.success("Connected to Shopify store");
      setOpen(false);
      if (onConnect) onConnect();
    } catch (error) {
      toast.error("Failed to save Shopify credentials");
    }
  };

  const handleUpdate = () => {
    if (!storeName.trim()) {
      toast.error("Store name cannot be empty");
      return;
    }

    const currentCreds = getShopifyCredentials();
    if (!currentCreds) {
      toast.error("No existing credentials found");
      return;
    }

    try {
      const newToken = accessToken.trim() || currentCreds.accessToken;
      updateShopifyCredentials({ 
        storeName: storeName.trim(), 
        accessToken: newToken 
      });
      toast.success("Shopify store details updated");
      setEditDialogOpen(false);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update Shopify credentials");
    }
  };

  const handleDisconnect = () => {
    clearShopifyCredentials();
    setIsConnected(false);
    toast.info("Disconnected from Shopify store");
    if (onDisconnect) onDisconnect();
  };

  return (
    <div>
      {!isConnected ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Store className="h-4 w-4" />
              Connect to Shopify
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect to Shopify</DialogTitle>
              <DialogDescription>
                Enter your Shopify store details to connect
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input
                  id="store-name"
                  placeholder="your-store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  The subdomain of your Shopify store (e.g., for store-name.myshopify.com, enter "store-name")
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token</Label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="shpat_xxxx..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Your Shopify Admin API access token
                </p>
              </div>
              <div className="text-xs text-amber-600">
                <p>Note: Your credentials are stored locally in your browser.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleConnect}>Connect Store</Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-600 flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Connected to {getShopifyCredentials()?.storeName}.myshopify.com
            </span>
            <Button variant="ghost" size="icon" onClick={() => {
              setIsEditing(true);
              setEditDialogOpen(true);
            }} className="h-7 w-7 p-0" title="Edit store details">
              <Edit className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Shopify Store</DialogTitle>
                <DialogDescription>
                  Update your Shopify store details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-store-name">Store Name</Label>
                  <Input
                    id="edit-store-name"
                    placeholder="your-store-name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-access-token">Access Token (leave blank to keep current)</Label>
                  <Input
                    id="edit-access-token"
                    type="password"
                    placeholder="Leave blank to keep current token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setEditDialogOpen(false);
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>
                  <Check className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default ShopifyConnect;
