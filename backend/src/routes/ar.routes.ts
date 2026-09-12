import { Router } from 'express';
import { getAR, getARStats, updateAR } from '../controllers/ar.controller';
import { authenticate } from '../middleware/auth';
export const arRouter = Router();
arRouter.use(authenticate);
arRouter.get('/', getAR);
arRouter.get('/stats', getARStats);
arRouter.patch('/:id', updateAR);
