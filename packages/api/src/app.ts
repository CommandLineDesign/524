import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rootRouter } from './routes/index.js';

export async function createApp(): Promise<Application> {
  const app: Application = express();

  app.set('trust proxy', env.TRUST_PROXY);

  app.use(helmet());

  // Parse CORS_ORIGIN to handle comma-separated values or wildcard
  const corsOrigin =
    env.CORS_ORIGIN === '*'
      ? '*'
      : env.CORS_ORIGIN.includes(',')
        ? env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
        : env.CORS_ORIGIN;

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger());
  app.use(createRateLimiter());

  app.use('/api', rootRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
