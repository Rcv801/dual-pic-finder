
// Main export file for Shopify services

// Re-export types
export type {
  ShopifyCredentials,
  ShopifyProduct,
  ShopifyProductsResponse
} from './types';

// Re-export credential management functions
export {
  hasShopifyCredentials,
  storeShopifyCredentials,
  getShopifyCredentials,
  clearShopifyCredentials,
  testShopifyConnection
} from './credentials';

// Re-export product functions
export {
  fetchShopifyProducts
} from './products';

// Re-export image functions
export {
  addImageToExistingProduct,
  uploadImageToShopify
} from './images';
