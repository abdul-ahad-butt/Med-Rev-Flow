import { Context } from 'hono';
import { AuthPayload } from '../middleware/auth';

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
