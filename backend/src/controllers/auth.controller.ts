import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import { prisma } from '../config/prisma';
import { config } from '../config/env';
import { AuthPayload } from '../middleware/auth';
import { createAuditLog } from '../utils/helpers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  practiceId: z.string().uuid().optional(),
});

export const login = async (c: Context) => {
  try {
    const { email, password } = loginSchema.parse((await c.req.json()));

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { practice: { select: { id: true, name: true } } },
    });

    if (!user || !user.isActive) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await sign({
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, userId: user.id, practiceId: user.practiceId, role: user.role, email: user.email },
      config.jwtSecret,
      'HS256'
    );

    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress: c.req.header('x-forwarded-for') || '127.0.0.1',
      userAgent: c.req.header('user-agent'),
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        practiceId: user.practiceId,
        practiceName: user.practice.name,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const register = async (c: Context) => {
  try {
    const data = registerSchema.parse((await c.req.json()));

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return c.json({ error: 'Email already in use' }, 409);
    }

    // Get default practice (for demo, use first practice)
    let practiceId = data.practiceId;
    if (!practiceId) {
      const practice = await prisma.practice.findFirst();
      if (!practice) {
        return c.json({ error: 'No practice found. Please seed the database.' }, 400);
      }
      practiceId = practice.id;
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        practiceId,
        role: 'VIEWER',
      },
    });

    const token = await sign({
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, userId: user.id, practiceId: user.practiceId, role: user.role, email: user.email },
      config.jwtSecret,
      'HS256'
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        practiceId: user.practiceId,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const me = async (c: Context) => {
  try {
    if (!c.get('user')) return c.json({ error: 'Not authenticated' }, 401);

    const user = await prisma.user.findUnique({
      where: { id: c.get('user').userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        practiceId: true,
        isActive: true,
        lastLoginAt: true,
        practice: { select: { id: true, name: true } },
      },
    });

    if (!user) return c.json({ error: 'User not found' }, 404);

    return c.json({ user });
  } catch (error) {
    throw error;
  }
};

export const logout = async (c: Context) => {
  try {
    if (c.get('user')) {
      await createAuditLog({
        userId: c.get('user').userId,
        action: 'LOGOUT',
        resourceType: 'User',
        resourceId: c.get('user').userId,
      });
    }
    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    throw error;
  }
};
