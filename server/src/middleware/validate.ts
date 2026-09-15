import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError.js';

// Every mutating route validates its body shape before a controller ever
// sees it — untrusted input never reaches a Mongoose write directly
// (ARCH-SPEC "Security").
export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(ApiError.badRequest('Invalid request body', result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}
