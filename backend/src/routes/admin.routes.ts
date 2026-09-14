import { Hono } from 'hono';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';
import {
  getAdminDashboard, listPractices, createPractice, getPractice, updatePractice,
  suspendPractice, activatePractice, createPracticeOwner, listPracticeOwners,
  adminResetPassword, getAdminAuditLogs,
} from '../controllers/admin.controller';

export const adminRouter = new Hono();
adminRouter.use('*', authenticate);
adminRouter.use('*', requirePermission(Permission.PLATFORM_MANAGE_PRACTICES));

adminRouter.get('/dashboard', getAdminDashboard);
adminRouter.get('/practices', listPractices);
adminRouter.post('/practices', createPractice);
adminRouter.get('/practices/:id', getPractice);
adminRouter.patch('/practices/:id', updatePractice);
adminRouter.post('/practices/:id/suspend', suspendPractice);
adminRouter.post('/practices/:id/activate', activatePractice);
adminRouter.post('/practice-owners', createPracticeOwner);
adminRouter.get('/practice-owners', listPracticeOwners);
adminRouter.post('/users/:id/reset-password', adminResetPassword);
adminRouter.get('/audit-logs', getAdminAuditLogs);
