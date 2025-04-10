
// This is a mock search service that simulates finding product images.
// In a real application, this would connect to an actual image search API.

import { toast } from "sonner";

export interface ImageResult {
  id: string;
  imageUrl: string;
  title: string;
  source: string;
  isFallback?: boolean;
}

// Mock data for demonstration purposes
const productImagesDatabase: Record<string, ImageResult[]> = {
  "laptop": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop", title: "Laptop on desk", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1968&auto=format&fit=crop", title: "MacBook Pro", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=2151&auto=format&fit=crop", title: "Silver laptop", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop", title: "Laptop with coffee", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070&auto=format&fit=crop", title: "Dell laptop", source: "Unsplash" },
  ],
  "smartphone": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2627&auto=format&fit=crop", title: "Smartphone in hand", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2080&auto=format&fit=crop", title: "iPhone X", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=1160&auto=format&fit=crop", title: "Samsung Galaxy", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1533228876829-65c94e7b5025?q=80&w=2070&auto=format&fit=crop", title: "Phone on desk", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1981&auto=format&fit=crop", title: "Google Pixel", source: "Unsplash" },
  ],
  "headphones": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?q=80&w=2070&auto=format&fit=crop", title: "Black headphones", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2165&auto=format&fit=crop", title: "Sony headphones", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=2068&auto=format&fit=crop", title: "Wireless headphones", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=2070&auto=format&fit=crop", title: "Studio headphones", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=2145&auto=format&fit=crop", title: "Beats headphones", source: "Unsplash" },
  ],
  "watch": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=2070&auto=format&fit=crop", title: "Analog watch", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2072&auto=format&fit=crop", title: "Smart watch", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1888&auto=format&fit=crop", title: "Luxury watch", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop", title: "Watch collection", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=2072&auto=format&fit=crop", title: "Apple Watch", source: "Unsplash" },
  ],
  "camera": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1964&auto=format&fit=crop", title: "DSLR camera", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?q=80&w=2070&auto=format&fit=crop", title: "Vintage camera", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1616088886430-ccd86fef0713?q=80&w=1974&auto=format&fit=crop", title: "Sony mirrorless", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1533425962554-8e7e8416dea4?q=80&w=2070&auto=format&fit=crop", title: "Canon camera", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1495707902641-75cac588d2e9?q=80&w=2070&auto=format&fit=crop", title: "Film camera", source: "Unsplash" },
  ],
  "phone": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2627&auto=format&fit=crop", title: "Phone in hand", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2080&auto=format&fit=crop", title: "iPhone", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=1160&auto=format&fit=crop", title: "Samsung phone", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1533228876829-65c94e7b5025?q=80&w=2070&auto=format&fit=crop", title: "Phone and coffee", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1981&auto=format&fit=crop", title: "Google phone", source: "Unsplash" },
  ],
  "computer": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop", title: "Computer setup", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1968&auto=format&fit=crop", title: "MacBook", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=2151&auto=format&fit=crop", title: "Laptop computer", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop", title: "PC setup", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070&auto=format&fit=crop", title: "Desktop computer", source: "Unsplash" },
  ],
  "tablet": [
    { id: "1", imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?q=80&w=1974&auto=format&fit=crop", title: "iPad Pro", source: "Unsplash" },
    { id: "2", imageUrl: "https://images.unsplash.com/photo-1623126908029-58c32ac92159?q=80&w=1972&auto=format&fit=crop", title: "Tablet device", source: "Unsplash" },
    { id: "3", imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1926&auto=format&fit=crop", title: "Tablet on desk", source: "Unsplash" },
    { id: "4", imageUrl: "https://images.unsplash.com/photo-1588058365548-9ded0e3e3b24?q=80&w=2070&auto=format&fit=crop", title: "Android tablet", source: "Unsplash" },
    { id: "5", imageUrl: "https://images.unsplash.com/photo-1589739900266-43b2843f4c12?q=80&w=1974&auto=format&fit=crop", title: "Drawing tablet", source: "Unsplash" },
  ],
};

// Add more generic fallback images
const fallbackImages: ImageResult[] = [
  { id: "f1", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop", title: "Generic product 1", source: "Unsplash", isFallback: true },
  { id: "f2", imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1968&auto=format&fit=crop", title: "Generic product 2", source: "Unsplash", isFallback: true },
  { id: "f3", imageUrl: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=2151&auto=format&fit=crop", title: "Generic product 3", source: "Unsplash", isFallback: true },
  { id: "f4", imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop", title: "Generic product 4", source: "Unsplash", isFallback: true },
  { id: "f5", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070&auto=format&fit=crop", title: "Generic product 5", source: "Unsplash", isFallback: true },
];

// Improved search function with better keyword matching
export const searchForProductImages = async (
  query: string,
  limit: number = 5
): Promise<ImageResult[]> => {
  // Simulate API request delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!query.trim()) {
    return [];
  }

  // Convert query to lowercase for case-insensitive matching
  const normalizedQuery = query.toLowerCase().trim();
  
  // First try exact matches
  if (productImagesDatabase[normalizedQuery]) {
    return productImagesDatabase[normalizedQuery].slice(0, limit);
  }
  
  // Then try to find partial matches
  const matches = Object.keys(productImagesDatabase).filter(key => 
    normalizedQuery.includes(key) || key.includes(normalizedQuery)
  );
  
  if (matches.length > 0) {
    // Sort matches by relevance (shortest match = most specific)
    matches.sort((a, b) => a.length - b.length);
    const bestMatch = matches[0];
    
    // Return results for best match
    const results = productImagesDatabase[bestMatch].map(img => ({
      ...img,
      title: `${normalizedQuery} - ${img.title}`
    }));
    
    return results.slice(0, limit);
  }
  
  // If we don't have a match, notify using toast and return fallback images
  toast.info("Using generic images", {
    description: `No specific images found for "${query}". Showing generic alternatives.`,
  });
  
  // Modify fallback images to include the search term
  const modifiedFallback = fallbackImages.map(img => ({
    ...img,
    title: `${query} - ${img.title}`,
  }));
  
  return modifiedFallback.slice(0, limit);
};

export const performDualSearch = async (
  query1: string,
  query2: string,
  limit: number = 5
): Promise<{ product1Results: ImageResult[], product2Results: ImageResult[] }> => {
  try {
    if (!query1 && !query2) {
      toast("Please enter at least one search term", {
        description: "You need to specify what products to search for",
      });
      return { product1Results: [], product2Results: [] };
    }
    
    const [product1Results, product2Results] = await Promise.all([
      query1 ? searchForProductImages(query1, limit) : Promise.resolve([]),
      query2 ? searchForProductImages(query2, limit) : Promise.resolve([]),
    ]);
    
    return { product1Results, product2Results };
  } catch (error) {
    toast("Search failed", {
      description: "There was an error searching for product images",
    });
    console.error("Error in dual search:", error);
    return { product1Results: [], product2Results: [] };
  }
};
