import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getTasks = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;
    const { page = '1', limit = '50', status = '', priority = '', assignedToMe = '' } = c.req.query();
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const { skip, take } = paginate(pageNum, limitNum);
    const where: Record<string, unknown> = { createdBy: { practiceId } };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToMe === 'true') where.assignedToId = userId;
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where, skip, take,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.task.count({ where }),
    ]);
    return c.json(paginatedResponse(tasks, total, pageNum, limitNum));
  } catch (error) { throw error; }
};

export const createTask = async (c: Context) => {
  try {
    const { userId } = c.get('user')!;
    const task = await prisma.task.create({
      data: { ...(await c.req.json()), createdById: userId },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
    });
    // Notify assignee
    if (task.assignedToId && task.assignedToId !== userId) {
      await prisma.notification.create({
        data: { userId: task.assignedToId, type: 'TASK', title: 'Task Assigned', message: `You have been assigned a task: ${task.title}` },
      });
    }
    return c.json({ data: task }, 201);
  } catch (error) { throw error; }
};

export const updateTask = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const existing = await prisma.task.findFirst({ where: { id: c.req.param('id'), createdBy: { practiceId } } });
    if (!existing) return c.json({ error: 'Task not found' }, 404);
    const data = { ...(await c.req.json()) };
    const task = await prisma.task.update({ where: { id: c.req.param('id') }, data, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } } });
    return c.json({ data: task });
  } catch (error) { throw error; }
};

export const deleteTask = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const existing = await prisma.task.findFirst({ where: { id: c.req.param('id'), createdBy: { practiceId } } });
    if (!existing) return c.json({ error: 'Task not found' }, 404);
    await prisma.task.delete({ where: { id: c.req.param('id') } });
    return c.json({ message: 'Task deleted' });
  } catch (error) { throw error; }
};
