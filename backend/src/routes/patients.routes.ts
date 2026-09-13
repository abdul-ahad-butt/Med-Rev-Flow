import { Hono } from 'hono';
import { getPatients, getPatient, createPatient, updatePatient } from '../controllers/patients.controller';
import { authenticate } from '../middleware/auth';
export const patientsRouter = new Hono();
patientsRouter.use('*', authenticate);
patientsRouter.get('/', getPatients);
patientsRouter.post('/', createPatient);
patientsRouter.get('/:id', getPatient);
patientsRouter.patch('/:id', updatePatient);
