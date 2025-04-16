
import { useState } from "react";
import { clearPaginationCache } from "@/services/shopify/products";
import { clearApiCache } from "@/services/shopify/api";
import { clearGraphQLCache } from "@/services/shopify/graphql/client";
import { toast } from "sonner";

export function useProductsError() {
  const [error, setError] = useState<string | null>(null);
  const [lastLoadParams, setLastLoadParams] = useState<{page: number, query: string} | null>(null);
  const [errorDetails, setErrorDetails] = useState<Record<string, any> | null>(null);

  // Helper to extract meaningful error messages
  const formatErrorMessage = (error: any): string => {
    if (!error) return "Unknown error occurred";
    
    // Extract the message from different error types
    let message = typeof error === 'string' 
      ? error 
      : error.message || JSON.stringify(error);
    
    // Store error details for debugging
    const details = typeof error === 'object' ? error : { message };
    setErrorDetails(details);
    
    // Format specific error types with more helpful messages
    if (message.includes('Failed to fetch')) {
      return "Failed to connect to Shopify API. Check your network connection or proxy configuration.";
    }
    
    if (message.includes('timed out')) {
      return "Request to Shopify API timed out. The server might be slow or unavailable.";
    }
    
    if (message.includes('CORS')) {
      return "CORS error: Browser prevented connection to Shopify API for security reasons.";
    }
    
    if (message.includes('rate limit')) {
      return "Shopify API rate limit exceeded. Please wait a few minutes before trying again.";
    }
    
    if (message.includes('Network Error') || message.includes('network')) {
      return "Network error connecting to Shopify API. Check your internet connection.";
    }
    
    if (message.includes('404') || message.includes('not found')) {
      return "Shopify API endpoint not found. The proxy URL might be incorrect.";
    }
    
    if (message.includes('proxy')) {
      return "Error connecting to serverless proxy function. The function might not be deployed properly.";
    }
    
    return message;
  };

  const setFormattedError = (error: any) => {
    if (!error) {
      setError(null);
      setErrorDetails(null);
      return;
    }
    
    const formattedMessage = formatErrorMessage(error);
    setError(formattedMessage);
    console.error("Shopify API Error Details:", error);
  };

  const retryLoading = async (loadProducts: (page: number, query: string, forceRefresh: boolean) => Promise<void>) => {
    if (lastLoadParams) {
      clearPaginationCache();
      clearApiCache();
      clearGraphQLCache();
      
      toast.info("Retrying product load with cleared cache...");
      console.log("Retrying load with params:", lastLoadParams);
      
      try {
        await loadProducts(lastLoadParams.page, lastLoadParams.query, true);
      } catch (error) {
        console.error("Retry failed:", error);
        setFormattedError(error);
      }
    }
  };

  return {
    error,
    setError: setFormattedError,
    errorDetails,
    lastLoadParams,
    setLastLoadParams,
    retryLoading,
  };
}
