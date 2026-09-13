import { Context } from 'hono';
import { AuthPayload } from '../middleware/auth';
import { paginatedResponse } from '../utils/helpers';

export const getAR = async (c: Context) => {
  try {
    const { page = '1', limit = '20' } = c.req.query();
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    return c.json(paginatedResponse([], 0, pageNum, limitNum));
  } catch (error) { throw error; }
};

export const getARStats = async (c: Context) => {
  try {
    c.json({
      totalAR: 0,
      totalBilled: 0,
      byBucket: [
        { bucket: '0-30', balance: 0, count: 0 },
        { bucket: '31-60', balance: 0, count: 0 },
        { bucket: '61-90', balance: 0, count: 0 },
        { bucket: '91-120', balance: 0, count: 0 },
        { bucket: '120+', balance: 0, count: 0 },
      ],
      collectionRate: 0,
    });
  } catch (error) { throw error; }
};

export const updateAR = async (c: Context) => {
  try {
    return c.json({ error: 'A/R record not found' }, 404);
  } catch (error) { throw error; }
};
