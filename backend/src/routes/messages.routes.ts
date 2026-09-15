import { Hono } from 'hono';
import {
  getConversations,
  getMessages,
  sendMessage,
  wsHandler,
  getUnreadCount,
  markAsRead
} from '../controllers/messages.controller';
import { authenticate } from '../middleware/auth';

export const messagesRouter = new Hono();
messagesRouter.use('*', authenticate);
// Removing requirePermission(Permission.VIEW_MESSAGES) as messaging should be available to all authenticated users in a practice.

messagesRouter.get('/conversations', getConversations);
messagesRouter.get('/conversations/:id/messages', getMessages);
messagesRouter.post('/conversations/:id/messages', sendMessage);
messagesRouter.post('/conversations/:id/read', markAsRead);

// Unread count
messagesRouter.get('/unread-count', getUnreadCount);

// Websocket upgrade endpoint
messagesRouter.get('/conversations/:id/ws', wsHandler);
