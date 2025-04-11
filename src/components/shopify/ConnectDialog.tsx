
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShopifyCredentials, storeShopifyCredentials, testShopifyConnection } from "@/services/shopifyService";
import { toast } from "sonner";

interface ConnectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}

// Use only the access token for authentication, shop domain is hardcoded
interface ShopifyConnectFormData {
  accessToken: string;
}

const ConnectDialog = ({ isOpen, onOpenChange, onConnected }: ConnectDialogProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ShopifyConnectFormData>();

  const onSubmit = async (data: ShopifyConnectFormData) => {
    try {
      setIsConnecting(true);
      
      // Use the hardcoded shop domain as specified
      const shopDomain = "8oasis.myshopify.com";
      
      // Prepare credentials
      const credentials: ShopifyCredentials = {
        shopDomain,
        accessToken: data.accessToken
      };
      
      // Test connection before saving
      const isConnected = await testShopifyConnection(credentials);
      
      if (isConnected) {
        // Save credentials
        storeShopifyCredentials(credentials);
        toast.success("Successfully connected to Shopify!");
        
        // Call the onConnected callback if provided
        if (onConnected) {
          onConnected();
        }
        
        onOpenChange(false); // Close the dialog
      } else {
        toast.error("Failed to connect to Shopify. Please check your Admin API Access Token.");
      }
    } catch (error) {
      console.error("Error connecting to Shopify:", error);
      toast.error("Failed to connect to Shopify");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to Shopify</DialogTitle>
          <DialogDescription>
            Enter your Admin API Access Token to connect to your Shopify store
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shopDomain">Shop URL</Label>
            <Input
              id="shopDomain"
              value="8oasis.myshopify.com"
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">Your Shopify store domain is pre-configured</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accessToken">Admin API Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              {...register("accessToken", { required: "Admin API Access Token is required" })}
            />
            {errors.accessToken && (
              <p className="text-sm text-red-500">{errors.accessToken.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect to Shopify"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
