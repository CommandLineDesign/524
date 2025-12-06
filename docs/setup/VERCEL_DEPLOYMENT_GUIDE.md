# Vercel Development Deployment Guide for 524 Beauty Marketplace

This guide provides step-by-step instructions for deploying the 524 Beauty Marketplace API, Mobile Web App, and Admin Web Dashboard to Vercel for team development access.

## Prerequisites

Before starting, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code pushed to GitHub (with Neon database already configured)
3. **Vercel CLI**: `npm install -g vercel`

## Project Overview

Your monorepo contains:
- **API** (`packages/api/`): Node.js/Express backend with PostgreSQL
- **Mobile Web** (`packages/mobile/`): Expo React Native app (web-compatible)
- **Admin Web** (`packages/web/`): Next.js admin dashboard for managing artists, users, and bookings

## Local Port Conventions (for previews and callbacks)

- API: `http://localhost:5240`
- Admin Web: `http://localhost:5241`
- Expo Metro (mobile bundler): `http://localhost:5242`

Vercel environments do not expose custom ports, but set env vars (e.g., `NEXT_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_URL`) to the deployed hostnames that replace these local URLs. Update any OAuth/payment redirect URIs to match the API origin you deploy to Vercel.

## Monorepo Setup with Vercel

**Vercel fully supports monorepos!** You can create multiple Vercel projects from the same GitHub repository by specifying different **Root Directory** settings. This allows:

- **Independent deployments**: API, mobile web, and admin web deploy separately
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

**Yes!** For a monorepo, you create **three separate Vercel projects** connected to the **same GitHub repository**, each targeting a different directory.

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

4. **Create Admin Web Project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - **Select your same repository again** (Vercel allows multiple projects per repo)
   - Configure project:
     - **Name**: `524-admin-web`
     - **Root Directory**: `packages/web` ← This tells Vercel to deploy from the web package
     - **Framework Preset**: "Next.js" (Vercel will auto-detect this)
     - Click "Create"

### Configure Build Settings

After creating projects, configure each one:

**For API Project (`524-api`)**:
- Go to Project Settings → Build & Development Settings
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: `20.x`

**For Mobile Web Project (`524-mobile-web`)**:
- Go to Project Settings → Build & Development
- **Build Command**: Leave empty (uses `vercel.json`)
- **Output Directory**: Leave empty (uses `vercel.json`)
- **Install Command**: `npm install`
- **Node.js Version**: `18.x` or `20.x`

> **Note:** The `packages/mobile/vercel.json` configures Expo web build automatically.

**For Admin Web Project (`524-admin-web`)**:
- Go to Project Settings → Build & Development Settings
- **Framework Preset**: Next.js (should be auto-detected)
- **Build Command**: `npm run build` (default for Next.js)
- **Output Directory**: `.next` (default for Next.js, auto-configured)
- **Install Command**: `npm install`
- **Node.js Version**: `20.x` (recommended for Next.js 16+)

> **Note:** Next.js projects on Vercel are automatically optimized. No additional configuration needed unless you have custom requirements.

## Step 2: Connect Neon Database via Integration

### Add Neon Integration to API Project

1. In your `524-api` project dashboard, go to **Integrations** tab
2. Search for "Neon" and click **Add Integration**
3. Select your Neon project (`524-beauty`)
4. Choose the database and branch
5. Vercel will automatically add the `DATABASE_URL` environment variable

### Set Remaining API Environment Variables

In `524-api` project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NODE_ENV` | `production` | All Environments |
| `PORT` | `3000` | All Environments |
| `CORS_ORIGIN` | `https://524-mobile-web.vercel.app` | Production |
| `CORS_ORIGIN` | `https://*.vercel.app` | Preview |
| `JWT_SECRET` | `jnKemjQPR0UrsCh3bhWMfON6OGiIxV35VJGtG7H/3L0=` | All Environments |
| `JWT_REFRESH_SECRET` | `9DCST0JTuX1NAiESRcWqrnMtW+IUoq18zOxvLp0aPzQ=` | All Environments |
| `ENCRYPTION_KEY` | `67ce4a34ef48f32d70742a37649a34f5749fe70d04d7e2d19cef6d28d6ef87a5` | All Environments |

**Note:** Redis is optional for development. Skip `REDIS_URL` for now.

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

**For different Neon databases per environment:**
1. Create separate branches in Neon (e.g., `main` for prod, `staging` for preview)
2. The Neon integration will automatically configure the correct `DATABASE_URL` for each environment

## Vercel System Environment Variables

Vercel automatically provides these variables that are useful for monorepo setups:

| Variable | Description | Example |
|----------|-------------|---------|
| `VERCEL_ENV` | Current environment | `production`, `preview`, `development` |
| `VERCEL_URL` | Current deployment URL (no protocol) | `524-mobile-web-abc123.vercel.app` |
| `VERCEL_GIT_COMMIT_REF` | Git branch name | `main`, `feature/auth` |
| `VERCEL_GIT_COMMIT_SHA` | Git commit hash | `abc123def456...` |

**Use these in your code to dynamically determine URLs:**

```typescript
// Determine environment
const isProduction = process.env.VERCEL_ENV === 'production';
const isPreview = process.env.VERCEL_ENV === 'preview';

// Construct URLs based on environment
const apiUrl = isProduction
  ? 'https://524-api.vercel.app'
  : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
```

### Trigger API Deployment

After setting environment variables, deployments will happen automatically on git pushes. To manually trigger a deployment:

1. Go to your `524-api` project in Vercel dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment

## Step 3: Configure Mobile Web App

### Setting API_URL for Different Environments

Since API and Mobile Web are separate Vercel projects, you need to configure the frontend to find the correct API for each environment.

**The Challenge:**
- Production and Preview deployments need different API URLs
- Preview deployments generate unique URLs each time
- You need a reliable way to connect frontend → API

**Recommended Approach: Use Stable Environment URLs**

Set up stable API URLs for each environment:

| Environment | Frontend URL | API URL |
|-------------|--------------|---------|
| Production | `524-mobile-web.vercel.app` | `524-api.vercel.app` |
| Preview | `524-mobile-web-*.vercel.app` | `524-api-git-*.vercel.app` (or staging URL) |
| Development | `localhost:8081` | `localhost:3000` |

### Option A: Simple Setup (Single Staging API)

Use the same API for all preview deployments:

**In `524-mobile-web` project → Settings → Environment Variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `EXPO_PUBLIC_API_URL` | `https://524-api.vercel.app` | **Production** |
| `EXPO_PUBLIC_API_URL` | `https://524-api.vercel.app` | **Preview** (use prod API for now) |
| `NODE_ENV` | `production` | **All Environments** |
| `ENV` | `production` | **Production** |
| `ENV` | `preview` | **Preview** |

### Option B: Separate Staging API (Recommended for Teams)

Create a separate staging API deployment for preview branches:

1. **Create a staging branch** in your repo (e.g., `staging` or `develop`)
2. **Configure `524-api` project** to deploy `staging` branch to a stable URL
3. **Set preview environment variable** to use staging API:

| Variable | Value | Environment |
|----------|-------|-------------|
| `EXPO_PUBLIC_API_URL` | `https://524-api.vercel.app` | **Production** |
| `EXPO_PUBLIC_API_URL` | `https://524-api-staging.vercel.app` | **Preview** |

### Option C: Dynamic URL Construction (Advanced)

For branch-matched deployments, create a runtime API URL resolver:

```typescript
// packages/mobile/src/config/api.ts
const getApiUrl = () => {
  // Production
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://524-api.vercel.app';
  }
  
  // Preview - construct from branch name
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  if (branch && process.env.VERCEL_ENV === 'preview') {
    // Vercel preview URLs follow this pattern
    return `https://524-api-git-${branch.replace(/\//g, '-')}.vercel.app`;
  }
  
  // Fallback to environment variable
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
};

export const API_URL = getApiUrl();
```

### Trigger Mobile Web Deployment

1. Go to your `524-mobile-web` project in Vercel dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment

## Step 4: Configure Admin Web App

### Setting API_URL for Different Environments

The Admin Web dashboard needs to connect to your API. Similar to Mobile Web, configure the API URL based on the deployment environment.

**Recommended Approach: Use Stable Environment URLs**

Set up stable API URLs for each environment:

| Environment | Frontend URL | API URL |
|-------------|--------------|---------|
| Production | `524-admin-web.vercel.app` | `524-api.vercel.app` |
| Preview | `524-admin-web-*.vercel.app` | `524-api-git-*.vercel.app` (or staging URL) |
| Development | `localhost:3000` | `localhost:3000` |

### Option A: Simple Setup (Single Staging API)

Use the same API for all preview deployments:

**In `524-admin-web` project → Settings → Environment Variables:**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://524-api.vercel.app` | **Production** |
| `NEXT_PUBLIC_API_URL` | `https://524-api.vercel.app` | **Preview** (use prod API for now) |
| `NODE_ENV` | `production` | **All Environments** |
| `ENV` | `production` | **Production** |
| `ENV` | `preview` | **Preview** |

### Option B: Separate Staging API (Recommended for Teams)

Create a separate staging API deployment for preview branches:

1. **Create a staging branch** in your repo (e.g., `staging` or `develop`)
2. **Configure `524-api` project** to deploy `staging` branch to a stable URL
3. **Set preview environment variable** to use staging API:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://524-api.vercel.app` | **Production** |
| `NEXT_PUBLIC_API_URL` | `https://524-api-staging.vercel.app` | **Preview** |

### Option C: Dynamic URL Construction (Advanced)

For branch-matched deployments, create a runtime API URL resolver in your Next.js app:

```typescript
// packages/web/src/config/api.ts
const getApiUrl = () => {
  // Production
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://524-api.vercel.app';
  }
  
  // Preview - construct from branch name
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  if (branch && process.env.VERCEL_ENV === 'preview') {
    // Vercel preview URLs follow this pattern
    return `https://524-api-git-${branch.replace(/\//g, '-')}.vercel.app`;
  }
  
  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const API_URL = getApiUrl();
```

Then use this in your React Admin data provider:

```typescript
// packages/web/src/components/AdminApp.tsx
import { API_URL } from '../config/api';
const dataProvider = jsonServerProvider(API_URL);
```

### Trigger Admin Web Deployment

1. Go to your `524-admin-web` project in Vercel dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment

## Step 5: Update CORS in API

After all deployments are complete, configure CORS to allow your frontend domains:

### CORS Configuration for Multiple Environments

In your `524-api` project → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `CORS_ORIGIN` | `https://524-mobile-web.vercel.app,https://524-admin-web.vercel.app` | **Production** |
| `CORS_ORIGIN` | `https://524-mobile-web-*.vercel.app,https://524-admin-web-*.vercel.app,https://524-mobile-web.vercel.app,https://524-admin-web.vercel.app` | **Preview** |

**Note:** For preview deployments, you may need to use a wildcard pattern or update CORS dynamically. Options:

1. **Allow all Vercel preview URLs** (for development only):
   ```bash
   CORS_ORIGIN=https://*.vercel.app
   ```

2. **Use specific patterns** (more secure):
   ```bash
   CORS_ORIGIN=https://524-mobile-web.vercel.app,https://524-admin-web.vercel.app,https://524-mobile-web-git-*.vercel.app,https://524-admin-web-git-*.vercel.app
   ```

3. **Dynamic CORS in code** (most flexible):
   Update your API to check if the origin matches your project patterns. This is recommended for production environments.

### Trigger API Redeployment

After updating environment variables, trigger a new deployment from the Vercel dashboard.

## Step 6: Test Your Deployments

### Test API
Visit: `https://524-api.vercel.app/health`

Expected response: `{"status":"ok"}` or similar health check response.

### Test Mobile Web App
Visit: `https://524-mobile-web.vercel.app`

Verify the mobile web interface loads correctly.

### Test Admin Web App
Visit: `https://524-admin-web.vercel.app`

Verify the admin dashboard loads and can connect to the API. You should see the React Admin interface.

## Step 7: Share with Your Team

Your team can now access:
- **API**: `https://524-api.vercel.app`
- **Mobile Web**: `https://524-mobile-web.vercel.app`
- **Admin Web**: `https://524-admin-web.vercel.app`

## Deployment Workflow

**For future deployments:**
- Push code changes to your GitHub repository
- Vercel will automatically deploy all three projects (API, Mobile Web, Admin Web)
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
- Make sure `CORS_ORIGIN` includes both mobile web and admin web domains
- Include `https://` protocol
- For preview deployments, ensure wildcard patterns or specific preview URLs are included

**API Connection Issues:**
- Check that Neon integration is connected in Vercel dashboard
- Verify environment variables are set correctly

## Next Steps

1. **Test thoroughly** - Try login, registration, and basic features
2. **Invite team members** - Add them to your Vercel projects
3. **Set up monitoring** - Enable Vercel Analytics if needed
4. **Configure domains** - Add custom domains if desired

---

**Need Help?** Check Vercel function logs in your dashboard or consult the Vercel documentation.
