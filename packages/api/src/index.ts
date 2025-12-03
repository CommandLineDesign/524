import type { Request, Response } from 'express';
import { createApp } from './app';

// Cache the Express app instance for serverless reuse
let appInstance: Awaited<ReturnType<typeof createApp>> | null = null;

async function getApp() {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance;
}

// Vercel Serverless Function handler
export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  return app(req, res);
}

// For local development - start the traditional server
// Vercel sets VERCEL=1 in their environment
if (!process.env.VERCEL) {
  import('./server').then(({ startServer }) => {
    startServer().catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to start API server', error);
      process.exit(1);
    });
  });
}
