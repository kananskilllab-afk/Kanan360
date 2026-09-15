import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDb(): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.log(`[db] connected → ${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error', err);
  });

  await mongoose.connect(env.mongoUri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
