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

## Monorepo Setup with Vercel

**Vercel fully supports monorepos!** You can create multiple Vercel projects from the same GitHub repository by specifying different **Root Directory** settings. This allows:

- **Independent deployments**: API and mobile web deploy separately
- **Separate environments**: Different env vars and settings per project
- **Selective builds**: Only rebuilds when relevant code changes
- **Team collaboration**: Different team members can manage different services

## Step 1: Set Up Vercel Projects and GitHub Integration

### Install and Login to Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your Vercel account
vercel login
```

### Create Vercel Projects in Dashboard

**Yes!** For a monorepo, you create **two separate Vercel projects** connected to the **same GitHub repository**, each targeting a different directory.

1. **Go to Vercel Dashboard**: Visit [vercel.com](https://vercel.com) and sign in

2. **Create API Project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Connect your GitHub account if not already connected
   - Select your repository
   - Configure project:
     - **Name**: `524-api`
     - **Root Directory**: `packages/api` ← This tells Vercel to deploy from the API package
     - **Framework Preset**: "Other" (we'll configure manually)
     - Click "Create"

3. **Create Mobile Web Project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - **Select your same repository again** (Vercel allows multiple projects per repo)
   - Configure project:
     - **Name**: `524-mobile-web`
     - **Root Directory**: `packages/mobile` ← This tells Vercel to deploy from the mobile package
     - **Framework Preset**: "Other" (we'll configure manually)
     - Click "Create"

### Configure Build Settings

After creating projects, configure each one:

**For API Project (`524-api`)**:
- Go to Project Settings → Build & Development
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `18.x` or `20.x`

**For Mobile Web Project (`524-mobile-web`)**:
- Go to Project Settings → Build & Development
- **Build Command**: `npx expo export --platform web`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `18.x` or `20.x`

## Step 2: Set Environment Variables

### Option 1: Use Neon's Vercel Integration (Recommended)

**Neon has a built-in Vercel integration** that automatically sets up your DATABASE_URL!

1. In your Vercel project dashboard, go to **Integrations** tab
2. Search for "Neon" and click **Add Integration**
3. Select your Neon project (`524-beauty`)
4. Choose the database and branch
5. Vercel will automatically add the `DATABASE_URL` environment variable

**Benefits:**
- No manual copying of connection strings
- Automatically updates if you change Neon settings
- Secure - connection details stay within Neon's systems

### Option 2: Manual Environment Variables

If you prefer manual setup, add these variables in Settings → Environment Variables:

```bash
# Database - Your Neon connection string
DATABASE_URL=postgresql://neondb_owner:npg_uQDm0P1vXbAc@ep-hidden-boat-a1iz7fok-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

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

## Environment-Specific Variables in Vercel

**Vercel supports different environments:**
- **Production**: Main branch deployments
- **Preview**: Feature branch deployments
- **Development**: Local development (not used for deployments)

**To set different variables per environment:**

1. In Vercel dashboard → Settings → Environment Variables
2. For each variable, choose the **Environments** dropdown:
   - **All Environments**: Applies to Production, Preview, and Development
   - **Production**: Only production deployments
   - **Preview**: Only preview/feature branch deployments
   - **Development**: Only local development

**Example setup:**
- `DATABASE_URL`: **Production** (use production Neon database/branch)
- `NODE_ENV`: **All Environments** (set to "production" for all)
- `DEBUG`: **Preview** (enable debug logging only on feature branches)
- `API_URL`: **All Environments** (different values for each environment)

**For different Neon databases per environment:**
1. Create separate branches in Neon (e.g., `main` for prod, `staging` for preview)
2. Use Neon's Vercel integration for each environment
3. Or manually set different `DATABASE_URL` values per environment

**Preview deployments** will use staging database, **production deployments** will use production database.

### Trigger API Deployment

After setting environment variables, deployments will happen automatically on git pushes. To manually trigger a deployment:

1. Go to your `524-api` project in Vercel dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment

## Step 3: Configure Mobile Web App

### Update Environment Variables for Mobile Web

In the Vercel dashboard for your `524-mobile-web` project:

1. Go to Settings → Environment Variables
2. Add these variables:

```bash
API_URL=https://524-api.vercel.app
WS_URL=wss://524-api.vercel.app
NODE_ENV=production
ENV=production
```

### Trigger Mobile Web Deployment

1. Go to your `524-mobile-web` project in Vercel dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment

## Step 4: Update CORS in API

After both deployments are complete:

1. Get your mobile web URL from the Vercel dashboard (it will be something like `https://524-mobile-web.vercel.app`)
2. Update the `CORS_ORIGIN` in your `524-api` project's environment variables:

```bash
CORS_ORIGIN=https://524-mobile-web.vercel.app
```

3. Trigger a new deployment of the API through the Vercel dashboard

## Step 5: Test Your Deployments

### Test API
Visit: `https://524-api.vercel.app/health`

### Test Mobile Web App
Visit: `https://524-mobile-web.vercel.app`

## Step 6: Share with Your Team

Your team can now access:
- **API**: `https://524-api.vercel.app`
- **Mobile Web**: `https://524-mobile-web.vercel.app`

## Deployment Workflow

**For future deployments:**
- Push code changes to your GitHub repository
- Vercel will automatically deploy both projects
- Or manually trigger deployments from the Vercel dashboard

**Environment variable changes:**
- Update variables in Vercel dashboard
- Manually trigger redeployment for each project

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
