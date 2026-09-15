import { Hono } from 'hono';
import { getARStats, getAR, updateAR } from '../controllers/ar.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';

export const arRouter = new Hono();
arRouter.use('*', authenticate);
arRouter.use('*', requirePermission(Permission.VIEW_AR));

arRouter.get('/', getAR);

// Both /stats and /summary point to the same handler.
// The frontend historically called /ar/summary — this alias prevents 404s
// without requiring a frontend deploy first.
arRouter.get('/stats',   getARStats);
arRouter.get('/summary', getARStats);

arRouter.patch('/:id', requirePermission(Permission.MANAGE_AR), updateAR);
