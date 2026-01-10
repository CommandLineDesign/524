import { type Router as IRouter, type Request, type Response, Router } from 'express';
import { z } from 'zod';

import { createGeocodeRateLimiter } from '../../middleware/rateLimiter.js';
import { geocodeAddress, keywordSearch, reverseGeocode } from '../../services/geocodeService.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('geocode-routes');

const router = Router();

// Apply rate limiting to all geocode routes (30 req/min per IP)
router.use(createGeocodeRateLimiter());

const geocodeRequestSchema = z.object({
  address: z.string().min(1, 'Address is required').max(500),
});

const keywordSearchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(200),
  x: z.string().optional(),
  y: z.string().optional(),
  page: z.number().int().min(1).max(45).optional(),
  size: z.number().int().min(1).max(15).optional(),
});

const reverseGeocodeRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = geocodeRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { address } = parsed.data;

  try {
    const result = await geocodeAddress(address);

    if (!result) {
      res.status(404).json({
        error: 'Address not found',
        message: 'Could not find coordinates for the provided address',
      });
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Geocoding request failed');
    res.status(500).json({
      error: 'Geocoding failed',
      message: 'An error occurred while geocoding the address',
    });
  }
});

router.post('/keyword-search', async (req: Request, res: Response) => {
  const parsed = keywordSearchRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { query, x, y, page, size } = parsed.data;

  try {
    const results = await keywordSearch(query, { x, y, page, size });
    res.json({ results });
  } catch (error) {
    logger.error({ err: error }, 'Keyword search request failed');
    res.status(500).json({
      error: 'Search failed',
      message: 'An error occurred while searching for locations',
    });
  }
});

router.post('/reverse', async (req: Request, res: Response) => {
  const parsed = reverseGeocodeRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request',
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { latitude, longitude } = parsed.data;

  try {
    const result = await reverseGeocode(latitude, longitude);

    if (!result) {
      res.status(404).json({
        error: 'Address not found',
        message: 'Could not find an address for the provided coordinates',
      });
      return;
    }

    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Reverse geocoding request failed');
    res.status(500).json({
      error: 'Reverse geocoding failed',
      message: 'An error occurred while reverse geocoding the coordinates',
    });
  }
});

export const geocodeRouter: IRouter = router;
