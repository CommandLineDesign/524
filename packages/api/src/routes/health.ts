import { type Router as ExpressRouter, Router } from 'express';

const router: ExpressRouter = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

export const healthRouter: ExpressRouter = router;
