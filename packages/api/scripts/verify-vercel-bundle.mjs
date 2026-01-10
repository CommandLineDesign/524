#!/usr/bin/env node
/**
 * Verifies the Vercel bundle can be imported without runtime errors.
 * This catches ESM/CJS interop issues and missing dependencies.
 *
 * Run after build:vercel to ensure the bundle works before deploying.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const bundlePath = path.join(
  projectRoot,
  '.vercel',
  'output',
  'functions',
  'api',
  'index.func',
  'index.cjs'
);

async function verify() {
  console.log('🔍 Verifying Vercel bundle...\n');

  // Check bundle exists
  if (!existsSync(bundlePath)) {
    console.error('❌ Bundle not found at:', bundlePath);
    console.error('   Run "pnpm build:vercel" first.');
    process.exit(1);
  }

  console.log('✓ Bundle exists at:', bundlePath);

  // Try to import the bundle - this catches most runtime errors
  console.log('\n📦 Attempting to import bundle...');

  try {
    const bundle = await import(bundlePath);
    console.log('✓ Bundle imported successfully');

    // Check for default export (the handler function)
    // CJS modules imported into ESM may have nested default exports
    let handler = bundle.default;
    if (handler && typeof handler === 'object' && typeof handler.default === 'function') {
      handler = handler.default;
    }

    if (typeof handler !== 'function') {
      console.error('❌ Bundle does not export a default function (handler)');
      console.error('   Exported:', Object.keys(bundle));
      console.error('   bundle.default type:', typeof bundle.default);
      if (bundle.default && typeof bundle.default === 'object') {
        console.error('   bundle.default keys:', Object.keys(bundle.default));
      }
      process.exit(1);
    }

    console.log('✓ Handler function exported correctly');
    console.log('\n✅ Vercel bundle verification PASSED!\n');
    console.log('The bundle structure is valid. Deploy to Vercel to test full functionality.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Bundle verification FAILED!\n');
    console.error('Error:', error.message);

    if (error.message.includes('Dynamic require')) {
      console.error('\n💡 This is likely an ESM/CJS interop issue.');
      console.error('   Try using `format: "cjs"` in esbuild config.');
    }

    if (error.message.includes('Cannot find module')) {
      console.error('\n💡 A dependency is missing from the bundle.');
      console.error('   Check that all required packages are installed.');
    }

    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

verify();
