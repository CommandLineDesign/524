import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Application } from 'express';

import { createApp } from '../src/app.js';

let appInstance: Application | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!appInstance) {
    appInstance = await createApp();
  }

  // Express Application is callable as a request handler
  // TypeScript types don't expose this, but it works at runtime
  // We wait for the response to finish before resolving
  return new Promise((resolve) => {
    res.on('finish', () => resolve());
    // Call the Express app as a function (it's callable despite TypeScript types)
    // Using unknown intermediate cast to satisfy both biome and TypeScript
    (appInstance as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
  });
}
