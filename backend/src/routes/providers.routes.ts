import { Hono } from 'hono';
import { getProviders, getProvider, createProvider, updateProvider } from '../controllers/providers.controller';
import { authenticate } from '../middleware/auth';
export const providersRouter = new Hono();
providersRouter.use('*', authenticate);
providersRouter.get('/', getProviders);
providersRouter.post('/', createProvider);
providersRouter.get('/:id', getProvider);
providersRouter.patch('/:id', updateProvider);
