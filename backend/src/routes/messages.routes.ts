import { Hono } from 'hono';
import {
  getMessageList,
  sendDirectMessage,
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
} from '../controllers/messages.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';

export const messagesRouter = new Hono();
messagesRouter.use('*', authenticate);
messagesRouter.use('*', requirePermission(Permission.VIEW_MESSAGES));

// The frontend calls GET /api/messages — this is the primary handler
messagesRouter.get('/',    getMessageList);
messagesRouter.post('/',   sendDirectMessage);

// Legacy /conversations sub-routes kept for backward compatibility
messagesRouter.get('/conversations',                    getConversations);
messagesRouter.post('/conversations',                   createConversation);
messagesRouter.get('/conversations/:id/messages',       getMessages);
messagesRouter.post('/conversations/:id/messages',      sendMessage);
