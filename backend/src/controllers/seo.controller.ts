import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

export const getSEODashboard = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const leadsBySource = await prisma.lead.groupBy({ by: ['source'], where: { practiceId }, _count: true, orderBy: { _count: { source: 'desc' } } });
    return c.json({ latestReport: null, leadsBySource, campaigns: [] });
  } catch (error) { throw error; }
};

export const getKeywords = async (c: Context) => {
  try {
    return c.json({ data: [] });
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
