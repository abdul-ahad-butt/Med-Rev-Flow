import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

export const getInsurances = async (c: Context) => {
  try {
    const { search = '' } = c.req.query();
    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const insurances = await prisma.insurance.findMany({ where, orderBy: { name: 'asc' } });
    // Add performance stats
    const withStats = await Promise.all(insurances.map(async (ins) => {
      const [claims, paid, denied, pending, revenue] = await Promise.all([
        prisma.claim.count({ where: { insuranceId: ins.id } }),
        prisma.claim.count({ where: { insuranceId: ins.id, status: 'PAID' } }),
        prisma.claim.count({ where: { insuranceId: ins.id, status: 'DENIED' } }),
        prisma.claim.count({ where: { insuranceId: ins.id, status: { in: ['SUBMITTED', 'PENDING', 'ACCEPTED'] } } }),
        prisma.payment.aggregate({ where: { claim: { insuranceId: ins.id } }, _sum: { amount: true } }),
      ]);
      return { ...ins, claimsCount: claims, paidCount: paid, deniedCount: denied, pendingCount: pending, totalRevenue: Number(revenue._sum.amount || 0), denialRate: claims > 0 ? Math.round((denied / claims) * 1000) / 10 : 0 };
    }));
    return c.json({ data: withStats });
  } catch (error) { throw error; }
};

export const getInsurance = async (c: Context) => {
  try {
    const ins = await prisma.insurance.findUnique({ where: { id: c.req.param('id') } });
    if (!ins) return c.json({ error: 'Insurance not found' }, 404);
    return c.json({ data: ins });
  } catch (error) { throw error; }
};

export const createInsurance = async (c: Context) => {
  try {
    const ins = await prisma.insurance.create({ data: (await c.req.json()) });
    return c.json({ data: ins }, 201);
  } catch (error) { throw error; }
};

export const updateInsurance = async (c: Context) => {
  try {
    const existing = await prisma.insurance.findUnique({ where: { id: c.req.param('id') } });
    if (!existing) return c.json({ error: 'Insurance not found' }, 404);
    const ins = await prisma.insurance.update({ where: { id: c.req.param('id') }, data: (await c.req.json()) });
    return c.json({ data: ins });
  } catch (error) { throw error; }
};
