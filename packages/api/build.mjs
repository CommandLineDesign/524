// Compiles TypeScript source directly to a bundled file for Vercel serverless
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [join(__dirname, 'src/app.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs', // CommonJS for maximum compatibility
  outfile: join(__dirname, 'dist/app.bundle.js'),
  external: [
    // Don't bundle native modules
    'pg-native',
    'bufferutil',
    'utf-8-validate',
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
