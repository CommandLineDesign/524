#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, '..');

function run(command) {
  execSync(command, { stdio: 'inherit', cwd: workspaceRoot });
}

console.log('🔧 Bootstrapping 524 workspace...');
run('pnpm install');
console.log('✅ Dependencies installed');
