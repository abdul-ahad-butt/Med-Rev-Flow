import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';
import { DenialStatus } from '@prisma/client';

export const getDenials = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const {
      page = '1', limit = '20', search = '', status = '', assignedToId = '',
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query as Record<string, string>;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const { skip, take } = paginate(pageNum, limitNum);

    const where: Record<string, unknown> = { claim: { provider: { practiceId } } };
    if (status) where.status = status as DenialStatus;
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

    res.json(paginatedResponse(denials, total, pageNum, limitNum));
  } catch (error) {
    next(error);
  }
};

export const getDenialStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
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

    res.json({
      totalDenials: totalAgg._count,
      deniedAmount: totalDenied,
      recoveredAmount: totalRecovered,
      remainingOpportunity: totalDenied - totalRecovered,
      recoveryRate: Math.round(recoveryRate * 10) / 10,
      byStatus,
      byReason,
    });
  } catch (error) {
    next(error);
  }
};

export const getDenial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { id } = req.params;

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

    if (!denial) return res.status(404).json({ error: 'Denial not found' });

    res.json({ data: denial });
  } catch (error) {
    next(error);
  }
};

export const updateDenial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { id } = req.params;

    const existing = await prisma.denial.findFirst({
      where: { id, claim: { provider: { practiceId } } },
    });
    if (!existing) return res.status(404).json({ error: 'Denial not found' });

    const denial = await prisma.denial.update({
      where: { id },
      data: req.body,
    });

    // If resolved, update recovered amount on claim
    if (req.body.recoveredAmount !== undefined && req.body.recoveredAmount > 0) {
      await prisma.claim.update({
        where: { id: existing.claimId },
        data: {
          status: 'PAID',
          paidAmount: req.body.recoveredAmount,
        },
      });
    }

    res.json({ data: denial });
  } catch (error) {
    next(error);
  }
};

export const addDenialNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId, userId } = req.user!;
    const { id } = req.params;
    const { content } = req.body;

    const denial = await prisma.denial.findFirst({ where: { id, claim: { provider: { practiceId } } } });
    if (!denial) return res.status(404).json({ error: 'Denial not found' });

    const note = await prisma.note.create({
      data: { denialId: id, userId, content },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
};

export const createAppeal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { id } = req.params;

    const denial = await prisma.denial.findFirst({ where: { id, claim: { provider: { practiceId } } } });
    if (!denial) return res.status(404).json({ error: 'Denial not found' });

    const [appeal] = await Promise.all([
      prisma.appeal.create({
        data: { denialId: id, ...req.body },
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

    res.status(201).json({ data: appeal });
  } catch (error) {
    next(error);
  }
};
