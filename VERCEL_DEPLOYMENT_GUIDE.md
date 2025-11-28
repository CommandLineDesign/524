# Vercel Development Deployment Guide for 524 Beauty Marketplace

This guide provides step-by-step instructions for deploying the 524 Beauty Marketplace API and Mobile Web App to Vercel for team development access.

## Prerequisites

Before starting, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code pushed to GitHub (with Neon database already configured)
3. **Vercel CLI**: `npm install -g vercel`

## Project Overview

Your monorepo contains:
- **API** (`packages/api/`): Node.js/Express backend with PostgreSQL
- **Mobile Web** (`packages/mobile/`): Expo React Native app (web-compatible)

## Step 1: Install and Login to Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login
```

## Step 2: Deploy API to Vercel

### Navigate to API Package

```bash
cd packages/api
```

### Deploy API

```bash
vercel --prod
```

When prompted:
- **Project name**: `524-api` (or your preferred name)
- **Directory**: `./packages/api` (current directory)
- Confirm settings with Enter

### Set Environment Variables for API

In the Vercel dashboard (vercel.com):

1. Go to your project → Settings → Environment Variables
2. Add these variables:

```bash
# Database (use your existing Neon connection string)
DATABASE_URL=postgresql://[your-neon-connection-string]

# Basic config
NODE_ENV=production
PORT=3000

# CORS (update with your Vercel domains after deployment)
CORS_ORIGIN=https://your-mobile-web.vercel.app

# JWT Secrets (generate new ones for production)
JWT_SECRET=[generate-new-secret]
JWT_REFRESH_SECRET=[generate-new-secret]

# Encryption Key (generate new one)
ENCRYPTION_KEY=[32-byte-hex-key]

# Redis (optional - can skip for basic development)
REDIS_URL=[your-redis-url]
```

**Generate secure secrets:**
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Trigger Redeploy

After setting environment variables, trigger a new deployment:

```bash
vercel --prod
```

## Step 3: Deploy Mobile Web App to Vercel

### Navigate to Mobile Package

```bash
cd packages/mobile
```

### Update Environment Variables

Create or update `.env` file in the mobile package:

```bash
# Update with your API's Vercel domain
API_URL=https://524-api.vercel.app
WS_URL=wss://524-api.vercel.app

# Environment
NODE_ENV=production
ENV=production
```

### Deploy Mobile Web

```bash
vercel --prod
```

When prompted:
- **Project name**: `524-mobile-web` (or your preferred name)
- **Directory**: `./packages/mobile` (current directory)
- Confirm settings with Enter

### Set Environment Variables for Mobile Web

In the Vercel dashboard for your mobile project:

```bash
API_URL=https://524-api.vercel.app
WS_URL=wss://524-api.vercel.app
NODE_ENV=production
ENV=production
```

### Trigger Redeploy

```bash
vercel --prod
```

## Step 4: Update CORS in API

After both deployments are complete:

1. Get your mobile web URL from Vercel dashboard
2. Update the `CORS_ORIGIN` in your API environment variables:

```bash
CORS_ORIGIN=https://524-mobile-web.vercel.app
```

3. Redeploy the API:

```bash
cd packages/api
vercel --prod
```

## Step 5: Test Your Deployments

### Test API
Visit: `https://524-api.vercel.app/health`

### Test Mobile Web App
Visit: `https://524-mobile-web.vercel.app`

## Step 6: Share with Your Team

Your team can now access:
- **API**: `https://524-api.vercel.app`
- **Mobile Web**: `https://524-mobile-web.vercel.app`

## Quick Deployment Script

I've created a deployment script for you. Run:

```bash
./scripts/deploy-vercel.sh
```

This will deploy both your API and mobile web app automatically.

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Vercel function logs in dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

**CORS Errors:**
- Make sure `CORS_ORIGIN` includes your mobile web domain
- Include `https://` protocol

**API Connection Issues:**
- Verify your Neon database connection string
- Check environment variables in Vercel dashboard

## Next Steps

1. **Test thoroughly** - Try login, registration, and basic features
2. **Invite team members** - Add them to your Vercel projects
3. **Set up monitoring** - Enable Vercel Analytics if needed
4. **Configure domains** - Add custom domains if desired

---

**Need Help?** Check Vercel function logs in your dashboard or consult the Vercel documentation.
