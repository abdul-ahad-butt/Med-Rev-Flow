import { Router } from 'express';
import { submitContact, getContacts } from '../controllers/contact.controller';
import { authenticate, authorize } from '../middleware/auth';
export const contactRouter = Router();
contactRouter.post('/', submitContact);
contactRouter.get('/', authenticate, authorize('SUPER_ADMIN', 'PRACTICE_OWNER'), getContacts);
