import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import from compiled dist - avoids runtime issues with TypeScript source imports
const appModule = import('../dist/app.js');

// Cache the Express app instance for serverless reuse
let appInstance: any = null;

async function getApp() {
  if (!appInstance) {
    const { createApp } = await appModule;
    appInstance = await createApp();
  }
  return appInstance;
}

// Vercel Serverless Function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  return app(req, res);
}
