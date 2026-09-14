import { Hono } from 'hono';
import { getARStats, getAR, updateAR } from '../controllers/ar.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';

export const arRouter = new Hono();
arRouter.use('*', authenticate);
arRouter.use('*', requirePermission(Permission.VIEW_AR));

arRouter.get('/', getAR);
arRouter.get('/stats', getARStats);
arRouter.patch('/:id', requirePermission(Permission.MANAGE_AR), updateAR);
