import { Hono } from 'hono';
import { submitContact, getContacts } from '../controllers/contact.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';
export const contactRouter = new Hono();
contactRouter.post('/', submitContact);
contactRouter.get('/', authenticate, requirePermission(Permission.PLATFORM_MANAGE_USERS), getContacts);
