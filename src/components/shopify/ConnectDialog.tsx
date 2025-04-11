
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { saveShopifyCredentials, validateShopifyCredentials } from "@/services/shopify";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectDialogProps {
  onConnect: () => void;
}

const ConnectDialog = ({ onConnect }: ConnectDialogProps) => {
  const [storeDomain, setStoreDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [open, setOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Clean up domain input by removing https:// if present
  const cleanDomain = (domain: string): string => {
    return domain.trim().replace(/^https?:\/\//i, '');
  };

  const handleConnect = async () => {
    if (!storeDomain.trim() || !accessToken.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Reset previous error
    setConnectionError(null);
    
    // Show validation in progress
    setIsValidating(true);

    try {
      // Clean up domain and prepare credentials
      const cleanedDomain = cleanDomain(storeDomain);
      
      // Try to validate the credentials by making a test API call
      const credentials = { 
        storeDomain: cleanedDomain, 
        accessToken: accessToken.trim() 
      };
      
      console.log(`Attempting to validate credentials for domain: ${cleanedDomain}`);
      const isValid = await validateShopifyCredentials(credentials);
      
      if (isValid) {
        // Save credentials only if they're valid
        saveShopifyCredentials(credentials);
        toast.success("Connected to Shopify store");
        setOpen(false);
        onConnect();
      } else {
        setConnectionError("Could not connect to Shopify. Please check your credentials and try again.");
        toast.error("Could not connect to Shopify. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setConnectionError(`Failed to connect to Shopify: ${errorMessage}`);
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
          {connectionError && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">{connectionError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="store-domain">Store Domain</Label>
            <Input
              id="store-domain"
              placeholder="yourstore.myshopify.com"
              value={storeDomain}
              onChange={(e) => setStoreDomain(e.target.value)}
              disabled={isValidating}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Enter your full Shopify store domain (e.g., yourstore.myshopify.com)
              </p>
              <p>
                To find it:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Go to your Shopify admin dashboard</li>
                <li>The domain should be visible in your browser URL bar</li>
                <li>It typically looks like: yourstore.myshopify.com</li>
              </ol>
              <p>
                <a 
                  href="https://help.shopify.com/en/manual/domains" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Shopify domains guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
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
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                Create a custom app and generate an Admin API access token:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>In Shopify admin, go to "Apps"</li>
                <li>Click "Develop apps" or "App and sales channel settings"</li>
                <li>Create a custom app</li>
                <li>Under "Admin API integration" select required scopes (at minimum: read_products, write_products)</li>
                <li>Generate an API access token</li>
              </ol>
              <p>
                <a 
                  href="https://shopify.dev/docs/apps/auth/admin-app-access-tokens" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  Shopify access token guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
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
