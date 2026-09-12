import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId, userId } = req.user!;
    const { page = '1', limit = '50', status = '', priority = '', assignedToMe = '' } = req.query as Record<string, string>;
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
    res.json(paginatedResponse(tasks, total, pageNum, limitNum));
  } catch (error) { next(error); }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const task = await prisma.task.create({
      data: { ...req.body, createdById: userId },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } },
    });
    // Notify assignee
    if (task.assignedToId && task.assignedToId !== userId) {
      await prisma.notification.create({
        data: { userId: task.assignedToId, type: 'TASK', title: 'Task Assigned', message: `You have been assigned a task: ${task.title}` },
      });
    }
    res.status(201).json({ data: task });
  } catch (error) { next(error); }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, createdBy: { practiceId } } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    const data = { ...req.body };
    const task = await prisma.task.update({ where: { id: req.params.id }, data, include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } } });
    res.json({ data: task });
  } catch (error) { next(error); }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, createdBy: { practiceId } } });
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (error) { next(error); }
};
