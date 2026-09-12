import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50', userId = '', resourceType = '' } = req.query as Record<string, string>;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const { skip, take } = paginate(pageNum, limitNum);
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (resourceType) where.entityType = resourceType; // FIXED: resourceType -> entityType
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json(paginatedResponse(logs, total, pageNum, limitNum));
  } catch (error) { next(error); }
};
