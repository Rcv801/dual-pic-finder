
// Store pagination links for search and regular requests separately
const paginationCursors = {
  regular: new Map<number, string>(),
  search: new Map<number, string>()
};

// Extract cursor from Link header
export const extractCursorFromLinkHeader = (linkHeader: string | null): { 
  nextCursor: string, 
  prevCursor: string 
} => {
  const result = { nextCursor: "", prevCursor: "" };
  
  if (!linkHeader) return result;
  
  // Extract next cursor
  const nextLinkMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)[^>]*>;\s*rel="next"/);
  if (nextLinkMatch && nextLinkMatch[1]) {
    result.nextCursor = nextLinkMatch[1];
  }
  
  // Extract previous cursor
  const prevLinkMatch = linkHeader.match(/<[^>]*page_info=([^&>]*)[^>]*>;\s*rel="previous"/);
  if (prevLinkMatch && prevLinkMatch[1]) {
    result.prevCursor = prevLinkMatch[1];
  }
  
  return result;
};

// Clear pagination cache - can specify 'search', 'regular', or clear both
export const clearPaginationCache = (type?: 'search' | 'regular'): void => {
  if (!type || type === 'regular') {
    paginationCursors.regular.clear();
    console.log("Regular pagination cache cleared");
  }
  if (!type || type === 'search') {
    paginationCursors.search.clear();
    console.log("Search pagination cache cleared");
  }
};

// Get cursor for a specific page
export const getPaginationCursor = (page: number, isSearch: boolean): string | undefined => {
  const cursorMap = isSearch ? paginationCursors.search : paginationCursors.regular;
  return cursorMap.get(page);
};

// Store cursor for a specific page
export const storePaginationCursor = (page: number, cursor: string, isSearch: boolean): void => {
  const cursorMap = isSearch ? paginationCursors.search : paginationCursors.regular;
  cursorMap.set(page, cursor);
  console.log(`Saved ${isSearch ? 'search' : 'regular'} cursor for page ${page}`);
};

