import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken, type AccessTokenPayload } from '../utils/jwt.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

// The only access check the API has: authenticated or not. There is
// exactly one role (SUPER_ADMIN — see @kanan-baroda/shared ROLES), so
// "authenticated" and "authorized" are the same thing here. Every mutating
// and admin-detail route requires this; every public route omits it
// entirely rather than gating on a role check that would be trivially
// true (ARCH-SPEC "CRITICAL ACCESS REQUIREMENT").
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return next(ApiError.unauthorized());
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized('Session expired, please sign in again'));
  }
}
