import { Router } from 'express';
import { getConversations, getMessages, sendMessage, createConversation } from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth';
export const messagesRouter = Router();
messagesRouter.use(authenticate);
messagesRouter.get('/conversations', getConversations);
messagesRouter.post('/conversations', createConversation);
messagesRouter.get('/conversations/:id/messages', getMessages);
messagesRouter.post('/conversations/:id/messages', sendMessage);
