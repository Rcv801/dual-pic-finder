
# Shopify API Proxy for Vercel

This serverless function creates a proxy to securely communicate with the Shopify Admin API while avoiding CORS issues and managing rate limits.

## Deployment Instructions

### 1. Prerequisites
- A Vercel account (sign up at https://vercel.com if you don't have one)
- The Vercel CLI installed (optional but helpful)
  ```
  npm install -g vercel
  ```

### 2. Deployment Options

#### Option A: Deploy via Vercel CLI (Recommended)
1. Log in to Vercel from the terminal:
   ```
   vercel login
   ```

2. Deploy the project from your project directory:
   ```
   vercel
   ```

3. Follow the prompts to link to your Vercel account and project
   
4. Once deployed, Vercel will provide you with a URL for your function, typically in the format:
   `https://your-project-name.vercel.app/api/shopify-proxy`

#### Option B: Deploy via Vercel Dashboard
1. Push this code to a GitHub, GitLab, or Bitbucket repository
2. Log in to the Vercel dashboard: https://vercel.com/dashboard
3. Click "New Project" 
4. Import your Git repository
5. Configure the project settings (the defaults should work fine)
6. Click "Deploy"

### 3. After Deployment

Once you have the deployed function URL, you'll need to update your frontend code to use this proxy instead of the public CORS proxy.

The endpoint will be:
```
https://your-project-name.vercel.app/api/shopify-proxy
```

## Usage

The proxy endpoint accepts POST requests with the following JSON body:

```json
{
  "shopDomain": "your-shop.myshopify.com",
  "accessToken": "your-shopify-admin-api-access-token",
  "targetEndpoint": "products.json",
  "method": "GET",
  "body": null
}
```

- `shopDomain`: Your Shopify store domain
- `accessToken`: Your Shopify Admin API access token
- `targetEndpoint`: The Shopify API endpoint to call (without the /admin/api/version prefix)
- `method`: HTTP method (GET, POST, PUT, DELETE)
- `body`: Request body for POST/PUT requests (can be null for GET requests)

## Security Notes

- This function acts as a proxy that adds your Shopify credentials to requests
- The access token is not stored on the server but is passed with each request
- The function handles CORS headers to allow requests from any origin
- For production use, consider adding proper authentication to this endpoint
