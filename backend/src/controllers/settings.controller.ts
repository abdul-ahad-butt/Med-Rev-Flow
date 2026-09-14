import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  let pass = '';
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export const getPracticeSettings = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    if (!practiceId) return c.json({ error: 'No practice' }, 403);
    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    if (!practice) return c.json({ error: 'Practice not found' }, 404);
    return c.json({ data: practice });
  } catch (error) { throw error; }
};

export const updatePracticeSettings = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    if (!practiceId) return c.json({ error: 'No practice' }, 403);
    const body = await c.req.json();
    // Only allow safe fields to be updated
    const { name, legalName, specialty, practiceType, address, city, state, zipCode, phone, email, website, taxId, npi } = body;
    const practice = await prisma.practice.update({
      where: { id: practiceId },
      data: { name, legalName, specialty, practiceType, address, city, state, zipCode, phone, email, website, taxId, npi },
    });
    return c.json({ data: practice });
  } catch (error) { throw error; }
};

export const getUsers = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    if (!practiceId) return c.json({ error: 'No practice' }, 403);
    const users = await prisma.user.findMany({
      where: { practiceId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, mustChangePassword: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return c.json({ data: users });
  } catch (error) { throw error; }
};

export const updateUser = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const body = await c.req.json();
    const existing = await prisma.user.findFirst({ where: { id, practiceId: practiceId! } });
    if (!existing) return c.json({ error: 'User not found' }, 404);
    const { firstName, lastName, role } = body;
    const user = await prisma.user.update({ where: { id }, data: { firstName, lastName, role } });
    return c.json({ data: user });
  } catch (error) { throw error; }
};

export const createPracticeUser = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    if (!practiceId) return c.json({ error: 'No practice' }, 403);
    const body = await c.req.json();
    const { firstName, lastName, email, role, password } = body;
    const allowedRoles = ['PRACTICE_MANAGER', 'BILLING_STAFF', 'FRONT_DESK', 'MARKETING_MANAGER', 'VIEWER'];
    if (!allowedRoles.includes(role)) return c.json({ error: 'Invalid role' }, 400);
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return c.json({ error: 'Email already in use' }, 409);
    const tempPassword = password || generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash, firstName, lastName, practiceId, role, mustChangePassword: true, isActive: true },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, mustChangePassword: true },
    });
    return c.json({ data: user, credentials: { email: user.email, temporaryPassword: tempPassword } }, 201);
  } catch (error) { throw error; }
};

export const deactivatePracticeUser = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const existing = await prisma.user.findFirst({ where: { id, practiceId: practiceId! } });
    if (!existing) return c.json({ error: 'User not found' }, 404);
    if (existing.role === 'PRACTICE_OWNER') return c.json({ error: 'Cannot deactivate practice owner via this route' }, 400);
    const user = await prisma.user.update({ where: { id }, data: { isActive: false }, select: { id: true, isActive: true } });
    return c.json({ data: user });
  } catch (error) { throw error; }
};

export const activatePracticeUser = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const existing = await prisma.user.findFirst({ where: { id, practiceId: practiceId! } });
    if (!existing) return c.json({ error: 'User not found' }, 404);
    const user = await prisma.user.update({ where: { id }, data: { isActive: true }, select: { id: true, isActive: true } });
    return c.json({ data: user });
  } catch (error) { throw error; }
};

export const resetPracticeUserPassword = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const existing = await prisma.user.findFirst({ where: { id, practiceId: practiceId! } });
    if (!existing) return c.json({ error: 'User not found' }, 404);
    const tempPassword = generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } });
    return c.json({ credentials: { email: existing.email, temporaryPassword: tempPassword } });
  } catch (error) { throw error; }
};

export const getLocations = async (c: Context) => {
  return c.json({ data: [] });
};

export const createLocation = async (c: Context) => {
  return c.json({ data: {} }, 201);
};
