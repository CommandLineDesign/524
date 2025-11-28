import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ path: process.env.ENV_FILE ?? '.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z
    .string()
    .optional()
    .default('*'),
  TRUST_PROXY: z.union([z.boolean(), z.string()]).default(false),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  SENS_SENDER_NUMBER: z.string().optional(),
  LOG_LEVEL: z.string().optional().default('info')
});

export const env = envSchema.parse(process.env);

