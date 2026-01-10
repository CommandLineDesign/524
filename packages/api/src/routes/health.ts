import { type Router as IRouter, Router } from 'express';

import { getCacheStats } from '../services/geocodeCache.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString(),
    caches: {
      geocode: getCacheStats(),
    },
  });
});

export const healthRouter: IRouter = router;
