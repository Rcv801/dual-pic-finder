
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Loader2, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
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
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Clean up domain input by removing https:// if present and ensuring it has myshopify.com if needed
  const cleanDomain = (domain: string): string => {
    let cleaned = domain.trim().replace(/^https?:\/\//i, '');
    
    // If it doesn't contain myshopify.com, assume it's a subdomain and add it
    if (!cleaned.includes('myshopify.com') && !cleaned.includes('.')) {
      cleaned = `${cleaned}.myshopify.com`;
    }
    
    return cleaned;
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
    setConnectionAttempts(prev => prev + 1);

    try {
      // Clean up domain and prepare credentials
      const cleanedDomain = cleanDomain(storeDomain);
      console.log(`Attempting to validate credentials for domain: ${cleanedDomain}`);
      
      // Try to validate the credentials by making a test API call
      const credentials = { 
        storeDomain: cleanedDomain, 
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
          
          {connectionAttempts > 0 && (
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <div className="text-xs text-amber-700 space-y-2">
                <p><strong>Connection troubleshooting:</strong></p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Verify that your store domain is correct (e.g., yourstore.myshopify.com)</li>
                  <li>Ensure your API token has the necessary permissions (read_products, write_products)</li>
                  <li>Shopify blocks many CORS proxies - try installing a CORS-disabling browser extension like CORS Unblock (for development use only)</li>
                </ol>
                <div className="mt-2 space-y-1">
                  <a 
                    href="https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline gap-1"
                  >
                    <span>CORS Unblock Extension (Chrome)</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a 
                    href="https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline gap-1"
                  >
                    <span>CORS Everywhere (Firefox)</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </Alert>
          )}
          
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
            ) : connectionAttempts > 0 ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
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
