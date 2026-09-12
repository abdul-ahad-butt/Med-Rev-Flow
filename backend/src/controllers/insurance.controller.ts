import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getInsurances = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search = '' } = req.query as Record<string, string>;
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
    res.json({ data: withStats });
  } catch (error) { next(error); }
};

export const getInsurance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ins = await prisma.insurance.findUnique({ where: { id: req.params.id } });
    if (!ins) return res.status(404).json({ error: 'Insurance not found' });
    res.json({ data: ins });
  } catch (error) { next(error); }
};

export const createInsurance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ins = await prisma.insurance.create({ data: req.body });
    res.status(201).json({ data: ins });
  } catch (error) { next(error); }
};

export const updateInsurance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.insurance.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Insurance not found' });
    const ins = await prisma.insurance.update({ where: { id: req.params.id }, data: req.body });
    res.json({ data: ins });
  } catch (error) { next(error); }
};
