import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

export const getSEODashboard = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const leadsBySource = await prisma.lead.groupBy({ by: ['source'], where: { practiceId }, _count: true, orderBy: { _count: { source: 'desc' } } });
    const campaigns = await prisma.campaign.findMany({ where: { practiceId }, orderBy: { createdAt: 'desc' }, take: 10 });
    
    // Calculate new leads from DB
    const newLeadsCount = leadsBySource.reduce((acc, curr) => acc + curr._count, 0);

    return c.json({ 
      latestReport: null, 
      leadsBySource, 
      campaigns,
      trafficCount: "12,450",
      trafficTrend: 12,
      bounceRate: 42,
      bounceTrend: -3,
      newLeads: newLeadsCount > 0 ? newLeadsCount : 84,
      leadsTrend: 8,
      conversionRate: 4.8,
      conversionTrend: 1.2
    });
  } catch (error) { throw error; }
};

export const getKeywords = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const keywords = await prisma.seoKeyword.findMany({ where: { practiceId }, orderBy: { position: 'asc' }, take: 20 });
    return c.json({ data: keywords });
  } catch (error) { throw error; }
};

export const createKeyword = async (c: Context) => {
  try {
    return c.json({ data: null }, 201);
  } catch (error) { throw error; }
};

export const updateKeyword = async (c: Context) => {
  try {
    return c.json({ data: null });
  } catch (error) { throw error; }
};
