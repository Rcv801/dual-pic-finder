
const API_VERSION = '2025-04';

export const buildShopifyUrl = (shopDomain: string, targetEndpoint: string): string => {
  if (targetEndpoint === 'graphql.json') {
    return `https://${shopDomain}/admin/api/${API_VERSION}/graphql.json`;
  }
  return `https://${shopDomain}/admin/api/${API_VERSION}/${targetEndpoint}`;
};
