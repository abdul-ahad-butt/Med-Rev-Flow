import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { envStorage } from './envStorage';
import { config } from './env';

let prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      const env = envStorage.getStore() || {};
      const d1Db = env.DB;
      
      if (!d1Db) {
        throw new Error("D1 database binding 'DB' is not configured in the environment");
      }
      
      const adapter = new PrismaD1(d1Db);
      
      prismaInstance = new PrismaClient({ 
        adapter,
        log: env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    }
    return (prismaInstance as any)[prop];
  }
});
