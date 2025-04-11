
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken, getShopifyCredentials, storeShopifyCredentials } from "@/services/shopifyService";
import { toast } from "sonner";

const ShopifyCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const completeOAuth = async () => {
      try {
        // Get the temporary code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const shop = urlParams.get("shop");
        
        if (!code || !shop) {
          throw new Error("Missing required parameters");
        }
        
        // Get stored credentials
        const credentials = getShopifyCredentials();
        if (!credentials) {
          throw new Error("No Shopify credentials found");
        }
        
        // Exchange the code for a permanent access token
        const accessToken = await exchangeCodeForToken(code, credentials);
        
        if (!accessToken) {
          throw new Error("Failed to get access token");
        }
        
        // Update credentials with the permanent token
        storeShopifyCredentials({
          ...credentials,
          accessToken
        });
        
        setStatus("success");
        toast.success("Successfully connected to Shopify!");
        
        // Redirect back to home page
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        console.error("Error completing Shopify OAuth:", error);
        setStatus("error");
        toast.error("Failed to complete Shopify connection");
        
        // Redirect back to home page
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };
    
    completeOAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Connecting to Shopify</h1>
            <p className="text-gray-600 mb-4">Please wait while we complete the connection...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </>
        )}
        
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-green-600">Successfully Connected!</h1>
            <p className="text-gray-600">
              Your Shopify store has been connected. Redirecting you back...
            </p>
          </>
        )}
        
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold mb-4 text-red-600">Connection Failed</h1>
            <p className="text-gray-600">
              There was a problem connecting to your Shopify store. Redirecting you back...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ShopifyCallback;
