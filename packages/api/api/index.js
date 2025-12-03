// Vercel Serverless Function handler
// Uses the bundled app which has all dependencies resolved

let appInstance = null;

async function getApp() {
  if (!appInstance) {
    // Use the bundled version which has all workspace packages resolved
    const { createApp } = require('../dist/app.bundle.js');
    appInstance = await createApp();
  }
  return appInstance;
}

module.exports = async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
};
