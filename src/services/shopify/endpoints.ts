
import { getPaginationCursor } from './pagination';

export const buildProductEndpoint = (
  page: number,
  limit: number,
  searchQuery: string = "",
  prevPageCursor?: string
): string => {
  const isSearchMode = searchQuery.trim().length > 0;
  
  // Base endpoint
  let endpoint = `products.json?limit=${limit}`;
  
  // First page search
  if (isSearchMode && page === 1) {
    const formattedQuery = encodeURIComponent(searchQuery.trim());
    endpoint = `products.json?limit=${limit}&query=${formattedQuery}`;
    console.log(`Search endpoint (first page): ${endpoint}`);
    console.log(`Original query: "${searchQuery}"`);
    console.log(`Encoded query: "${formattedQuery}"`);
  } 
  // Pagination with cursor
  else if (prevPageCursor) {
    endpoint = `products.json?limit=${limit}&page_info=${prevPageCursor}`;
    console.log(`Using cursor from previous ${isSearchMode ? 'search' : 'regular'} page: ${endpoint}`);
  }
  
  console.log(`Final endpoint: ${endpoint}`);
  return endpoint;
};

export const analyzeSearchResults = (
  products: any[],
  searchQuery: string
): void => {
  if (!searchQuery || products.length === 0) return;
  
  const searchTerm = searchQuery.toLowerCase().trim();
  const matchingProducts = products.filter(
    product => product.title.toLowerCase().includes(searchTerm)
  );
  
  console.log(`\n=== SEARCH TERM MATCHING ===`);
  console.log(`Products with "${searchTerm}" in title: ${matchingProducts.length} out of ${products.length}`);
  
  if (matchingProducts.length > 0) {
    console.log("Matching product titles:");
    matchingProducts.slice(0, 5).forEach((p, i) => {
      console.log(`${i+1}. ${p.title}`);
    });
  } else {
    console.log("No products directly match the search term in title.");
    console.log("First 5 returned product titles:");
    products.slice(0, 5).forEach((p, i) => {
      console.log(`${i+1}. ${p.title}`);
    });
  }
};

