import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getPriorAuths = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { page = '1', limit = '20', status = '', search = '' } = c.req.query();
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const { skip, take } = paginate(pageNum, limitNum);
    const where: Record<string, unknown> = { patient: { practiceId } };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
        { authNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [auths, total] = await Promise.all([
      prisma.priorAuthorization.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { firstName: true, lastName: true } }
        },
      }),
      prisma.priorAuthorization.count({ where }),
    ]);
    return c.json(paginatedResponse(auths, total, pageNum, limitNum));
  } catch (error) { throw error; }
};

export const getPriorAuthStats = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const where = { patient: { practiceId } };
    const [byStatus, expiringSoon] = await Promise.all([
      prisma.priorAuthorization.groupBy({ by: ['status'], where, _count: true }),
      prisma.priorAuthorization.count({ where: { ...where, status: 'APPROVED', expirationDate: { lte: sevenDays, gte: new Date() } } }),
    ]);
    return c.json({ byStatus, expiringSoon });
  } catch (error) { throw error; }
};

export const getPriorAuth = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const auth = await prisma.priorAuthorization.findFirst({
      where: { id, patient: { practiceId } },
      include: { patient: true },
    });
    if (!auth) return c.json({ error: 'Authorization not found' }, 404);
    return c.json({ data: auth });
  } catch (error) { throw error; }
};

export const createPriorAuth = async (c: Context) => {
  try {
    const authNumber = `AUTH-${Date.now().toString().slice(-8)}`;
    const auth = await prisma.priorAuthorization.create({ data: { ...(await c.req.json()), authNumber } });
    return c.json({ data: auth }, 201);
  } catch (error) { throw error; }
};

export const updatePriorAuth = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const existing = await prisma.priorAuthorization.findFirst({ where: { id, patient: { practiceId } } });
    if (!existing) return c.json({ error: 'Authorization not found' }, 404);
    const auth = await prisma.priorAuthorization.update({ where: { id }, data: (await c.req.json()) });
    return c.json({ data: auth });
  } catch (error) { throw error; }
};
