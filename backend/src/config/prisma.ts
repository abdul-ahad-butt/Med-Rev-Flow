import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';
import { envStorage } from './envStorage';
import { config } from './env';

let prismaInstance: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      const env = envStorage.getStore() || {};
      const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL || config.databaseUrl;
      
      if (!dbUrl) {
        throw new Error("DATABASE_URL is not configured in the environment");
      }
      
      const pool = new Pool({ connectionString: dbUrl });
      const adapter = new PrismaNeon(pool);
      
      prismaInstance = new PrismaClient({ 
        adapter,
        log: env.NODE_ENV === 'development' || process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    }
    return (prismaInstance as any)[prop];
  }
});
