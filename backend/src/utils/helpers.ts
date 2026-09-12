import { prisma } from '../config/prisma';

export const createAuditLog = async (data: {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: object;
  newValues?: object;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    if (!data.userId) return; // Cannot create without userId per schema
    await prisma.auditLog.create({ 
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.resourceType,
        entityId: data.resourceId || 'UNKNOWN',
        ipAddress: data.ipAddress,
        details: JSON.stringify({
          oldValues: data.oldValues,
          newValues: data.newValues,
          userAgent: data.userAgent
        })
      } 
    });
  } catch (error) {
    console.error('[AUDIT] Failed to create audit log:', error);
  }
};

export const paginate = (page: number, limit: number) => {
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));
  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
  };
};

export const paginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const successResponse = <T>(data: T, message?: string) => ({
  success: true,
  message,
  data,
});

export const calculateAgingBucket = (agingDays: number): string => {
  if (agingDays <= 30) return '0-30';
  if (agingDays <= 60) return '31-60';
  if (agingDays <= 90) return '61-90';
  if (agingDays <= 120) return '91-120';
  return '120+';
};
