import { Context } from 'hono';
import { prisma } from '../config/prisma';

export const getSEODashboard = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;

    const [leadsBySource, campaigns] = await Promise.all([
      prisma.lead.groupBy({
        by: ['source'],
        where: { practiceId },
        _count: true,
        orderBy: { _count: { source: 'desc' } },
      }),
      prisma.campaign.findMany({
        where: { practiceId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const newLeads = leadsBySource.reduce((acc, curr) => acc + curr._count, 0);

    return c.json({
      campaigns,
      leadsBySource,
      // Real leads count from DB; all other web traffic metrics require an
      // external analytics source (Google Analytics, etc.) – return 0 until
      // that integration is built.  Do NOT return fake numbers.
      newLeads,
      trafficCount: 0,
      trafficTrend: 0,
      bounceRate: 0,
      bounceTrend: 0,
      leadsTrend: 0,
      conversionRate: 0,
      conversionTrend: 0,
    });
  } catch (error) {
    console.error('[seo.controller] getSEODashboard error:', error);
    throw error;
  }
};

export const getKeywords = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const keywords = await prisma.seoKeyword.findMany({
      where: { practiceId },
      orderBy: { position: 'asc' },
      take: 20,
    });
    return c.json({ data: keywords });
  } catch (error) {
    console.error('[seo.controller] getKeywords error:', error);
    throw error;
  }
};

export const createKeyword = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const body = await c.req.json() as { term: string; position: number; volume: string; trend: number };
    const keyword = await prisma.seoKeyword.create({
      data: {
        practiceId,
        term: body.term,
        position: body.position ?? 0,
        volume: body.volume ?? '0',
        trend: body.trend ?? 0,
        updatedAt: new Date(),
      },
    });
    return c.json({ data: keyword }, 201);
  } catch (error) {
    console.error('[seo.controller] createKeyword error:', error);
    throw error;
  }
};

export const updateKeyword = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const id = c.req.param('id');
    const existing = await prisma.seoKeyword.findFirst({ where: { id, practiceId } });
    if (!existing) return c.json({ error: 'Keyword not found' }, 404);
    const body = await c.req.json();
    const keyword = await prisma.seoKeyword.update({ where: { id }, data: { ...body, updatedAt: new Date() } });
    return c.json({ data: keyword });
  } catch (error) {
    console.error('[seo.controller] updateKeyword error:', error);
    throw error;
  }
};
