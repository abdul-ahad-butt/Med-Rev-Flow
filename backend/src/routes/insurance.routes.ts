import { Hono } from 'hono';
import { getInsurances, getInsurance, createInsurance, updateInsurance } from '../controllers/insurance.controller';
import { authenticate } from '../middleware/auth';
export const insuranceRouter = new Hono();
insuranceRouter.use('*', authenticate);
insuranceRouter.get('/', getInsurances);
insuranceRouter.post('/', createInsurance);
insuranceRouter.get('/:id', getInsurance);
insuranceRouter.patch('/:id', updateInsurance);
