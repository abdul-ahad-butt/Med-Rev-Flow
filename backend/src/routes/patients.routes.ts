import { Router } from 'express';
import { getPatients, getPatient, createPatient, updatePatient } from '../controllers/patients.controller';
import { authenticate } from '../middleware/auth';
export const patientsRouter = Router();
patientsRouter.use(authenticate);
patientsRouter.get('/', getPatients);
patientsRouter.post('/', createPatient);
patientsRouter.get('/:id', getPatient);
patientsRouter.patch('/:id', updatePatient);
