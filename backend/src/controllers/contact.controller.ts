import { Context } from 'hono';
import { AuthPayload } from '../middleware/auth';

export const submitContact = async (c: Context) => {
  try {
    return c.json({ message: 'Thank you! We will be in touch shortly.', id: 'temp-id' }, 201);
  } catch (error) { throw error; }
};

export const getContacts = async (c: Context) => {
  try {
    return c.json({ data: [] });
  } catch (error) { throw error; }
};
