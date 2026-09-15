import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDb();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] Kanan Baroda API listening on :${env.port} (${env.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error('[server] failed to start', err);
  process.exit(1);
});
