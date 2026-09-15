import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/kanan-baroda'),
  jwtSecret: required('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev-only-insecure-refresh-secret-change-me'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  // Comma-separated — Vite's dev port drifts whenever 5173 is already
  // taken by something else, so CORS can't be pinned to a single origin.
  clientUrls: (process.env.CLIENT_URL ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  uploadStorage: process.env.UPLOAD_STORAGE ?? 'local',
} as const;

export const isProd = env.nodeEnv === 'production';
