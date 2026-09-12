import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { paginatedResponse } from '../utils/helpers';

export const getAR = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    res.json(paginatedResponse([], 0, pageNum, limitNum));
  } catch (error) { next(error); }
};

export const getARStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({
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
  } catch (error) { next(error); }
};

export const updateAR = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(404).json({ error: 'A/R record not found' });
  } catch (error) { next(error); }
};
