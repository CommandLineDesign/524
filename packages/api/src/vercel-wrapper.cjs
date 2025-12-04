// CommonJS wrapper for ES module app
// This allows the vercel-handler.cjs to require() the ES module app

async function loadApp() {
  const appModule = await import('./app.js');
  return appModule.createApp;
}

let createAppPromise = loadApp();

module.exports = {
  getCreateApp: () => createAppPromise
};
