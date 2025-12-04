import Redis from 'ioredis';

import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('redis');

let client: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!client) {
    client = new Redis(env.REDIS_URL);
    client.on('error', (error: Error) => logger.error({ error }, 'Redis error'));
    client.on('connect', () => logger.info('Redis connection established'));
  }

  return client;
}

