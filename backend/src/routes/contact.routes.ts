import { Hono } from 'hono';
import { submitContact, getContacts } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth';
export const contactRouter = new Hono();
contactRouter.post('/', submitContact);
contactRouter.get('/', authenticate, authorize('SUPER_ADMIN', 'PRACTICE_OWNER'), getContacts);
