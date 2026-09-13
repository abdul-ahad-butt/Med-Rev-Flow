import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getLeads = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { page = '1', limit = '20', status = '', search = '', source = '' } = c.req.query();
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const { skip, take } = paginate(pageNum, limitNum);
    const where: Record<string, unknown> = { practiceId };
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' }
      }),
      prisma.lead.count({ where }),
    ]);
    return c.json(paginatedResponse(leads, total, pageNum, limitNum));
  } catch (error) { throw error; }
};

export const getLeadStats = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const [byStatus, bySource] = await Promise.all([
      prisma.lead.groupBy({ by: ['status'], where: { practiceId }, _count: true }),
      prisma.lead.groupBy({ by: ['source'], where: { practiceId }, _count: true, orderBy: { _count: { source: 'desc' } } }),
    ]);
    const totalLeads = byStatus.reduce((sum, s) => sum + s._count, 0);
    const converted = byStatus.find(s => s.status === 'CONVERTED')?._count || 0;
    return c.json({ byStatus, bySource, conversionRate: totalLeads > 0 ? Math.round((converted / totalLeads) * 1000) / 10 : 0, totalConversionValue: 0, convertedCount: converted });
  } catch (error) { throw error; }
};

export const getLead = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const lead = await prisma.lead.findFirst({
      where: { id: c.req.param('id'), practiceId }
    });
    if (!lead) return c.json({ error: 'Lead not found' }, 404);
    return c.json({ data: lead });
  } catch (error) { throw error; }
};

export const createLead = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const lead = await prisma.lead.create({ data: { ...(await c.req.json() as any), practiceId } });
    return c.json({ data: lead }, 201);
  } catch (error) { throw error; }
};

export const updateLead = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const existing = await prisma.lead.findFirst({ where: { id: c.req.param('id'), practiceId } });
    if (!existing) return c.json({ error: 'Lead not found' }, 404);
    const lead = await prisma.lead.update({ where: { id: c.req.param('id') }, data: (await c.req.json()) });
    return c.json({ data: lead });
  } catch (error) { throw error; }
};

export const addLeadActivity = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const lead = await prisma.lead.findFirst({ where: { id: c.req.param('id'), practiceId } });
    if (!lead) return c.json({ error: 'Lead not found' }, 404);
    return c.json({ data: { ...(await c.req.json() as object), id: 'temp-activity-id' } }, 201);
  } catch (error) { throw error; }
};
