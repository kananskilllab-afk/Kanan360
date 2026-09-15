import type { NextFunction, Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`No route matches ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).json({
      error: { message: 'Validation failed', details: Object.values(err.errors).map((e) => e.message) },
    });
  }

  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
    return res.status(409).json({ error: { message: 'A record with these unique fields already exists' } });
  }

  console.error('[unhandled error]', err);
  res.status(500).json({
    error: { message: 'Something went wrong on our end', stack: isProd ? undefined : String(err) },
  });
}
