#!/bin/bash

# Vercel Deployment Script for 524 Beauty Marketplace
# This script helps deploy API and Mobile Web to Vercel

set -e

echo "🚀 524 Beauty Marketplace - Vercel Deployment"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Run: vercel login"
    exit 1
fi

# Function to deploy a package
deploy_package() {
    local package_name=$1
    local package_dir=$2
    local project_name=$3

    echo ""
    echo "📦 Deploying $package_name..."
    echo "------------------------------"

    cd "$package_dir"

    # Check if project exists, create if not
    if ! vercel projects ls | grep -q "$project_name"; then
        echo "📝 Creating new Vercel project: $project_name"
        vercel --prod --name "$project_name" --yes
    else
        echo "📝 Deploying to existing project: $project_name"
        vercel --prod --yes
    fi

    cd - > /dev/null
}

# Deploy API
deploy_package "API" "packages/api" "524-api"

# Deploy Mobile Web
deploy_package "Mobile Web" "packages/mobile" "524-mobile-web"

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "📋 Next Steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Update CORS_ORIGIN with your new domains"
echo "3. Test the deployments"
echo "4. Share the URLs with your team"
echo ""
echo "🔗 Your apps should be available at:"
echo "   API: https://524-api.vercel.app"
echo "   Mobile Web: https://524-mobile-web.vercel.app"
