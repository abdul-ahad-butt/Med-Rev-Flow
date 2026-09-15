import { Context } from 'hono';
import { prisma } from '../config/prisma';

/**
 * GET /api/messages
 *
 * Returns messages (as a thread list) for the authenticated user's practice.
 * Messages are ordered by most recent first.
 */
export const getMessageList = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const { page = '1', limit = '50' } = c.req.query();
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));

    // Build where clause — users see messages where they are sender or receiver
    // and scoped to their practice
    const where: Record<string, unknown> = {
      OR: [
        { senderId:   authUser.userId },
        { receiverId: authUser.userId },
      ],
    };
    if (authUser.practiceId) {
      where.practiceId = authUser.practiceId;
    }

    const [total, messages] = await Promise.all([
      prisma.message.count({ where }),
      prisma.message.findMany({
        where,
        skip:    (pageNum - 1) * limitNum,
        take:    limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          sender:   { select: { id: true, firstName: true, lastName: true, role: true } },
          receiver: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      }),
    ]);

    return c.json({
      data:  messages,
      total,
      page:  pageNum,
      limit: limitNum,
    });
  } catch (error) { throw error; }
};

/**
 * POST /api/messages
 * Send a new message within the practice.
 */
export const sendDirectMessage = async (c: Context) => {
  try {
    const authUser = c.get('user');
    if (!authUser) return c.json({ error: 'Not authenticated' }, 401);

    const body = await c.req.json();
    if (!body.receiverId || !body.content) {
      return c.json({ error: 'receiverId and content are required' }, 400);
    }

    const message = await prisma.message.create({
      data: {
        senderId:   authUser.userId,
        receiverId: body.receiverId,
        content:    body.content,
        subject:    body.subject,
        practiceId: authUser.practiceId,
        priority:   body.priority || 'MEDIUM',
      },
      include: {
        sender:   { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return c.json({ data: message }, 201);
  } catch (error) { throw error; }
};

// --- Legacy /conversations routes kept for backward compatibility ---

export const getConversations = async (c: Context) => {
  try {
    return c.json({ data: [] });
  } catch (error) { throw error; }
};

export const createConversation = async (c: Context) => {
  try {
    return c.json({ data: { id: 'temp-conv-id', name: (await c.req.json()).name, members: [] } }, 201);
  } catch (error) { throw error; }
};

export const getMessages = async (c: Context) => {
  try {
    return c.json({ data: [] });
  } catch (error) { throw error; }
};

export const sendMessage = async (c: Context) => {
  try {
    return c.json({ data: { id: 'temp-msg-id', content: (await c.req.json()).content } }, 201);
  } catch (error) { throw error; }
};
