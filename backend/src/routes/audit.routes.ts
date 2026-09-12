import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth';
export const auditRouter = Router();
auditRouter.use(authenticate);
auditRouter.get('/', authorize('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'SUPER_ADMIN'), getAuditLogs);
