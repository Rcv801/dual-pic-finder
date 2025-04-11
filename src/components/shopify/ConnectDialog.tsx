
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { saveShopifyCredentials, validateShopifyCredentials } from "@/services/shopifyService";
import { toast } from "sonner";

interface ConnectDialogProps {
  onConnect: () => void;
}

const ConnectDialog = ({ onConnect }: ConnectDialogProps) => {
  const [storeName, setStoreName] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [open, setOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleConnect = async () => {
    if (!storeName.trim() || !accessToken.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Show validation in progress
    setIsValidating(true);

    try {
      // Try to validate the credentials by making a test API call
      const credentials = { 
        storeName: storeName.trim(), 
        accessToken: accessToken.trim() 
      };
      
      const isValid = await validateShopifyCredentials(credentials);
      
      if (isValid) {
        // Save credentials only if they're valid
        saveShopifyCredentials(credentials);
        toast.success("Connected to Shopify store");
        setOpen(false);
        onConnect();
      } else {
        toast.error("Could not connect to Shopify. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect to Shopify. Please check your credentials and try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
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
              disabled={isValidating}
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
              disabled={isValidating}
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
          <Button onClick={handleConnect} disabled={isValidating}>
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              "Connect Store"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
