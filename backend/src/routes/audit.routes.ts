import { Hono } from 'hono';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';
export const auditRouter = new Hono();
auditRouter.use('*', authenticate);
auditRouter.get('/', requirePermission(Permission.VIEW_AUDIT_LOG), getAuditLogs);
