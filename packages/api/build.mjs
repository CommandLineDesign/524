// Compiles TypeScript source directly to a self-contained Vercel serverless function
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure directories exist
mkdirSync(join(__dirname, 'dist'), { recursive: true });
mkdirSync(join(__dirname, 'api'), { recursive: true });

// Build the main bundle for local development
await build({
  entryPoints: [join(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: join(__dirname, 'dist/index.js'),
  external: [
    'pg-native',
    'bufferutil',
    'utf-8-validate',
    '@opentelemetry/*',
    '@google-cloud/*',
  ],
  nodePaths: [join(__dirname, '../../node_modules')],
});

console.log('✓ Bundled dist/index.js (for local development)');

// Build a self-contained serverless function for Vercel
// This bundles everything including the handler wrapper
const serverlessEntryCode = `
import { createApp } from './app';

let appInstance = null;

async function getApp() {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}
`;

// Write temporary entry file
import { writeFileSync, unlinkSync } from 'fs';
const tempEntry = join(__dirname, 'src/_vercel_handler.ts');
writeFileSync(tempEntry, serverlessEntryCode);

try {
  await build({
    entryPoints: [tempEntry],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: join(__dirname, 'api/index.js'),
    external: [
      'pg-native',
      'bufferutil',
      'utf-8-validate',
      '@opentelemetry/*',
      '@google-cloud/*',
    ],
    nodePaths: [join(__dirname, '../../node_modules')],
    // Banner to mark this as a CommonJS handler
    banner: {
      js: '// Vercel Serverless Function - Auto-generated, do not edit\n'
    },
  });
  console.log('✓ Bundled api/index.js (self-contained serverless function)');
} finally {
  // Clean up temp file
  unlinkSync(tempEntry);
}
