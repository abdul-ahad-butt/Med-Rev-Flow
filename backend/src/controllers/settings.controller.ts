import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getPracticeSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const practice = await prisma.practice.findUnique({ where: { id: req.user!.practiceId } });
    if (!practice) return res.status(404).json({ error: 'Practice not found' });
    res.json({ data: practice });
  } catch (error) { next(error); }
};

export const updatePracticeSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const practice = await prisma.practice.update({ where: { id: req.user!.practiceId }, data: req.body });
    res.json({ data: practice });
  } catch (error) { next(error); }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { practiceId: req.user!.practiceId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { firstName: 'asc' },
    });
    res.json({ data: users });
  } catch (error) { next(error); }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const existing = await prisma.user.findFirst({ where: { id: req.params.id, practiceId } });
    if (!existing) return res.status(404).json({ error: 'User not found' });
    const { password, ...safeData } = req.body;
    void password; // Don't allow password update via this endpoint
    const user = await prisma.user.update({ where: { id: req.params.id }, data: safeData, select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true } });
    res.json({ data: user });
  } catch (error) { next(error); }
};

export const getLocations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ data: [] });
  } catch (error) { next(error); }
};

export const createLocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ data: { ...req.body, id: 'temp-id' } });
  } catch (error) { next(error); }
};
