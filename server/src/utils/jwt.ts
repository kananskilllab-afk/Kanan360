import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { Role } from '@kanan-baroda/shared';

export interface AccessTokenPayload {
  sub: string; // user id — always the one Super Admin
  role: Role;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessTtl as jwt.SignOptions['expiresIn'] });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string };
}
