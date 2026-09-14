import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
import { UserRole, Permission, hasPermission } from './permissions';

export interface AuthPayload {
  userId: string;
  practiceId: string | null;
  role: UserRole;
  email: string;
}

export const authenticate = async (
  c: Context,
  next: Next
) => {
  try {
    const authHeader = c.req.header('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verify(token, config.jwtSecret, 'HS256') as unknown as AuthPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, practiceId: true, role: true, email: true },
    });

    if (!user || !user.isActive) {
      return c.json({ error: 'User not found or inactive' }, 401);
    }

    c.set('user', {
      userId: user.id,
      practiceId: user.practiceId,
      role: user.role,
      email: user.email,
    });

    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

// For backward compatibility or specific role checks (mostly for SUPER_ADMIN)
export const authorize = (...roles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthPayload;
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    await next();
  };
};

export const requirePermission = (permission: Permission) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthPayload;
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!hasPermission(user.role, permission)) {
      return c.json({ error: `Insufficient permissions: Requires ${permission}` }, 403);
    }

    await next();
  };
};
