import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

export const getProviders = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { search = '', isActive = '' } = c.req.query();
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
    
    const providerRevenue = await Promise.all(
      providers.map(async (p) => {
        const rev = await prisma.payment.aggregate({ where: { claim: { providerId: p.id } }, _sum: { amount: true } });
        const denied = await prisma.claim.count({ where: { providerId: p.id, status: 'DENIED' } });
        const total = await prisma.claim.count({ where: { providerId: p.id, status: { notIn: ['DRAFT'] } } });
        return { ...p, revenue: Number(rev._sum.amount || 0), denialRate: total > 0 ? Math.round((denied / total) * 1000) / 10 : 0 };
      })
    );
    return c.json({ data: providerRevenue });
  } catch (error) { throw error; }
};

export const getProvider = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const provider = await prisma.provider.findFirst({
      where: { id: c.req.param('id'), practiceId },
    });
    if (!provider) return c.json({ error: 'Provider not found' }, 404);
    const [claimsCount, revenue, denials] = await Promise.all([
      prisma.claim.count({ where: { providerId: provider.id } }),
      prisma.payment.aggregate({ where: { claim: { providerId: provider.id } }, _sum: { amount: true } }),
      prisma.claim.count({ where: { providerId: provider.id, status: 'DENIED' } }),
    ]);
    return c.json({ data: { ...provider, claimsCount, revenue: Number(revenue._sum.amount || 0), denials } });
  } catch (error) { throw error; }
};

export const createProvider = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const provider = await prisma.provider.create({ data: { ...(await c.req.json()), practiceId } });
    return c.json({ data: provider }, 201);
  } catch (error) { throw error; }
};

export const updateProvider = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const existing = await prisma.provider.findFirst({ where: { id: c.req.param('id'), practiceId } });
    if (!existing) return c.json({ error: 'Provider not found' }, 404);
    const provider = await prisma.provider.update({ where: { id: c.req.param('id') }, data: (await c.req.json()) });
    return c.json({ data: provider });
  } catch (error) { throw error; }
};
