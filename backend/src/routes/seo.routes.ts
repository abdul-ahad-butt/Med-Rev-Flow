import { Router } from 'express';
import { getSEODashboard, getKeywords, updateKeyword, createKeyword } from '../controllers/seo.controller';
import { authenticate } from '../middleware/auth';
export const seoRouter = Router();
seoRouter.use(authenticate);
seoRouter.get('/', getSEODashboard);
seoRouter.get('/keywords', getKeywords);
seoRouter.post('/keywords', createKeyword);
seoRouter.patch('/keywords/:id', updateKeyword);
