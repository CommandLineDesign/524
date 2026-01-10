# Vercel Runtime Errors - FUNCTION_INVOCATION_FAILED

## Issue

The API builds successfully on Vercel but fails at runtime with `FUNCTION_INVOCATION_FAILED` error when accessing any endpoint (e.g., `/health`).

## Root Cause

The serverless function is failing during initialization because required environment variables are not set in Vercel. Specifically, `DATABASE_URL` is required by the `env.ts` configuration but is missing.

## Solution

### 1. Set Required Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add the following:

#### Required Variables:
- `DATABASE_URL` - Your Neon/PostgreSQL database connection string
  - Format: `postgresql://user:password@host/database?sslmode=require`
  - **This is CRITICAL** - the app will fail without it

#### Recommended Variables:
- `NODE_ENV=production`
- `CORS_ORIGIN` - Comma-separated list of allowed origins
  - Example: `https://524-mobile-web.vercel.app,https://524-admin-web.vercel.app`
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `REDIS_URL` - Optional, for rate limiting and caching

### 2. Use Neon Integration (Recommended)

The easiest way to set `DATABASE_URL` is through the Neon integration:

1. In your Vercel project dashboard, go to **Integrations**
2. Search for "Neon" and click **Add Integration**
3. Select your Neon project and database
4. Vercel will automatically set the `DATABASE_URL` environment variable

### 3. Redeploy After Setting Variables

After adding environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger a deployment

## Recent Fixes Applied

### Fix 1: Skip .env File Loading in Serverless Environment

**File:** `packages/api/src/config/env.ts`

```typescript
// Only attempt to load .env files if we're not in a serverless environment
// Vercel and other platforms inject env vars directly
if (process.env.VERCEL !== '1') {
  for (const envPath of candidateEnvFiles) {
    if (fs.existsSync(envPath)) {
      loadEnv({ path: envPath });
      break;
    }
  }
}
```

This prevents the code from trying to load `.env` files in Vercel's serverless environment where they don't exist.

### Fix 2: Improved Error Handling in Vercel Handler

**File:** `packages/api/api/index.ts`

```typescript
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    if (!appInstance) {
      appInstance = await createApp();
    }
    
    return new Promise((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      
      const handler = appInstance as unknown as (req: VercelRequest, res: VercelResponse) => void;
      
      try {
        handler(req, res);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
    throw error;
  }
}
```

This adds comprehensive error handling and logging to help debug issues.

## How to Prevent This in the Future

### 1. Always Set Environment Variables Before Deploying

Before deploying to Vercel, ensure all required environment variables are set in the project settings.

### 2. Use Environment Variable Validation

The `env.ts` file uses Zod schema validation which will fail if required variables are missing. This is good for catching issues early, but make sure variables are set in Vercel.

### 3. Test Deployments

After setting up a new Vercel project:
1. Set all environment variables
2. Deploy
3. Test the `/health` endpoint to verify the API is working
4. Check Vercel function logs if there are errors

### 4. Local vs. Vercel Environment Differences

**Local Development:**
- Loads `.env` file from repository root
- Uses `dotenv` package to load variables
- Works with `pnpm dev` command

**Vercel Production:**
- Environment variables are injected by Vercel
- No `.env` file is available
- Variables must be set in Vercel dashboard
- `VERCEL=1` environment variable is automatically set

## Debugging Runtime Errors

If you encounter `FUNCTION_INVOCATION_FAILED`:

1. **Check Vercel Function Logs:**
   - Go to your deployment in Vercel dashboard
   - Click on "Functions" tab
   - Look for error messages in the logs

2. **Verify Environment Variables:**
   - Go to Settings → Environment Variables
   - Ensure `DATABASE_URL` and other required variables are set
   - Check that variables are set for the correct environment (Production/Preview)

3. **Test Locally:**
   - Run `pnpm --filter @524/api dev` locally
   - Ensure the API works locally before deploying
   - Check that all required environment variables are in your local `.env` file

4. **Check Build Logs:**
   - Build logs show compilation errors
   - Runtime logs show initialization and request errors
   - Look for Zod validation errors which indicate missing env vars

## Related Documentation

- [Vercel Deployment Guide](../setup/VERCEL_DEPLOYMENT_GUIDE.md)
- [Environment Setup](../setup/ENV_SETUP.md)
- [Vercel Build API Types](./vercel-build-api-types.md)
