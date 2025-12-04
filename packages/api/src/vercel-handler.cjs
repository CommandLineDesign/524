// Vercel Serverless Function Handler
// This file is copied to api/index.js during build
// Using lazy loading with dynamic import for ES module compatibility

let app;

// Parse CORS origin from environment (supports comma-separated values)
function getAllowedOrigins() {
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  if (corsOrigin === '*') return '*';
  return corsOrigin.split(',').map(o => o.trim());
}

// Check if origin is allowed
function isOriginAllowed(origin) {
  const allowed = getAllowedOrigins();
  if (allowed === '*') return true;
  if (!origin) return false;
  return allowed.includes(origin);
}

// Set CORS headers
function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowed = getAllowedOrigins();
  
  if (allowed === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async function handler(req, res) {
  // Always set CORS headers first
  setCorsHeaders(req, res);

  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

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
        message: 'Failed to initialize application'
      });
      return;
    }
  }

  return app(req, res);
};

