import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { envStorage } from './envStorage';

/**
 * Creates a fresh PrismaClient for every request.
 *
 * Why not cache? In Cloudflare Workers, the module-level scope is reused
 * across requests in the same isolate. However, D1 bindings (c.env.DB) are
 * scoped per-request. Caching a PrismaClient that was initialized with a
 * previous request's D1 binding leads to stale/closed connections and silent
 * failures. Creating a fresh client is cheap for D1 and is the correct pattern.
 */
function createPrismaClient(): PrismaClient {
  const env = envStorage.getStore() || {};
  const d1Db = (env as any).DB;

  if (!d1Db) {
    throw new Error("D1 database binding 'DB' is not configured in the environment");
  }

  const adapter = new PrismaD1(d1Db);
  return new PrismaClient({ adapter, log: ['error'] });
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = createPrismaClient();
    return (client as any)[prop];
  },
});
