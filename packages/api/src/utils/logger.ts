import pino from 'pino';

import { env } from '../config/env.js';

export function createLogger(name?: string) {
  return pino({
    name: name ?? 'api',
    level: env.LOG_LEVEL,
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: { colorize: true }
          }
        : undefined
  });
}

export const logger = createLogger();

