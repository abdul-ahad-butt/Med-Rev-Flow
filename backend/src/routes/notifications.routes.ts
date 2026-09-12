import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';
export const notificationsRouter = Router();
notificationsRouter.use(authenticate);
notificationsRouter.get('/', getNotifications);
notificationsRouter.patch('/:id/read', markRead);
notificationsRouter.patch('/mark-all-read', markAllRead);
