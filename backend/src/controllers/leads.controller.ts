import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getLeads = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { page = '1', limit = '20', status = '', search = '', source = '' } = req.query as Record<string, string>;
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
    res.json(paginatedResponse(leads, total, pageNum, limitNum));
  } catch (error) { next(error); }
};

export const getLeadStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const [byStatus, bySource] = await Promise.all([
      prisma.lead.groupBy({ by: ['status'], where: { practiceId }, _count: true }),
      prisma.lead.groupBy({ by: ['source'], where: { practiceId }, _count: true, orderBy: { _count: { source: 'desc' } } }),
    ]);
    const totalLeads = byStatus.reduce((sum, s) => sum + s._count, 0);
    const converted = byStatus.find(s => s.status === 'CONVERTED')?._count || 0;
    res.json({ byStatus, bySource, conversionRate: totalLeads > 0 ? Math.round((converted / totalLeads) * 1000) / 10 : 0, totalConversionValue: 0, convertedCount: converted });
  } catch (error) { next(error); }
};

export const getLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const lead = await prisma.lead.findFirst({
      where: { id: req.params.id, practiceId }
    });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ data: lead });
  } catch (error) { next(error); }
};

export const createLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const lead = await prisma.lead.create({ data: { ...req.body, practiceId } });
    res.status(201).json({ data: lead });
  } catch (error) { next(error); }
};

export const updateLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const existing = await prisma.lead.findFirst({ where: { id: req.params.id, practiceId } });
    if (!existing) return res.status(404).json({ error: 'Lead not found' });
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: req.body });
    res.json({ data: lead });
  } catch (error) { next(error); }
};

export const addLeadActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const lead = await prisma.lead.findFirst({ where: { id: req.params.id, practiceId } });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.status(201).json({ data: { ...req.body, id: 'temp-activity-id' } });
  } catch (error) { next(error); }
};
