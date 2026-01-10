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

// Set mock environment variables BEFORE importing the bundle
// This prevents Zod validation errors during CI where real env vars aren't available
// The bundle will be properly configured with real env vars when deployed to Vercel
function setMockEnvForVerification() {
  const mockEnv = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://mock:mock@localhost:5432/mock',
    VERCEL: '1', // Skip .env file loading
    // S3 credentials required by uploadService.ts at module load time
    S3_ACCESS_KEY: 'mock-access-key',
    S3_SECRET_KEY: 'mock-secret-key',
    S3_BUCKET: 'mock-bucket',
    S3_REGION: 'us-east-1',
  };

  for (const [key, value] of Object.entries(mockEnv)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function verify() {
  console.log('🔍 Verifying Vercel bundle...\n');

  // Check bundle exists
  if (!existsSync(bundlePath)) {
    console.error('❌ Bundle not found at:', bundlePath);
    console.error('   Run "pnpm build:vercel" first.');
    process.exit(1);
  }

  console.log('✓ Bundle exists at:', bundlePath);

  // Set mock env vars before importing (required for Zod validation in the bundle)
  setMockEnvForVerification();

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
