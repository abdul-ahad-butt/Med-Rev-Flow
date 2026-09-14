import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { createAuditLog } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  let pass = '';
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export const getAdminDashboard = async (c: Context) => {
  const [totalPractices, activePractices, suspendedPractices, totalUsers] = await Promise.all([
    prisma.practice.count(),
    prisma.practice.count({ where: { status: 'ACTIVE' } }),
    prisma.practice.count({ where: { status: 'SUSPENDED' } }),
    prisma.user.count({ where: { role: { not: 'SUPER_ADMIN' } } }),
  ]);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newPracticesThisMonth = await prisma.practice.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
  const recentAuditLogs = await prisma.auditLog.findMany({
    take: 10, orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
  return c.json({ stats: { totalPractices, activePractices, suspendedPractices, totalUsers, newPracticesThisMonth }, recentActivity: recentAuditLogs });
};

export const listPractices = async (c: Context) => {
  const { search = '', status = '' } = c.req.query();
  const where: Record<string, unknown> = {};
  if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
  if (status) where.status = status;
  const practices = await prisma.practice.findMany({
    where,
    include: {
      users: { where: { role: 'PRACTICE_OWNER' }, select: { id: true, firstName: true, lastName: true, email: true, lastLoginAt: true, isActive: true } },
      _count: { select: { users: true, patients: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: practices });
};

export const createPractice = async (c: Context) => {
  const body = await c.req.json();
  
  const name = body.practiceName || body.name;
  if (!name) return c.json({ error: 'Practice name is required' }, 400);

  const email = body.ownerEmail?.toLowerCase();
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return c.json({ error: 'Owner email already in use' }, 409);
  }

  const tempPassword = body.password || generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const practiceId = uuidv4();
  
  const practiceData = {
    id: practiceId,
    name,
    taxId: body.taxId || null,
    npi: body.npi || null,
    legalName: body.legalName, 
    specialty: body.specialty,
    practiceType: body.practiceType, 
    address: body.address, 
    city: body.city,
    state: body.state, 
    zipCode: body.zipCode, 
    phone: body.phone,
    email: body.email, 
    website: body.website, 
    status: body.status || 'ACTIVE',
  };

  const createPracticeQuery = prisma.practice.create({ data: practiceData });
  const queries: any[] = [createPracticeQuery];

  let ownerData = null;
  if (email && body.ownerFirstName && body.ownerLastName) {
    ownerData = {
      email,
      passwordHash,
      firstName: body.ownerFirstName,
      lastName: body.ownerLastName,
      practiceId,
      role: 'PRACTICE_OWNER',
      mustChangePassword: true,
      isActive: true,
    };
    queries.push(prisma.user.create({ data: ownerData }));
  }

  const result = await prisma.$transaction(queries);
  
  const practice = result[0];
  const owner = result.length > 1 ? result[1] : null;

  await createAuditLog({ userId: c.get('user').userId, action: 'ADMIN_PRACTICE_CREATED', resourceType: 'Practice', resourceId: practice.id, newValues: { name: practice.name } });
  if (owner) {
    await createAuditLog({ userId: c.get('user').userId, action: 'ADMIN_PRACTICE_OWNER_CREATED', resourceType: 'User', resourceId: owner.id, newValues: { email: owner.email, practiceId: practice.id } });
  }

  const responseData: any = { data: practice };
  if (owner) {
    responseData.credentials = {
      email: owner.email,
      temporaryPassword: tempPassword,
      note: 'Deliver securely. Not stored in plain text.'
    };
  }

  return c.json(responseData, 201);
};

export const getPractice = async (c: Context) => {
  const { id } = c.req.param();
  const practice = await prisma.practice.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true }, orderBy: { role: 'asc' } },
      _count: { select: { patients: true, providers: true, leads: true } },
    },
  });
  if (!practice) return c.json({ error: 'Practice not found' }, 404);
  return c.json({ data: practice });
};

export const updatePractice = async (c: Context) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const practice = await prisma.practice.update({ where: { id }, data: body });
  return c.json({ data: practice });
};

export const suspendPractice = async (c: Context) => {
  const { id } = c.req.param();
  const practice = await prisma.practice.update({ where: { id }, data: { status: 'SUSPENDED' } });
  await createAuditLog({ userId: c.get('user').userId, action: 'ADMIN_PRACTICE_SUSPENDED', resourceType: 'Practice', resourceId: id });
  return c.json({ data: practice });
};

export const activatePractice = async (c: Context) => {
  const { id } = c.req.param();
  const practice = await prisma.practice.update({ where: { id }, data: { status: 'ACTIVE' } });
  await createAuditLog({ userId: c.get('user').userId, action: 'ADMIN_PRACTICE_ACTIVATED', resourceType: 'Practice', resourceId: id });
  return c.json({ data: practice });
};

export const createPracticeOwner = async (c: Context) => {
  const body = await c.req.json();
  const { practiceId, firstName, lastName, email, phone } = body;
  const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
  if (!practice) return c.json({ error: 'Practice not found' }, 404);
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return c.json({ error: 'Email already in use' }, 409);
  const tempPassword = body.password || generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, firstName, lastName, practiceId, role: 'PRACTICE_OWNER', mustChangePassword: true, isActive: true },
  });
  await createAuditLog({ userId: c.get('user').userId, action: 'ADMIN_PRACTICE_OWNER_CREATED', resourceType: 'User', resourceId: user.id, newValues: { email: user.email, practiceId } });
  return c.json({
    data: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, practiceId: user.practiceId, mustChangePassword: user.mustChangePassword },
    credentials: { email: user.email, temporaryPassword: tempPassword, note: 'Deliver securely. Not stored in plain text.' },
  }, 201);
};

export const listPracticeOwners = async (c: Context) => {
  const owners = await prisma.user.findMany({
    where: { role: 'PRACTICE_OWNER' },
    select: { id: true, firstName: true, lastName: true, email: true, isActive: true, lastLoginAt: true, createdAt: true, practice: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ data: owners });
};

export const adminResetPassword = async (c: Context) => {
  const { id } = c.req.param();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return c.json({ error: 'User not found' }, 404);
  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } });
  await createAuditLog({ userId: c.get('user').userId, action: 'ADMIN_PASSWORD_RESET', resourceType: 'User', resourceId: id });
  return c.json({ message: 'Password reset', credentials: { email: user.email, temporaryPassword: tempPassword, note: 'Deliver securely.' } });
};

export const getAdminAuditLogs = async (c: Context) => {
  const { page = '1', limit = '50' } = c.req.query();
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true, role: true, practice: { select: { name: true } } } } },
    }),
    prisma.auditLog.count(),
  ]);
  return c.json({ data: logs, total, page: parseInt(page), limit: parseInt(limit) });
};
