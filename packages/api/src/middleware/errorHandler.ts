import type { NextFunction, Request, Response } from 'express';

import { createLogger } from '../utils/logger';

const errorLogger = createLogger('errors');

interface HttpError extends Error {
  status?: number;
  details?: unknown;
}

export function errorHandler(error: HttpError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = error.status ?? 500;

  if (statusCode >= 500) {
    errorLogger.error({ err: error, path: req.originalUrl }, 'Unhandled server error');
  } else {
    errorLogger.warn({ err: error, path: req.originalUrl }, 'Client error');
  }

  res.status(statusCode).json({
    error: error.message || 'Internal Server Error',
    details: error.details,
    statusCode
  });
}

