import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getAuditLogs = async (c: Context) => {
  try {
    const { page = '1', limit = '50', userId = '', resourceType = '' } = c.req.query();
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
    return c.json(paginatedResponse(logs, total, pageNum, limitNum));
  } catch (error) { throw error; }
};
