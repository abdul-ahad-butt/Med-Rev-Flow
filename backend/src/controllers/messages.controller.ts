import { Context } from 'hono';
import { prisma } from '../config/prisma';

export const getConversations = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const conversations = await prisma.conversation.findMany({
      where: {
        practiceId: authUser.practiceId,
        OR: [
          { participantAId: authUser.userId },
          { participantBId: authUser.userId },
        ],
      },
      include: {
        participantA: { select: { id: true, firstName: true, lastName: true, role: true } },
        participantB: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return c.json({ data: conversations });
  } catch (error) { throw error; }
};

export const getMessages = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const conversationId = c.req.param('id') as string;
    const { page = '1', limit = '50' } = c.req.query();
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.practiceId !== authUser.practiceId) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    if (conversation.participantAId !== authUser.userId && conversation.participantBId !== authUser.userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      }
    });

    return c.json({ data: messages.reverse() });
  } catch (error) { throw error; }
};

export const sendMessage = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const conversationId = c.req.param('id') as string;
    const { body } = await c.req.json();

    if (!body || typeof body !== 'string') {
      return c.json({ error: 'Message body required' }, 400);
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.practiceId !== authUser.practiceId) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    if (conversation.participantAId !== authUser.userId && conversation.participantBId !== authUser.userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const message = await prisma.conversationMessage.create({
      data: {
        conversationId,
        senderId: authUser.userId,
        body,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true } }
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return c.json({ data: message }, 201);
  } catch (error) { throw error; }
};

export const wsHandler = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const conversationId = c.req.param('id') as string;
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.practiceId !== authUser.practiceId) {
      return c.json({ error: 'Conversation not found' }, 404);
    }
    if (conversation.participantAId !== authUser.userId && conversation.participantBId !== authUser.userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Connect to Durable Object
    const id = c.env.CONVERSATION_ROOM.idFromName(conversationId);
    const room = c.env.CONVERSATION_ROOM.get(id);

    // Forward the WebSocket upgrade request to the DO
    return room.fetch(c.req.raw);
  } catch (error) { throw error; }
};

// Removed getMessageList, sendDirectMessage, createConversation since they're no longer used

export const getUnreadCount = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const count = await prisma.conversationMessage.count({
      where: {
        readAt: null,
        senderId: { not: authUser.userId },
        conversation: {
          practiceId: authUser.practiceId,
          OR: [
            { participantAId: authUser.userId },
            { participantBId: authUser.userId }
          ]
        }
      }
    });

    return c.json({ unreadCount: count });
  } catch (error) { throw error; }
};

export const markAsRead = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const conversationId = c.req.param('id') as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.practiceId !== authUser.practiceId) {
      return c.json({ error: 'Conversation not found' }, 404);
    }

    if (conversation.participantAId !== authUser.userId && conversation.participantBId !== authUser.userId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    await prisma.conversationMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: authUser.userId },
        readAt: null
      },
      data: { readAt: new Date() }
    });

    return c.json({ success: true });
  } catch (error) { throw error; }
};
