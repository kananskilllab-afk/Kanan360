// Vercel serverless entry point for the Express API. Reuses the same
// createApp()/connectDb() the traditional long-running server uses (see
// server/src/index.ts) -- only the transport differs: instead of
// app.listen(), each invocation hands the request straight to the Express
// app, connecting to MongoDB once per warm container rather than once per
// process (mongoose's connection is a module-level singleton, so it's
// already shared across invocations in the same container).
import mongoose from 'mongoose';
import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/config/db.js';

const app = createApp();
let dbReady: Promise<void> | null = null;

export default async function handler(req: unknown, res: unknown) {
  if (mongoose.connection.readyState === 0) {
    dbReady ??= connectDb();
    await dbReady;
  }
  // Express apps are callable as (req, res) => void -- no adapter needed.
  return (app as unknown as (req: unknown, res: unknown) => void)(req, res);
}
