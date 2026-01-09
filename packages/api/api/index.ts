import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Application } from 'express';

import { createApp } from '../src/app.js';

let appInstance: Application | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!appInstance) {
    appInstance = await createApp();
  }

  // Express Application can be used as a request handler
  // TypeScript doesn't recognize this, but it's valid at runtime
  return new Promise((resolve, reject) => {
    // Use type assertion since Express app is callable but types don't reflect it
    (
      appInstance as unknown as (
        req: VercelRequest,
        res: VercelResponse,
        callback: (err?: Error) => void
      ) => void
    )(req, res, (err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
