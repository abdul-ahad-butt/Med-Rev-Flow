import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

export const getNotifications = async (c: Context) => {
  try {
    const { userId } = c.get('user')!;
    const { unreadOnly = '' } = c.req.query();
    const where: Record<string, unknown> = { userId };
    if (unreadOnly === 'true') where.isRead = false;
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return c.json({ data: notifications, unreadCount });
  } catch (error) { throw error; }
};

export const markRead = async (c: Context) => {
  try {
    const { userId } = c.get('user')!;
    await prisma.notification.updateMany({ where: { id: c.req.param('id'), userId }, data: { isRead: true } });
    return c.json({ message: 'Marked as read' });
  } catch (error) { throw error; }
};

export const markAllRead = async (c: Context) => {
  try {
    const { userId } = c.get('user')!;
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return c.json({ message: 'All marked as read' });
  } catch (error) { throw error; }
};
