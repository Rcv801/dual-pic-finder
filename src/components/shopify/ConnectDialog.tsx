
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveShopifyCredentials, validateShopifyCredentials, testShopConnection } from "@/services/shopify";
import { toast } from "sonner";
import FormField from "./FormField";
import ConnectionError from "./ConnectionError";
import TroubleshootingGuide from "./TroubleshootingGuide";
import DomainHelpText from "./DomainHelpText";
import TokenHelpText from "./TokenHelpText";

interface ConnectDialogProps {
  onConnect: () => void;
}

const ConnectDialog = ({ onConnect }: ConnectDialogProps) => {
  const [storeDomain, setStoreDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [open, setOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isTestingShopEndpoint, setIsTestingShopEndpoint] = useState(false);
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

  const handleTestShopEndpoint = async () => {
    if (!storeDomain.trim() || !accessToken.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsTestingShopEndpoint(true);
    setConnectionError(null);
    
    try {
      const cleanedDomain = cleanDomain(storeDomain);
      const credentials = { 
        storeDomain: cleanedDomain, 
        accessToken: accessToken.trim() 
      };
      
      const isConnected = await testShopConnection(credentials);
      
      if (isConnected) {
        toast.success("Successfully connected to shop.json endpoint!");
        setConnectionError(null);
      } else {
        setConnectionError("Could not connect to shop.json endpoint. Check your credentials and try again.");
        toast.error("Failed to connect to shop.json endpoint.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setConnectionError(`Failed to connect to shop.json endpoint: ${errorMessage}`);
      toast.error("Failed to connect to shop.json endpoint. Check your credentials and try again.");
    } finally {
      setIsTestingShopEndpoint(false);
    }
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
          <ConnectionError error={connectionError} />
          
          <FormField
            id="store-domain"
            label="Store Domain"
            value={storeDomain}
            onChange={setStoreDomain}
            placeholder="yourstore.myshopify.com"
            disabled={isValidating || isTestingShopEndpoint}
            helpText={<DomainHelpText />}
          />
          
          <FormField
            id="access-token"
            label="Access Token"
            value={accessToken}
            onChange={setAccessToken}
            placeholder="shpat_xxxx..."
            disabled={isValidating || isTestingShopEndpoint}
            isPassword={true}
            helpText={<TokenHelpText />}
          />
          
          <TroubleshootingGuide visible={connectionAttempts > 0} />
          
          <div className="text-xs text-amber-600">
            <p>Note: Your credentials are stored locally in your browser.</p>
          </div>

          {connectionAttempts > 0 && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleTestShopEndpoint}
              disabled={isValidating || isTestingShopEndpoint || !storeDomain || !accessToken}
              className="w-full gap-2"
            >
              {isTestingShopEndpoint ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Try /shop.json endpoint
                </>
              )}
            </Button>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleConnect} disabled={isValidating || isTestingShopEndpoint}>
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
