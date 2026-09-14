import { Hono } from 'hono';
import { getPatients, getPatient, createPatient, updatePatient } from '../controllers/patients.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';

export const patientsRouter = new Hono();
patientsRouter.use('*', authenticate);
patientsRouter.use('*', requirePermission(Permission.VIEW_PATIENTS));

patientsRouter.get('/', getPatients);
patientsRouter.post('/', createPatient);
patientsRouter.get('/:id', getPatient);
patientsRouter.patch('/:id', updatePatient);
