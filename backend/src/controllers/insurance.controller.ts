import { Context } from 'hono';
import { prisma } from '../config/prisma';

/**
 * GET /api/insurance
 *
 * Returns insurance payers for the authenticated practice.
 * Tenant-isolated by practiceId — a user can only see their own practice's payers.
 */
export const getInsurances = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser?.practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const { practiceId } = authUser;
    const { search = '' } = c.req.query();

    const where: Record<string, unknown> = { practiceId };
    if (search) where.name = { contains: search };

    const insurances = await prisma.insurance.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Add per-payer stats from claims (scoped to this practice)
    const withStats = await Promise.all(
      insurances.map(async (ins) => {
        const [totalClaims, paidCount, deniedCount, pendingCount, revenueAgg] = await Promise.all([
          prisma.claim.count({ where: { insuranceId: ins.id, practiceId } }),
          prisma.claim.count({ where: { insuranceId: ins.id, practiceId, status: 'PAID' } }),
          prisma.claim.count({ where: { insuranceId: ins.id, practiceId, status: 'DENIED' } }),
          prisma.claim.count({ where: { insuranceId: ins.id, practiceId, status: { in: ['SUBMITTED', 'PENDING', 'ACCEPTED'] } } }),
          prisma.payment.aggregate({
            where: { claim: { insuranceId: ins.id, practiceId } },
            _sum: { amount: true },
          }),
        ]);
        return {
          ...ins,
          // timelyFilingDays may not exist in DB yet — return 0 if absent
          timelyFilingDays: (ins as any).timelyFilingDays ?? 0,
          claimsCount:   totalClaims,
          paidCount,
          deniedCount,
          pendingCount,
          totalRevenue:  Number(revenueAgg._sum.amount || 0),
          denialRate:    totalClaims > 0 ? Math.round((deniedCount / totalClaims) * 1000) / 10 : 0,
        };
      })
    );

    return c.json({ data: withStats });
  } catch (error) { throw error; }
};

/**
 * GET /api/insurance/:id
 */
export const getInsurance = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser?.practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const ins = await prisma.insurance.findFirst({
      where: { id: c.req.param('id'), practiceId: authUser.practiceId },
    });
    if (!ins) return c.json({ error: 'Insurance not found' }, 404);
    return c.json({
      data: {
        ...ins,
        timelyFilingDays: (ins as any).timelyFilingDays ?? 0,
      },
    });
  } catch (error) { throw error; }
};

/**
 * POST /api/insurance
 * Creates a new insurance payer for the authenticated practice.
 * practiceId is derived from the authenticated user — never trusted from client.
 */
export const createInsurance = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser?.practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const body = await c.req.json();
    // Override any practiceId the client might send — always use the authenticated user's
    const ins = await prisma.insurance.create({
      data: {
        ...body,
        practiceId: authUser.practiceId,
      },
    });
    return c.json({
      data: {
        ...ins,
        timelyFilingDays: (ins as any).timelyFilingDays ?? 0,
      },
    }, 201);
  } catch (error) { throw error; }
};

/**
 * PATCH /api/insurance/:id
 * Updates an insurance payer — only if it belongs to the authenticated practice.
 */
export const updateInsurance = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser?.practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const existing = await prisma.insurance.findFirst({
      where: { id: c.req.param('id'), practiceId: authUser.practiceId },
    });
    if (!existing) return c.json({ error: 'Insurance not found' }, 404);

    const body = await c.req.json();
    // Prevent overwriting practiceId
    delete body.practiceId;

    const ins = await prisma.insurance.update({
      where: { id: c.req.param('id') },
      data: body,
    });
    return c.json({
      data: {
        ...ins,
        timelyFilingDays: (ins as any).timelyFilingDays ?? 0,
      },
    });
  } catch (error) { throw error; }
};
