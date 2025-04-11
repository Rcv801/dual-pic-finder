
import { ExternalLink } from "lucide-react";

const DomainHelpText = () => {
  return (
    <>
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
    </>
  );
};

export default DomainHelpText;
