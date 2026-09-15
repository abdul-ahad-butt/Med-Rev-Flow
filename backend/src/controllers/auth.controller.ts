import { Context } from 'hono'; // re-trigger type check

import bcrypt from 'bcryptjs';
import { sign } from 'hono/jwt';
import { prisma } from '../config/prisma';
import { getJwtSecret } from '../config/env';
import { createAuditLog } from '../utils/helpers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const login = async (c: Context) => {
  try {
    const { email, password } = loginSchema.parse(await c.req.json());

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { practice: { select: { id: true, name: true, status: true, isDemo: true } } },
    });

    if (!user || !user.isActive) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check if account is deactivated
    if (!user.isActive) {
      return c.json({ error: 'Your account has been deactivated. Contact your practice administrator.' }, 403);
    }

    // Check if practice is suspended (skip for SUPER_ADMIN)
    if (user.role !== 'SUPER_ADMIN' && user.practice && user.practice.status === 'SUSPENDED') {
      return c.json({ error: 'Your practice account has been suspended. Please contact MedRevFlow support.' }, 403);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    // Phase 1: Auto-create conversation rows for users in the same account
    if (user.practiceId) {
      const practiceUsers = await prisma.user.findMany({
        where: { practiceId: user.practiceId, id: { not: user.id }, isActive: true }
      });
      
      const existingConvs = await prisma.conversation.findMany({
        where: {
          practiceId: user.practiceId,
          OR: [{ participantAId: user.id }, { participantBId: user.id }]
        }
      });
      
      const existingUserIds = new Set<string>();
      for (const conv of existingConvs) {
        existingUserIds.add(conv.participantAId === user.id ? conv.participantBId : conv.participantAId);
      }
      
      const toCreate = practiceUsers.filter((u: any) => !existingUserIds.has(u.id));
      if (toCreate.length > 0) {
        await Promise.all(toCreate.map((u: any) => {
          const participantAId = user.id < u.id ? user.id : u.id;
          const participantBId = user.id < u.id ? u.id : user.id;
          return prisma.conversation.upsert({
            where: {
              practiceId_participantAId_participantBId: {
                practiceId: user.practiceId!,
                participantAId,
                participantBId
              }
            },
            update: {},
            create: {
              practiceId: user.practiceId!,
              participantAId,
              participantBId
            }
          });
        }));
      }
    }

    const token = await sign({
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      userId: user.id,
      practiceId: user.practiceId,
      role: user.role,
      email: user.email,
      isDemo: user.isDemo,
    }, getJwtSecret(), 'HS256');

    await createAuditLog({
      userId: user.id, action: 'LOGIN', resourceType: 'User', resourceId: user.id,
      ipAddress: c.req.header('x-forwarded-for') || '127.0.0.1', userAgent: c.req.header('user-agent'),
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
        practiceName: user.practice?.name,
        mustChangePassword: user.mustChangePassword,
        // isDemo is determined by backend — frontend cannot spoof this
        isDemo: user.isDemo,
        practiceIsDemo: user.practice?.isDemo ?? false,
      },
    });
  } catch (error) { throw error; }
};

export const changePassword = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const { currentPassword, newPassword } = changePasswordSchema.parse(await c.req.json());

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!user) return c.json({ error: 'User not found' }, 404);

    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validPassword) return c.json({ error: 'Current password is incorrect' }, 400);

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, mustChangePassword: false },
    });

    await createAuditLog({ userId: user.id, action: 'PASSWORD_CHANGED', resourceType: 'User', resourceId: user.id });

    return c.json({ message: 'Password changed successfully' });
  } catch (error) { throw error; }
};

export const me = async (c: Context) => {
  try {
    if (!c.get('user')) return c.json({ error: 'Not authenticated' }, 401);
    const user = await prisma.user.findUnique({
      where: { id: c.get('user').userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, practiceId: true, isActive: true, mustChangePassword: true, lastLoginAt: true, practice: { select: { id: true, name: true, status: true } } },
    });
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json({ user });
  } catch (error) { throw error; }
};

export const logout = async (c: Context) => {
  try {
    if (c.get('user')) {
      await createAuditLog({ userId: c.get('user').userId, action: 'LOGOUT', resourceType: 'User', resourceId: c.get('user').userId });
    }
    return c.json({ message: 'Logged out successfully' });
  } catch (error) { throw error; }
};

export const register = async (c: Context) => {
  return c.json({ error: 'Self-registration is disabled. Contact your administrator.' }, 403);
};
