
import { corsHeaders, handleOptions } from './utils/corsHeaders';
import { handleProxyRequest } from './handlers/proxyHandler';

export default async function handler(req: any, res: any) {
  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return handleOptions(req, res);
  }

  // Only allow POST method for our proxy
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  return handleProxyRequest(req, res);
}
