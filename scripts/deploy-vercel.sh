#!/bin/bash

# Vercel Deployment Helper Script for 524 Beauty Marketplace
# This script checks deployment status and provides guidance

set -e

echo "🚀 524 Beauty Marketplace - Vercel Deployment Helper"
echo "===================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: pnpm add -g vercel (or npm install -g vercel)"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run: vercel login"
    exit 1
fi

echo ""
echo "📋 Deployment Status Check:"
echo "---------------------------"

# Check if projects exist
api_exists=$(vercel projects ls | grep -q "524-api" && echo "✅" || echo "❌")
mobile_exists=$(vercel projects ls | grep -q "524-mobile-web" && echo "✅" || echo "❌")

echo "API Project (524-api): $api_exists"
echo "Mobile Web Project (524-mobile-web): $mobile_exists"

if [[ "$api_exists" == "❌" || "$mobile_exists" == "❌" ]]; then
    echo ""
    echo "⚠️  Missing Projects Detected!"
    echo "=============================="
    echo "Please create the missing projects in the Vercel dashboard first:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Click 'Add New...' → 'Project'"
    echo "3. Import your GitHub repository"
    echo "4. Configure as per VERCEL_DEPLOYMENT_GUIDE.md"
    echo ""
    echo "Required projects:"
    if [[ "$api_exists" == "❌" ]]; then
        echo "- 524-api (Root Directory: packages/api)"
    fi
    if [[ "$mobile_exists" == "❌" ]]; then
        echo "- 524-mobile-web (Root Directory: packages/mobile)"
    fi
    exit 1
fi

echo ""
echo "✅ All projects found!"
echo "======================"
echo ""
echo "📝 Next Steps:"
echo "1. Ensure environment variables are set in Vercel dashboard"
echo "2. Push code changes to trigger automatic deployments"
echo "3. Or manually redeploy from Vercel dashboard"
echo "4. Test your deployments"
echo ""
echo "🔗 Your apps should be available at:"
echo "   API: https://524-api.vercel.app"
echo "   Mobile Web: https://524-mobile-web.vercel.app"
