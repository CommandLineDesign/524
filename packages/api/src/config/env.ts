import fs from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load env with fallbacks so running from repo root or packages/api works.
const candidateEnvFiles = [
  process.env.ENV_FILE, // explicit override
  path.resolve(process.cwd(), '.env'), // current working directory
  path.resolve(process.cwd(), '..', '.env'), // one level up (e.g., packages/.env)
  path.resolve(process.cwd(), '..', '..', '.env'), // repo root when CWD is packages/api
].filter(Boolean) as string[];

for (const envPath of candidateEnvFiles) {
  if (fs.existsSync(envPath)) {
    loadEnv({ path: envPath });
    break;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5240),
  DATABASE_URL: z.string(),
  // Canonical local origins: admin (5241) + api (5240) + Expo Metro (5242)
  CORS_ORIGIN: z
    .string()
    .optional()
    .default('http://localhost:5241,http://localhost:5240,http://localhost:5242'),
  TRUST_PROXY: z.union([z.boolean(), z.string()]).default(false),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  SENS_SENDER_NUMBER: z.string().optional(),
  LOG_LEVEL: z.string().optional().default('info'),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute in milliseconds
  RATE_LIMIT_MAX_MESSAGES: z.coerce.number().default(30), // 30 messages per minute
  MAX_CONNECTIONS_PER_USER: z.coerce.number().default(3), // Maximum concurrent websocket connections per user
  GEOCODE_CACHE_STATS_INTERVAL_MS: z.coerce.number().default(300000), // 5 minutes
});

// Support alternative AWS-style variable names (AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, etc.)
const mergedEnv = {
  ...process.env,
  S3_REGION: process.env.S3_REGION ?? process.env.AWS_S3_REGION ?? process.env.AWS_REGION,
  S3_BUCKET: process.env.S3_BUCKET ?? process.env.AWS_S3_BUCKET ?? process.env.AWS_BUCKET,
  S3_ACCESS_KEY:
    process.env.S3_ACCESS_KEY ?? process.env.AWS_S3_ACCESS_KEY ?? process.env.AWS_ACCESS_KEY_ID,
  S3_SECRET_KEY:
    process.env.S3_SECRET_KEY ?? process.env.AWS_S3_SECRET_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
  S3_PUBLIC_BASE_URL:
    process.env.S3_PUBLIC_BASE_URL ??
    process.env.AWS_S3_PUBLIC_BASE_URL ??
    process.env.CLOUDFRONT_BASE_URL ??
    process.env.CLOUDFRONT_PUBLIC_BASE_URL ??
    process.env.AWS_CLOUDFRONT_URL ??
    process.env.CDN_PUBLIC_BASE_URL,
};

export const env = envSchema.parse(mergedEnv);
