import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getPriorAuths = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { page = '1', limit = '20', status = '', search = '' } = req.query as Record<string, string>;
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
    res.json(paginatedResponse(auths, total, pageNum, limitNum));
  } catch (error) { next(error); }
};

export const getPriorAuthStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const where = { patient: { practiceId } };
    const [byStatus, expiringSoon] = await Promise.all([
      prisma.priorAuthorization.groupBy({ by: ['status'], where, _count: true }),
      prisma.priorAuthorization.count({ where: { ...where, status: 'APPROVED', expirationDate: { lte: sevenDays, gte: new Date() } } }),
    ]);
    res.json({ byStatus, expiringSoon });
  } catch (error) { next(error); }
};

export const getPriorAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { id } = req.params;
    const auth = await prisma.priorAuthorization.findFirst({
      where: { id, patient: { practiceId } },
      include: { patient: true },
    });
    if (!auth) return res.status(404).json({ error: 'Authorization not found' });
    res.json({ data: auth });
  } catch (error) { next(error); }
};

export const createPriorAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authNumber = `AUTH-${Date.now().toString().slice(-8)}`;
    const auth = await prisma.priorAuthorization.create({ data: { ...req.body, authNumber } });
    res.status(201).json({ data: auth });
  } catch (error) { next(error); }
};

export const updatePriorAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { id } = req.params;
    const existing = await prisma.priorAuthorization.findFirst({ where: { id, patient: { practiceId } } });
    if (!existing) return res.status(404).json({ error: 'Authorization not found' });
    const auth = await prisma.priorAuthorization.update({ where: { id }, data: req.body });
    res.json({ data: auth });
  } catch (error) { next(error); }
};
