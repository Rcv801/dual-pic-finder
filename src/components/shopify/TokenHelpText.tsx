
import { ExternalLink } from "lucide-react";

const TokenHelpText = () => {
  return (
    <>
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
    </>
  );
};

export default TokenHelpText;
