// Convenience for local development/CI without a real MongoDB install:
// boots a real (temporary) mongod binary via mongodb-memory-server and
// prints its connection string. Point MONGODB_URI at it, e.g.:
//
//   npx tsx src/scripts/devMemMongo.ts
//   # in another terminal:
//   MONGODB_URI="<printed uri>" npm run seed
//   MONGODB_URI="<printed uri>" npm run dev
//
// Never used by the production app itself — only a local/CI convenience.
import { MongoMemoryServer } from 'mongodb-memory-server';

async function main() {
  const mem = await MongoMemoryServer.create({ instance: { dbName: 'kanan-baroda' } });
  const uri = mem.getUri('kanan-baroda');
  console.log('\n[dev-memdb] in-memory MongoDB running');
  console.log(`[dev-memdb] MONGODB_URI=${uri}`);
  console.log('[dev-memdb] Ctrl+C to stop.\n');

  process.on('SIGINT', async () => {
    await mem.stop();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('[dev-memdb] failed to start', err);
  process.exit(1);
});
