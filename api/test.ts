
import { corsHeaders } from './utils/corsHeaders';

export default async function handler(req: any, res: any) {
  try {
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Return a simple JSON response
    return res.status(200).json({ 
      status: 'ok',
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      runtime: 'Vercel Serverless',
      requestMethod: req.method
    });
  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({
      error: 'Test endpoint error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
