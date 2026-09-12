import { Router } from 'express';
import { getDashboard, getPriorityActions } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get('/', getDashboard);
dashboardRouter.get('/priority-actions', getPriorityActions);
