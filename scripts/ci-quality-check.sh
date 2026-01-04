#!/bin/bash

# Pre-deployment quality check script for CI/CD pipelines
# This script runs all necessary quality checks to ensure code is ready for deployment

set -e  # Exit on any error

echo "🚀 Starting Pre-Deployment Quality Checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Must be run from the monorepo root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🎨 Checking and fixing code formatting..."
pnpm run format

echo "🔧 Checking and fixing import organization..."
pnpm run check:fix

echo "🧹 Running linting checks..."
pnpm run lint

echo "🏗️ Building packages..."
pnpm run build

echo "🔍 Running type checking..."
pnpm run typecheck

echo "✅ All quality checks passed! Code is ready for deployment."
echo ""
echo "📊 Summary:"
echo "  ✅ Dependencies installed"
echo "  ✅ Code formatting validated"
echo "  ✅ Import organization checked"
echo "  ✅ Linting passed"
echo "  ✅ Type checking passed"
echo "  ✅ Build successful"