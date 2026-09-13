import { Hono } from 'hono';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller';
import { authenticate } from '../middleware/auth';
export const tasksRouter = new Hono();
tasksRouter.use('*', authenticate);
tasksRouter.get('/', getTasks);
tasksRouter.post('/', createTask);
tasksRouter.patch('/:id', updateTask);
tasksRouter.delete('/:id', deleteTask);
