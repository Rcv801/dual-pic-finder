
// GraphQL queries for Shopify products

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String, $query: String) {
    products(first: $first, after: $after, query: $query, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          description
          handle
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

// Helper function to transform GraphQL response to match our existing ShopifyProduct format
export const transformGraphQLProducts = (data: any) => {
  if (!data || !data.products || !data.products.edges) {
    return {
      products: [],
      hasNextPage: false,
      nextPageCursor: null
    };
  }

  const products = data.products.edges.map((edge: any) => {
    const product = edge.node;
    const image = product.images?.edges[0]?.node;
    
    // Extract numerical ID from GraphQL ID (format: "gid://shopify/Product/1234567890")
    const idMatch = product.id.match(/\/Product\/(\d+)$/);
    const numericId = idMatch ? parseInt(idMatch[1], 10) : 0;
    
    return {
      id: numericId,
      graphqlId: product.id, // Keep the original GraphQL ID for reference
      title: product.title,
      description: product.description,
      handle: product.handle,
      image: image ? { 
        id: image.id,
        src: image.url,
        alt: image.altText
      } : undefined
    };
  });

  return {
    products,
    hasNextPage: data.products.pageInfo.hasNextPage,
    nextPageCursor: data.products.pageInfo.endCursor
  };
};
