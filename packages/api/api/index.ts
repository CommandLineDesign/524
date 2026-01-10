import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Application } from 'express';

import { createApp } from '../src/app.js';

let appInstance: Application | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (!appInstance) {
      appInstance = await createApp();
    }

    // Express Application is callable as a request handler
    // We need to handle the response completion properly
    return new Promise((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());

      // Express apps are callable - call it directly
      // The type assertion is safe because Express.Application extends RequestHandler at runtime
      const handler = appInstance as unknown as (req: VercelRequest, res: VercelResponse) => void;

      try {
        handler(req, res);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
    throw error;
  }
}
