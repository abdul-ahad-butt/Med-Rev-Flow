import { Context } from 'hono';
import { prisma } from '../config/prisma';

/**
 * GET /api/ar/stats  (also aliased as /api/ar/summary by the router)
 *
 * Returns real A/R summary calculated from the Claim table for the
 * authenticated user's practice. Aging buckets are based on days since
 * dateOfService. Outstanding balance = billedAmount - (paidAmount ?? 0).
 */
export const getARStats = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser?.practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const { practiceId } = authUser;

    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Outstanding claims only (exclude PAID / CLOSED)
    const openStatuses = { notIn: ['PAID', 'CLOSED'] };

    const [b0_30, b31_60, b61_90, b90plus, totalBilledAgg, totalPaidAgg] = await Promise.all([
      prisma.claim.aggregate({
        where: { practiceId, status: openStatuses, dateOfService: { gte: d30 } },
        _sum: { billedAmount: true, paidAmount: true },
        _count: true,
      }),
      prisma.claim.aggregate({
        where: { practiceId, status: openStatuses, dateOfService: { lt: d30, gte: d60 } },
        _sum: { billedAmount: true, paidAmount: true },
        _count: true,
      }),
      prisma.claim.aggregate({
        where: { practiceId, status: openStatuses, dateOfService: { lt: d60, gte: d90 } },
        _sum: { billedAmount: true, paidAmount: true },
        _count: true,
      }),
      prisma.claim.aggregate({
        where: { practiceId, status: openStatuses, dateOfService: { lt: d90 } },
        _sum: { billedAmount: true, paidAmount: true },
        _count: true,
      }),
      // For collection rate calculation
      prisma.claim.aggregate({
        where: { practiceId, status: { in: ['PAID', 'CLOSED'] } },
        _sum: { billedAmount: true, paidAmount: true },
      }),
      prisma.payment.aggregate({
        where: { claim: { practiceId } },
        _sum: { amount: true },
      }),
    ]);

    const bal0_30  = Math.max(0, Number(b0_30._sum?.billedAmount  || 0) - Number(b0_30._sum?.paidAmount  || 0));
    const bal31_60 = Math.max(0, Number(b31_60._sum?.billedAmount || 0) - Number(b31_60._sum?.paidAmount || 0));
    const bal61_90 = Math.max(0, Number(b61_90._sum?.billedAmount || 0) - Number(b61_90._sum?.paidAmount || 0));
    const bal90p   = Math.max(0, Number(b90plus._sum?.billedAmount || 0) - Number(b90plus._sum?.paidAmount || 0));

    const totalAR  = bal0_30 + bal31_60 + bal61_90 + bal90p;

    const billedClosed   = Number(totalBilledAgg._sum?.billedAmount || 0);
    const paidClosed     = Number(totalBilledAgg._sum?.paidAmount  || 0);
    const collectionRate = billedClosed > 0 ? Math.round((paidClosed / billedClosed) * 1000) / 10 : 0;

    return c.json({
      totalAR,
      totalBilled: billedClosed,
      totalPaid: Number(totalPaidAgg._sum?.amount || 0),
      collectionRate,
      buckets: [
        { agingBucket: '0-30',  balance: bal0_30,  count: b0_30._count  },
        { agingBucket: '31-60', balance: bal31_60, count: b31_60._count },
        { agingBucket: '61-90', balance: bal61_90, count: b61_90._count },
        { agingBucket: '90+',   balance: bal90p,   count: b90plus._count },
      ],
    });
  } catch (error) { throw error; }
};

/**
 * GET /api/ar
 *
 * Returns outstanding claims (with aging bucket labels) for the authenticated
 * practice. Pagination via ?page=&limit=
 */
export const getAR = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser?.practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const { practiceId } = authUser;
    const { page = '1', limit = '20', search = '' } = c.req.query();
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const now = new Date();
    const d30 = new Date(now.getTime() - 30  * 24 * 60 * 60 * 1000);
    const d60 = new Date(now.getTime() - 60  * 24 * 60 * 60 * 1000);
    const d90 = new Date(now.getTime() - 90  * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {
      practiceId,
      status: { notIn: ['PAID', 'CLOSED'] as string[] },
    };

    if (search) {
      where.OR = [
        { claimNumber: { contains: search } },
        { patient: { OR: [
          { firstName: { contains: search } },
          { lastName:  { contains: search } },
        ]}},
      ];
    }

    const [total, claims] = await Promise.all([
      prisma.claim.count({ where }),
      prisma.claim.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { dateOfService: 'asc' },
        include: { patient: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    // Compute per-claim aging
    const enriched = claims.map((claim) => {
      const dos    = new Date(claim.dateOfService);
      const daysOut = Math.floor((now.getTime() - dos.getTime()) / (1000 * 60 * 60 * 24));
      let agingBucket = '0-30';
      if (daysOut > 90) agingBucket = '90+';
      else if (daysOut > 60) agingBucket = '61-90';
      else if (daysOut > 30) agingBucket = '31-60';

      const balance = Math.max(0, claim.billedAmount - (claim.paidAmount ?? 0));

      return {
        ...claim,
        daysOutstanding: daysOut,
        agingBucket,
        billedAmount: claim.billedAmount,
        paidAmount:   claim.paidAmount ?? 0,
        balance,
      };
    });

    return c.json({
      data: enriched,
      meta: {
        page:  pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) { throw error; }
};

/**
 * PATCH /api/ar/:id
 * Update an A/R record (claim status or notes)
 */
export const updateAR = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser?.practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const id = c.req.param('id');
    const existing = await prisma.claim.findFirst({
      where: { id, practiceId: authUser.practiceId },
    });
    if (!existing) return c.json({ error: 'A/R record not found' }, 404);

    const body = await c.req.json();
    const updated = await prisma.claim.update({
      where: { id },
      data: { notes: body.notes, status: body.status },
    });
    return c.json({ data: updated });
  } catch (error) { throw error; }
};
