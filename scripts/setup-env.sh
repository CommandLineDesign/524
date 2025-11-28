#!/bin/bash

# ========================================
# 524 Environment Setup Script
# ========================================

set -e

echo "🚀 Setting up environment files for 524..."
echo ""

# Root
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created root .env"
else
    echo "⏭️  Root .env already exists"
fi

# API
if [ ! -f packages/api/.env ]; then
    cp packages/api/.env.example packages/api/.env
    echo "✅ Created packages/api/.env"
else
    echo "⏭️  packages/api/.env already exists"
fi

# Web (Next.js uses .env.local)
if [ ! -f packages/web/.env.local ]; then
    cp packages/web/.env.example packages/web/.env.local
    echo "✅ Created packages/web/.env.local"
else
    echo "⏭️  packages/web/.env.local already exists"
fi

# Mobile
if [ ! -f packages/mobile/.env ]; then
    cp packages/mobile/.env.example packages/mobile/.env
    echo "✅ Created packages/mobile/.env"
else
    echo "⏭️  packages/mobile/.env already exists"
fi

# Database
if [ ! -f packages/database/.env ]; then
    cp packages/database/.env.example packages/database/.env
    echo "✅ Created packages/database/.env"
else
    echo "⏭️  packages/database/.env already exists"
fi

# Notifications
if [ ! -f packages/notifications/.env ]; then
    cp packages/notifications/.env.example packages/notifications/.env
    echo "✅ Created packages/notifications/.env"
else
    echo "⏭️  packages/notifications/.env already exists"
fi

echo ""
echo "✨ Environment files created!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env files with your actual API keys"
echo "   2. See docs/ENV_SETUP.md for detailed setup instructions"
echo "   3. Run 'npm install' to install dependencies"
echo "   4. Run 'npm run dev' to start development"
echo ""
echo "🔑 Generate secrets:"
echo "   JWT Secret:       node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
echo "   Encryption Key:   node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo ""

