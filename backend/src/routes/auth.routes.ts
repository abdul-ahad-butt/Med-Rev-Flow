import { Hono } from 'hono';
import { login, register, me, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = new Hono();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/me', authenticate, me);
authRouter.post('/logout', authenticate, logout);
