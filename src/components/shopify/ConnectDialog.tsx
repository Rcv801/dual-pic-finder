
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
}

const ConnectDialog = ({ isOpen, onOpenChange }: ConnectDialogProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ShopifyCredentials>();

  const onSubmit = async (data: ShopifyCredentials) => {
    try {
      setIsConnecting(true);
      
      // Ensure the shop domain is in the expected format
      let shopDomain = data.shopDomain;
      if (!shopDomain.includes("myshopify.com")) {
        if (!shopDomain.includes(".")) {
          shopDomain = `${shopDomain}.myshopify.com`;
        } else {
          shopDomain = shopDomain.trim();
        }
      }
      
      // Prepare credentials
      const credentials: ShopifyCredentials = {
        apiKey: data.apiKey,
        apiSecretKey: data.apiSecretKey,
        shopDomain
      };
      
      // Test connection before saving
      const isConnected = await testShopifyConnection(credentials);
      
      if (isConnected) {
        // Save credentials
        storeShopifyCredentials(credentials);
        toast.success("Successfully connected to Shopify!");
        onOpenChange(false); // Close the dialog
      } else {
        toast.error("Failed to connect to Shopify. Please check your credentials.");
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
            Enter your Shopify API credentials to connect your store
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shopDomain">Shop Domain</Label>
            <Input
              id="shopDomain"
              placeholder="yourstore.myshopify.com"
              {...register("shopDomain", { required: "Shop domain is required" })}
            />
            {errors.shopDomain && (
              <p className="text-sm text-red-500">{errors.shopDomain.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="text"
              {...register("apiKey", { required: "API Key is required" })}
            />
            {errors.apiKey && (
              <p className="text-sm text-red-500">{errors.apiKey.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiSecretKey">API Secret Key</Label>
            <Input
              id="apiSecretKey"
              type="password"
              {...register("apiSecretKey", { required: "API Secret Key is required" })}
            />
            {errors.apiSecretKey && (
              <p className="text-sm text-red-500">{errors.apiSecretKey.message}</p>
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
