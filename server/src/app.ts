import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { env, isProd } from './config/env.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // No Origin header (curl, server-to-server, same-origin) — allow.
        if (!origin) return callback(null, true);
        if (env.clientUrls.includes(origin)) return callback(null, true);
        // In dev, Vite's port drifts whenever 5173 is already taken by
        // something else on the machine — trust any localhost origin
        // rather than silently failing auth with a same-looking error.
        if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
          return callback(null, true);
        }
        callback(new Error(`Origin ${origin} is not allowed`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // General API ceiling; auth routes layer a tighter limiter on top
  // (see routes/auth.routes.ts).
  app.use(
    '/api',
    rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }),
  );

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
