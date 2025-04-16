
import { corsHeaders } from './utils/corsHeaders';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Return a simple JSON response
  return res.status(200).json({ 
    status: 'ok',
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    runtime: 'Vercel Serverless'
  });
}
