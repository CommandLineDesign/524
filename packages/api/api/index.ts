import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createApp } from '../src/app.js';

let appInstance: Awaited<ReturnType<typeof createApp>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!appInstance) {
    appInstance = await createApp();
  }

  // Express app implements the request handler interface
  return new Promise((resolve, reject) => {
    appInstance?.handle(req, res, (err) => {
      if (err) reject(err);
      else resolve(undefined);
    });
  });
}
