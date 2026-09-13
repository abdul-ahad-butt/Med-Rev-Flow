import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';


export const getDenials = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const {
      page = '1', limit = '20', search = '', status = '', assignedToId = '',
      sortBy = 'createdAt', sortOrder = 'desc',
    } = c.req.query();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const { skip, take } = paginate(pageNum, limitNum);

    const where: Record<string, unknown> = { claim: { provider: { practiceId } } };
    if (status) where.status = status as string;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { claim: { claimNumber: { contains: search, mode: 'insensitive' } } },
        { claim: { patient: { firstName: { contains: search, mode: 'insensitive' } } } },
        { claim: { patient: { lastName: { contains: search, mode: 'insensitive' } } } },
        { denialReason: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [denials, total] = await Promise.all([
      prisma.denial.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy === 'createdAt' ? 'createdAt' : 'updatedAt']: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          claim: {
            select: {
              claimNumber: true,
              dateOfService: true,
              patient: { select: { firstName: true, lastName: true } },
              insurance: { select: { name: true } },
            },
          },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { notes: true, appeals: true } },
        },
      }),
      prisma.denial.count({ where }),
    ]);

    return c.json(paginatedResponse(denials, total, pageNum, limitNum));
  } catch (error) {
    throw error;
  }
};

export const getDenialStats = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const where = { claim: { provider: { practiceId } } };

    const [totalAgg, byStatus, byReason] = await Promise.all([
      prisma.denial.aggregate({
        where,
        _sum: { deniedAmount: true, recoveredAmount: true },
        _count: true,
      }),
      prisma.denial.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: { deniedAmount: true, recoveredAmount: true },
      }),
      prisma.denial.groupBy({
        by: ['denialReason'],
        where,
        _count: true,
        _sum: { deniedAmount: true },
        orderBy: { _count: { denialReason: 'desc' } },
        take: 10,
      }),
    ]);

    const totalDenied = Number(totalAgg._sum.deniedAmount || 0);
    const totalRecovered = Number(totalAgg._sum.recoveredAmount || 0);
    const recoveryRate = totalDenied > 0 ? (totalRecovered / totalDenied) * 100 : 0;

    c.json({
      totalDenials: totalAgg._count,
      deniedAmount: totalDenied,
      recoveredAmount: totalRecovered,
      remainingOpportunity: totalDenied - totalRecovered,
      recoveryRate: Math.round(recoveryRate * 10) / 10,
      byStatus,
      byReason,
    });
  } catch (error) {
    throw error;
  }
};

export const getDenial = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();

    const denial = await prisma.denial.findFirst({
      where: { id, claim: { provider: { practiceId } } },
      include: {
        claim: {
          include: {
            patient: true,
            provider: { select: { firstName: true, lastName: true } },
            insurance: { select: { name: true } },
            statusHistory: { orderBy: { changedAt: 'asc' } },
          },
        },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        notes: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
        appeals: { orderBy: { submittedDate: 'desc' } },
      },
    });

    if (!denial) return c.json({ error: 'Denial not found' }, 404);

    return c.json({ data: denial });
  } catch (error) {
    throw error;
  }
};

export const updateDenial = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();

    const existing = await prisma.denial.findFirst({
      where: { id, claim: { provider: { practiceId } } },
    });
    if (!existing) return c.json({ error: 'Denial not found' }, 404);

    const denial = await prisma.denial.update({
      where: { id },
      data: (await c.req.json()),
    });

    // If resolved, update recovered amount on claim
    if ((await c.req.json()).recoveredAmount !== undefined && (await c.req.json()).recoveredAmount > 0) {
      await prisma.claim.update({
        where: { id: existing.claimId },
        data: {
          status: 'PAID',
          paidAmount: (await c.req.json()).recoveredAmount,
        },
      });
    }

    return c.json({ data: denial });
  } catch (error) {
    throw error;
  }
};

export const addDenialNote = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;
    const { id } = c.req.param();
    const {  content  } = await c.req.json();

    const denial = await prisma.denial.findFirst({ where: { id, claim: { provider: { practiceId } } } });
    if (!denial) return c.json({ error: 'Denial not found' }, 404);

    const note = await prisma.note.create({
      data: { denialId: id, userId, content },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    return c.json({ data: note }, 201);
  } catch (error) {
    throw error;
  }
};

export const createAppeal = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();

    const denial = await prisma.denial.findFirst({ where: { id, claim: { provider: { practiceId } } } });
    if (!denial) return c.json({ error: 'Denial not found' }, 404);

    const [appeal] = await Promise.all([
      prisma.appeal.create({
        data: { denialId: id, ...(await c.req.json()) },
      }),
      prisma.denial.update({
        where: { id },
        data: { status: 'APPEAL_SUBMITTED' },
      }),
      prisma.claim.update({
        where: { id: denial.claimId },
        data: { status: 'APPEALED' },
      }),
    ]);

    return c.json({ data: appeal }, 201);
  } catch (error) {
    throw error;
  }
};
