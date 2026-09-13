import { Hono } from 'hono';
import {
  getDenials, getDenial, updateDenial, addDenialNote, createAppeal, getDenialStats,
} from '../controllers/denials.controller';
import { authenticate } from '../middleware/auth';

export const denialsRouter = new Hono();
denialsRouter.use('*', authenticate);

denialsRouter.get('/', getDenials);
denialsRouter.get('/summary', getDenialStats);
denialsRouter.get('/:id', getDenial);
denialsRouter.patch('/:id', updateDenial);
denialsRouter.post('/:id/notes', addDenialNote);
denialsRouter.post('/:id/appeals', createAppeal);
