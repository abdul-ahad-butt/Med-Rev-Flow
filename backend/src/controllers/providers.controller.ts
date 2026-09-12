import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProviders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { search = '', isActive = '' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { practiceId };
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } },
      ];
    }
    const providers = await prisma.provider.findMany({
      where, orderBy: { lastName: 'asc' },
      include: {
        _count: { select: { appointments: true, claims: true } },
      },
    });
    // Compute revenue per provider
    const providerIds = providers.map(p => p.id);
    const revenues = await prisma.payment.groupBy({
      by: [], // workaround: compute in JS
      where: { claim: { providerId: { in: providerIds } } },
    });
    void revenues;
    const providerRevenue = await Promise.all(
      providers.map(async (p) => {
        const rev = await prisma.payment.aggregate({ where: { claim: { providerId: p.id } }, _sum: { amount: true } });
        const denied = await prisma.claim.count({ where: { providerId: p.id, status: 'DENIED' } });
        const total = await prisma.claim.count({ where: { providerId: p.id, status: { notIn: ['DRAFT'] } } });
        return { ...p, revenue: Number(rev._sum.amount || 0), denialRate: total > 0 ? Math.round((denied / total) * 1000) / 10 : 0 };
      })
    );
    res.json({ data: providerRevenue });
  } catch (error) { next(error); }
};

export const getProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const provider = await prisma.provider.findFirst({
      where: { id: req.params.id, practiceId },
    });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    const [claimsCount, revenue, denials] = await Promise.all([
      prisma.claim.count({ where: { providerId: provider.id } }),
      prisma.payment.aggregate({ where: { claim: { providerId: provider.id } }, _sum: { amount: true } }),
      prisma.claim.count({ where: { providerId: provider.id, status: 'DENIED' } }),
    ]);
    res.json({ data: { ...provider, claimsCount, revenue: Number(revenue._sum.amount || 0), denials } });
  } catch (error) { next(error); }
};

export const createProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const provider = await prisma.provider.create({ data: { ...req.body, practiceId } });
    res.status(201).json({ data: provider });
  } catch (error) { next(error); }
};

export const updateProvider = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const existing = await prisma.provider.findFirst({ where: { id: req.params.id, practiceId } });
    if (!existing) return res.status(404).json({ error: 'Provider not found' });
    const provider = await prisma.provider.update({ where: { id: req.params.id }, data: req.body });
    res.json({ data: provider });
  } catch (error) { next(error); }
};
