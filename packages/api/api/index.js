// Vercel Serverless Function handler
// Uses pre-compiled dist files to avoid Vercel's in-place TypeScript compilation issues

let appInstance = null;

async function getApp() {
  if (!appInstance) {
    const { createApp } = await import('../dist/app.js');
    appInstance = await createApp();
  }
  return appInstance;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}

