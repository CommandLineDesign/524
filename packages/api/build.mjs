// Compiles TypeScript source directly to a bundled file for Vercel serverless
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure dist directory exists
mkdirSync(join(__dirname, 'dist'), { recursive: true });

await build({
  entryPoints: [join(__dirname, 'src/app.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs', // CommonJS for maximum compatibility
  outfile: join(__dirname, 'dist/app.bundle.js'),
  external: [
    // Don't bundle native modules or optional dependencies
    'pg-native',
    'bufferutil',
    'utf-8-validate',
    '@opentelemetry/*',
    '@google-cloud/*',
  ],
  // Resolve workspace packages
  nodePaths: [
    join(__dirname, '../../node_modules'),
    join(__dirname, '../shared/dist'),
    join(__dirname, '../database/dist'),
    join(__dirname, '../notifications/dist'),
  ],
});

console.log('✓ Bundled src/app.ts -> dist/app.bundle.js');

// Create the handler file for Vercel
const handlerCode = `// Vercel Serverless Function Handler
const { createApp } = require('../dist/app.bundle.js');

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

// Create handler in api/ folder (required by Vercel)
mkdirSync(join(__dirname, 'api'), { recursive: true });
writeFileSync(join(__dirname, 'api/index.js'), handlerCode);
console.log('✓ Created api/index.js');
