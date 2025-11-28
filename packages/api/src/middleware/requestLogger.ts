import type { NextFunction, Request, Response } from 'express';

import { createLogger } from '../utils/logger';

const httpLogger = createLogger('http');

export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      httpLogger.info(
        {
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          durationMs
        },
        'http request'
      );
    });

    next();
  };
}

