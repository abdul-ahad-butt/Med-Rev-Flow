// dotenv is not supported in Cloudflare Workers — env vars are on c.env per request.
// We provide a static config for non-secret values, and a helper for secrets.
if (typeof process === 'undefined') {
  (globalThis as any).process = { env: {} };
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // JWT_SECRET must come from c.env in a Worker — use getJwtSecret() instead.
  jwtSecret: process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  databaseUrl: process.env.DATABASE_URL || '',
};

/**
 * In Cloudflare Workers, secrets are on c.env, not process.env.
 * This helper reads JWT_SECRET from the request's env context (via envStorage)
 * and falls back to config.jwtSecret for local development.
 */
export function getJwtSecret(): string {
  try {
    const { envStorage } = require('./envStorage');
    const env = envStorage.getStore();
    if (env && (env as any).JWT_SECRET) {
      return (env as any).JWT_SECRET as string;
    }
  } catch {
    // envStorage not available — local dev mode
  }
  return config.jwtSecret;
}

export * from './demo-accounts';