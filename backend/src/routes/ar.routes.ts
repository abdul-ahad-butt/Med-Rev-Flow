import { Hono } from 'hono';
import { getAR, getARStats, updateAR } from '../controllers/ar.controller';
import { authenticate } from '../middleware/auth';
export const arRouter = new Hono();
arRouter.use('*', authenticate);
arRouter.get('/', getAR);
arRouter.get('/summary', getARStats);
arRouter.patch('/:id', updateAR);
