import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Use esbuild-wasm in CI environments where native binaries aren't available
// (Vercel installs with --no-optional which skips platform-specific esbuild binaries)
let build;
try {
  ({ build } = await import('esbuild'));
} catch {
  ({ build } = await import('esbuild-wasm'));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const VERCELOUT_DIR = path.join(projectRoot, '.vercel', 'output');
const FUNCTION_DIR = path.join(VERCELOUT_DIR, 'functions', 'api', 'index.func');

async function ensureCleanOutput() {
  await rm(VERCELOUT_DIR, { recursive: true, force: true });
  await mkdir(FUNCTION_DIR, { recursive: true });
}

async function bundleHandler() {
  await build({
    entryPoints: [path.join(projectRoot, 'vercel-handler', 'index.ts')],
    outfile: path.join(FUNCTION_DIR, 'index.cjs'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    // Use CommonJS to avoid ESM/CJS interop issues with Express and other CommonJS packages
    format: 'cjs',
    sourcemap: true,
    tsconfig: path.join(projectRoot, 'tsconfig.json'),
    external: ['pg-native'],
    // Ensure we can handle dynamic requires
    mainFields: ['main', 'module'],
  });
}

async function writeFunctionConfig() {
  const config = {
    runtime: 'nodejs20.x',
    handler: 'index.cjs',
  };

  await writeFile(path.join(FUNCTION_DIR, '.vc-config.json'), JSON.stringify(config, null, 2));
}

async function writeRoutingConfig() {
  const routesConfig = {
    version: 3,
    routes: [{ src: '/(.*)', dest: 'api' }],
  };

  await mkdir(path.join(VERCELOUT_DIR), { recursive: true });
  await writeFile(path.join(VERCELOUT_DIR, 'config.json'), JSON.stringify(routesConfig, null, 2));
}

async function main() {
  await ensureCleanOutput();
  await bundleHandler();
  await writeFunctionConfig();
  await writeRoutingConfig();
}

main().catch((error) => {
  console.error('Failed to build Vercel output', error);
  process.exit(1);
});
