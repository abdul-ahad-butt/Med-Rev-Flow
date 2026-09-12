import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/prisma';
import { UserRole } from '@prisma/client';

export interface AuthPayload {
  userId: string;
  practiceId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, practiceId: true, role: true, email: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      userId: user.id,
      practiceId: user.practiceId,
      role: user.role,
      email: user.email,
    };

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Role hierarchy — higher roles have access to lower role resources
export const canAccess = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
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

    const userRoleIndex = roleHierarchy.indexOf(req.user.role);
    const hasAccess = allowedRoles.some(role => {
      const allowedIndex = roleHierarchy.indexOf(role);
      return userRoleIndex <= allowedIndex;
    });

    if (!hasAccess && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
