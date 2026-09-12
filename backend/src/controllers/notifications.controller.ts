import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { unreadOnly = '' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { userId };
    if (unreadOnly === 'true') where.isRead = false;
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    res.json({ data: notifications, unreadCount });
  } catch (error) { next(error); }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    await prisma.notification.updateMany({ where: { id: req.params.id, userId }, data: { isRead: true } });
    res.json({ message: 'Marked as read' });
  } catch (error) { next(error); }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    res.json({ message: 'All marked as read' });
  } catch (error) { next(error); }
};
