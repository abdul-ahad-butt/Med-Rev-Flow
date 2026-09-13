import { Hono } from 'hono';
import { getDashboard, getPriorityActions } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

export const dashboardRouter = new Hono();

dashboardRouter.use('*', authenticate);
dashboardRouter.get('/', getDashboard);
dashboardRouter.get('/priority-actions', getPriorityActions);
