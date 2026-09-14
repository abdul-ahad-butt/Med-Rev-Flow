import { Hono } from 'hono';
import { login, logout, me, changePassword, register } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = new Hono();
authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/logout', authenticate, logout);
authRouter.get('/me', authenticate, me);
authRouter.post('/change-password', authenticate, changePassword);
