import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getSEODashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const leadsBySource = await prisma.lead.groupBy({ by: ['source'], where: { practiceId }, _count: true, orderBy: { _count: { source: 'desc' } } });
    res.json({ latestReport: null, leadsBySource, campaigns: [] });
  } catch (error) { next(error); }
};

export const getKeywords = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: [] });
  } catch (error) { next(error); }
};

export const createKeyword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: null });
  } catch (error) { next(error); }
};

export const updateKeyword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: null });
  } catch (error) { next(error); }
};
