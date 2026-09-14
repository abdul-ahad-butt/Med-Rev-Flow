import { Hono } from 'hono';
import { getDenials, getDenial, updateDenial, addDenialNote, createAppeal, getDenialStats } from '../controllers/denials.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';

export const denialsRouter = new Hono();
denialsRouter.use('*', authenticate);
denialsRouter.use('*', requirePermission(Permission.VIEW_DENIALS));

denialsRouter.get('/', getDenials);
denialsRouter.get('/summary', getDenialStats);
denialsRouter.get('/:id', getDenial);
denialsRouter.patch('/:id', updateDenial);
denialsRouter.post('/:id/notes', addDenialNote);
denialsRouter.post('/:id/appeals', createAppeal);
