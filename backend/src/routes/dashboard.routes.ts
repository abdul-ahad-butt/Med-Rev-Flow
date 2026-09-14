import { Hono } from 'hono';
import { getDashboard, getPriorityActions } from '../controllers/dashboard.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';

export const dashboardRouter = new Hono();

dashboardRouter.use('*', authenticate, requirePermission(Permission.VIEW_DASHBOARD));
dashboardRouter.get('/', getDashboard);
dashboardRouter.get('/priority-actions', getPriorityActions);
