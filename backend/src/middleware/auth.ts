import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
type UserRole = 'SUPER_ADMIN' | 'PRACTICE_OWNER' | 'PRACTICE_MANAGER' | 'BILLING_STAFF' | 'FRONT_DESK' | 'MARKETING_MANAGER' | 'VIEWER';
import { User } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  practiceId: string;
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

// Role hierarchy — higher roles have access to lower role resources
export const canAccess = (...allowedRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as AuthPayload;
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const roleHierarchy: UserRole[] = [
      'SUPER_ADMIN',
      'PRACTICE_OWNER',
      'PRACTICE_MANAGER',
      'BILLING_STAFF',
      'FRONT_DESK',
      'MARKETING_MANAGER',
      'VIEWER',
    ];

    const userRoleIndex = roleHierarchy.indexOf(user.role);
    const hasAccess = allowedRoles.some(role => {
      const allowedIndex = roleHierarchy.indexOf(role);
      return userRoleIndex <= allowedIndex;
    });

    if (!hasAccess && !allowedRoles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};
