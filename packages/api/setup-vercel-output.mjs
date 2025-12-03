// Creates Vercel Build Output API structure
// This gives us full control over the serverless function configuration
// and prevents Vercel from trying to compile TypeScript

import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const outputDir = join(__dirname, '.vercel/output');
const functionsDir = join(outputDir, 'functions/api');
const staticDir = join(outputDir, 'static');

// Create directory structure
mkdirSync(join(functionsDir, 'index.func'), { recursive: true });
mkdirSync(staticDir, { recursive: true });

// Write config.json for the Build Output API
writeFileSync(
  join(outputDir, 'config.json'),
  JSON.stringify({
    version: 3,
    routes: [
      { src: '/(.*)', dest: '/api/index' }
    ]
  }, null, 2)
);

// Write the function configuration
writeFileSync(
  join(functionsDir, 'index.func/.vc-config.json'),
  JSON.stringify({
    runtime: 'nodejs18.x',
    handler: 'index.js',
    launcherType: 'Nodejs'
  }, null, 2)
);

// Copy the bundled app as the function entry point
const bundledAppPath = join(__dirname, 'dist/app.bundle.js');
if (!existsSync(bundledAppPath)) {
  console.error('Error: dist/app.bundle.js not found. Run build first.');
  process.exit(1);
}

// Create the serverless handler
const handlerCode = `
// Serverless function entry point
const { createApp } = require('./app.bundle.js');

let appInstance = null;

async function getApp() {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance;
}

module.exports = async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
};
`;

writeFileSync(join(functionsDir, 'index.func/index.js'), handlerCode);
copyFileSync(bundledAppPath, join(functionsDir, 'index.func/app.bundle.js'));

console.log('✓ Created Vercel Build Output API structure');
console.log('  .vercel/output/config.json');
console.log('  .vercel/output/functions/api/index.func/');

