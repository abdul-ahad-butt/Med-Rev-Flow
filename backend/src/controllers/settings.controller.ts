import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

export const getPracticeSettings = async (c: Context) => {
  try {
    const practice = await prisma.practice.findUnique({ where: { id: c.get('user')!.practiceId } });
    if (!practice) return c.json({ error: 'Practice not found' }, 404);
    return c.json({ data: practice });
  } catch (error) { throw error; }
};

export const updatePracticeSettings = async (c: Context) => {
  try {
    const practice = await prisma.practice.update({ where: { id: c.get('user')!.practiceId }, data: (await c.req.json()) });
    return c.json({ data: practice });
  } catch (error) { throw error; }
};

export const getUsers = async (c: Context) => {
  try {
    const users = await prisma.user.findMany({
      where: { practiceId: c.get('user')!.practiceId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { firstName: 'asc' },
    });
    return c.json({ data: users });
  } catch (error) { throw error; }
};

export const updateUser = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const existing = await prisma.user.findFirst({ where: { id: c.req.param('id'), practiceId } });
    if (!existing) return c.json({ error: 'User not found' }, 404);
    const {  password, ...safeData  } = await c.req.json();
    void password; // Don't allow password update via this endpoint
    const user = await prisma.user.update({ where: { id: c.req.param('id') }, data: safeData, select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true } });
    return c.json({ data: user });
  } catch (error) { throw error; }
};

export const getLocations = async (c: Context) => {
  try {
    return c.json({ data: [] });
  } catch (error) { throw error; }
};

export const createLocation = async (c: Context) => {
  try {
    return c.json({ data: { ...(await c.req.json() as object), id: 'temp-id' } }, 201);
  } catch (error) { throw error; }
};
