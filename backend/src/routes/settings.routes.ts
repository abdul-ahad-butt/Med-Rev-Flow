import { Hono } from 'hono';
import { authenticate, requirePermission } from '../middleware/auth';
import { Permission } from '../middleware/permissions';
import {
  getPracticeSettings, updatePracticeSettings,
  getUsers, updateUser,
  createPracticeUser, deactivatePracticeUser, activatePracticeUser, resetPracticeUserPassword,
  getLocations, createLocation,
} from '../controllers/settings.controller';

export const settingsRouter = new Hono();
settingsRouter.use('*', authenticate);

settingsRouter.get('/practice', requirePermission(Permission.MANAGE_PRACTICE_SETTINGS), getPracticeSettings);
settingsRouter.patch('/practice', requirePermission(Permission.MANAGE_PRACTICE_SETTINGS), updatePracticeSettings);

settingsRouter.get('/users', requirePermission(Permission.MANAGE_USERS), getUsers);
settingsRouter.patch('/users/:id', updateUser);
settingsRouter.post('/users', requirePermission(Permission.MANAGE_USERS), createPracticeUser);
settingsRouter.post('/users/:id/deactivate', requirePermission(Permission.MANAGE_USERS), deactivatePracticeUser);
settingsRouter.post('/users/:id/activate', requirePermission(Permission.MANAGE_USERS), activatePracticeUser);
settingsRouter.post('/users/:id/reset-password', requirePermission(Permission.MANAGE_USERS), resetPracticeUserPassword);

settingsRouter.get('/locations', getLocations);
settingsRouter.post('/locations', createLocation);
