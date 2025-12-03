import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

// Cache the Express app instance for serverless reuse
let appInstance: Awaited<ReturnType<typeof createApp>> | null = null;

async function getApp() {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance;
}

// Vercel Serverless Function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  return app(req, res);
}

