import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function toPublicUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  lastLoginAt?: Date | null;
  status: string;
}) {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    status: user.status,
  };
}

const REFRESH_COOKIE = 'kb_refresh';
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
};

// Only ever authenticates the one Super Admin account — there is no
// registration route and never will be (ARCH-SPEC "CRITICAL ACCESS
// REQUIREMENT"). The login rate limiter in routes/auth.routes.ts matters
// more here than it would with many accounts: this is the single door.
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || user.status !== 'ACTIVE') {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role as never });
  const refreshToken = signRefreshToken(String(user._id));

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
  res.json({ accessToken, user: toPublicUser(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token');

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Refresh token expired, please sign in again');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'ACTIVE') throw ApiError.unauthorized();

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role as never });
  res.json({ accessToken, user: toPublicUser(user) });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.sub);
  if (!user) throw ApiError.unauthorized();
  res.json({ user: toPublicUser(user) });
});
