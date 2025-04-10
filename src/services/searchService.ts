
// This service connects to an image search API to find product images

import { toast } from "sonner";

export interface ImageResult {
  id: string;
  imageUrl: string;
  title: string;
  source: string;
  isFallback?: boolean;
}

// Fallback images in case the API fails or returns no results
const fallbackImages: ImageResult[] = [
  { id: "f1", imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop", title: "Generic product 1", source: "Unsplash", isFallback: true },
  { id: "f2", imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1968&auto=format&fit=crop", title: "Generic product 2", source: "Unsplash", isFallback: true },
  { id: "f3", imageUrl: "https://images.unsplash.com/photo-1602080858428-57174f9431cf?q=80&w=2151&auto=format&fit=crop", title: "Generic product 3", source: "Unsplash", isFallback: true },
  { id: "f4", imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop", title: "Generic product 4", source: "Unsplash", isFallback: true },
  { id: "f5", imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070&auto=format&fit=crop", title: "Generic product 5", source: "Unsplash", isFallback: true },
];

// Function to search the web for product images using Google Custom Search API
export const searchForProductImages = async (
  query: string,
  limit: number = 5
): Promise<ImageResult[]> => {
  if (!query.trim()) {
    return [];
  }

  try {
    // Google Search API endpoint with Custom Search Engine ID
    const apiKey = "AIzaSyDXYAzpOx-Vq-N7l5coEFj0U9guqGnOKB4"; // This is a public API key for demonstration
    const searchEngineId = "ef243df1895fd4c86"; // Demo search engine ID
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&searchType=image&num=${limit}`;
    
    console.log(`Searching for "${query}" images...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log("No images found, using fallbacks");
      toast.info("Using generic images", {
        description: `No specific images found for "${query}". Showing generic alternatives.`,
      });
      
      return getFallbackImages(query, limit);
    }
    
    console.log(`Found ${data.items.length} images for "${query}"`);
    
    // Map the API response to our ImageResult format
    return data.items.map((item: any, index: number): ImageResult => ({
      id: `${query}-${index}`,
      imageUrl: item.link,
      title: item.title || `${query} image`,
      source: new URL(item.image.contextLink).hostname || "Web Search",
      isFallback: false
    }));
  } catch (error) {
    console.error("Error searching for images:", error);
    toast.error("Image search failed", {
      description: "There was an error searching for images. Using generic alternatives.",
    });
    
    return getFallbackImages(query, limit);
  }
};

const getFallbackImages = (query: string, limit: number): ImageResult[] => {
  // Modify fallback images to include the search term
  return fallbackImages.slice(0, limit).map(img => ({
    ...img,
    title: `${query} - ${img.title}`,
  }));
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
