import rateLimit from 'express-rate-limit';

export function createRateLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.',
    },
  });
}

/**
 * Stricter rate limiter for external API-dependent routes (e.g., geocoding).
 * 30 requests per minute per IP to protect against API quota exhaustion.
 */
export function createGeocodeRateLimiter() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many geocoding requests, please try again later.',
    },
    keyGenerator: (req) => {
      // Use X-Forwarded-For if behind proxy, otherwise use IP
      return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown'
      );
    },
  });
}
