// Vercel Serverless Function Handler
// This file is copied to api/index.js during build

let app;

module.exports = async function handler(req, res) {
  // Initialize Express app lazily using dynamic import
  if (!app) {
    try {
      const appModule = await import('../dist/app.js');
      const createApp = appModule.createApp;
      app = await createApp();
    } catch (error) {
      console.error('Failed to create app:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to initialize application',
      });
      return;
    }
  }

  return app(req, res);
};
