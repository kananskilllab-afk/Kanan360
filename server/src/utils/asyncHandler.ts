import type { NextFunction, Request, RequestHandler, Response } from 'express';

// Wraps an async controller so a rejected promise reaches Express's error
// handler instead of crashing the process — Express 4 doesn't await
// handlers on its own.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
