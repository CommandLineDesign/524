#!/bin/bash

# ========================================
# Generate Secrets for 524
# ========================================

echo "🔐 Generating secure secrets for 524..."
echo ""

echo "# ========================================"
echo "# Copy these to your .env files"
echo "# ========================================"
echo ""

echo "# JWT Secret (for access tokens)"
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
echo ""

echo "# JWT Refresh Secret (for refresh tokens)"
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
echo ""

echo "# Encryption Key (for bank accounts, sensitive data - must be hex)"
echo "ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo ""

echo "# NextAuth Secret (for web dashboard)"
echo "NEXTAUTH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
echo ""

echo "# ========================================"
echo "# ⚠️  IMPORTANT:"
echo "# - Never commit these values to git"
echo "# - Use different secrets for dev/staging/prod"
echo "# - Store production secrets securely"
echo "# ========================================"

