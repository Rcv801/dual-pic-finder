
import { ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TroubleshootingGuideProps {
  visible: boolean;
}

const TroubleshootingGuide = ({ visible }: TroubleshootingGuideProps) => {
  if (!visible) return null;
  
  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200">
      <div className="text-xs text-amber-700 space-y-2">
        <p><strong>Connection troubleshooting:</strong></p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Verify that your store domain is correct (e.g., yourstore.myshopify.com)</li>
          <li>Ensure your API token has the necessary permissions (read_products, write_products)</li>
          <li>Make sure you're using an Admin API token from a custom app, not a storefront token</li>
          <li>Shopify API has strict CORS policies that block most external requests</li>
        </ol>
        <div className="mt-2">
          <p><strong>Recommended solutions:</strong></p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Try the "Try /shop.json endpoint" button below to test a simpler API endpoint</li>
            <li>Install a CORS-disabling browser extension (for development only)</li>
          </ul>
        </div>
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
  );
};

export default TroubleshootingGuide;
