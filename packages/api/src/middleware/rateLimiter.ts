import rateLimit from 'express-rate-limit';

export function createRateLimiter() {
  return rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests, please try again later.'
    }
  });
}

