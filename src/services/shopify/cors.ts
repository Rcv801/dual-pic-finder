
// Available CORS proxies to try (in order of preference)
export const CORS_PROXIES = [
  'direct', // Try direct connection first
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://thingproxy.freeboard.io/fetch/',
  'https://cors-anywhere.herokuapp.com/',  // This one often requires authorization
];

// Track which proxy is currently working
let currentProxyIndex = 0;

// Helper function to construct API URLs with CORS proxy
export const getProxiedUrl = (endpoint: string, storeDomain: string): string => {
  // Ensure we're working with just the domain, no protocol
  const cleanDomain = storeDomain.replace(/^https?:\/\//i, '');
  
  // Build the Shopify API URL - using 2023-10 version as mentioned by user
  const shopifyApiUrl = `https://${cleanDomain}/admin/api/2023-10/${endpoint}`;
  
  // Use the current proxy
  const corsProxy = CORS_PROXIES[currentProxyIndex];
  
  // Direct connection (no proxy)
  if (corsProxy === 'direct') {
    return shopifyApiUrl;
  }
  
  // Different proxies use different URL formats
  if (corsProxy === 'https://api.allorigins.win/raw?url=') {
    return `${corsProxy}${encodeURIComponent(shopifyApiUrl)}`;
  }
  
  return `${corsProxy}${shopifyApiUrl}`;
};

// Try the next proxy in the list
export const switchToNextProxy = (): boolean => {
  if (currentProxyIndex < CORS_PROXIES.length - 1) {
    currentProxyIndex++;
    console.log(`Switching to next CORS proxy: ${CORS_PROXIES[currentProxyIndex]}`);
    return true;
  }
  // Reset to first proxy for next attempt
  currentProxyIndex = 0;
  return false;
};

// Get the current proxy name for display purposes
export const getCurrentProxyName = (): string => {
  return CORS_PROXIES[currentProxyIndex];
};
