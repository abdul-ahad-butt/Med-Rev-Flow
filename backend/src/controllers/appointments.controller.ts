import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';
import { AppointmentStatus } from '@prisma/client';

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { page = '1', limit = '20', status = '', providerId = '', dateFrom = '', dateTo = '', search = '' } = req.query as Record<string, string>;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const { skip, take } = paginate(pageNum, limitNum);
    const where: Record<string, unknown> = { provider: { practiceId } };
    if (status) where.status = status as AppointmentStatus;
    if (providerId) where.providerId = providerId;
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) (where.startTime as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.startTime as Record<string, Date>).lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where, skip, take,
        orderBy: { startTime: 'asc' },
        include: {
          patient: { select: { firstName: true, lastName: true, phone: true } },
          provider: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);
    res.json(paginatedResponse(appointments, total, pageNum, limitNum));
  } catch (error) { next(error); }
};

export const getAppointmentStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const [todayAppts, upcoming, noShows, byStatus] = await Promise.all([
      prisma.appointment.count({ where: { provider: { practiceId }, startTime: { gte: today, lt: tomorrow } } }),
      prisma.appointment.count({ where: { provider: { practiceId }, startTime: { gte: new Date() }, status: { in: ['SCHEDULED', 'CONFIRMED'] } } }),
      prisma.appointment.count({ where: { provider: { practiceId }, status: 'NO_SHOW' } }),
      prisma.appointment.groupBy({ by: ['status'], where: { provider: { practiceId } }, _count: true }),
    ]);
    const total = byStatus.reduce((sum, s) => sum + s._count, 0);
    const cancelled = byStatus.find(s => s.status === 'CANCELLED')?._count || 0;
    res.json({ today: todayAppts, upcoming, noShows, cancellationRate: total > 0 ? Math.round((cancelled / total) * 1000) / 10 : 0, byStatus });
  } catch (error) { next(error); }
};

export const getAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const appt = await prisma.appointment.findFirst({
      where: { id: req.params.id, provider: { practiceId } },
      include: { patient: true, provider: true },
    });
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ data: appt });
  } catch (error) { next(error); }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appt = await prisma.appointment.create({ data: { ...req.body } });
    res.status(201).json({ data: appt });
  } catch (error) { next(error); }
};

export const updateAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { id } = req.params;
    const existing = await prisma.appointment.findFirst({ where: { id, provider: { practiceId } } });
    if (!existing) return res.status(404).json({ error: 'Appointment not found' });
    const appt = await prisma.appointment.update({ where: { id }, data: req.body });
    // Auto-create task if NO_SHOW
    if (req.body.status === 'NO_SHOW' && existing.status !== 'NO_SHOW') {
      const creator = await prisma.user.findFirst({ where: { practiceId, role: { in: ['FRONT_DESK', 'PRACTICE_MANAGER', 'PRACTICE_OWNER', 'ADMIN'] } } });
      if (creator) {
        await prisma.task.create({
          data: {
            createdById: creator.id,
            title: `Follow-up: No-show for appointment`,
            description: `Patient had a no-show appointment. Please follow up to reschedule.`,
            priority: 'MEDIUM', status: 'PENDING',
          },
        });
      }
    }
    res.json({ data: appt });
  } catch (error) { next(error); }
};
