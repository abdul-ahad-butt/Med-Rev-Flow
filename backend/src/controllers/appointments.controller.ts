import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse } from '../utils/helpers';


export const getAppointments = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { page = '1', limit = '20', status = '', providerId = '', dateFrom = '', dateTo = '', search = '' } = c.req.query();
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const { skip, take } = paginate(pageNum, limitNum);
    const where: Record<string, unknown> = { provider: { practiceId } };
    if (status) where.status = status as string;
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
    return c.json(paginatedResponse(appointments, total, pageNum, limitNum));
  } catch (error) { throw error; }
};

export const getAppointmentStats = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
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
    return c.json({ today: todayAppts, upcoming, noShows, cancellationRate: total > 0 ? Math.round((cancelled / total) * 1000) / 10 : 0, byStatus });
  } catch (error) { throw error; }
};

export const getAppointment = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const appt = await prisma.appointment.findFirst({
      where: { id: c.req.param('id'), provider: { practiceId } },
      include: { patient: true, provider: true },
    });
    if (!appt) return c.json({ error: 'Appointment not found' }, 404);
    return c.json({ data: appt });
  } catch (error) { throw error; }
};

export const createAppointment = async (c: Context) => {
  try {
    const appt = await prisma.appointment.create({ data: { ...(await c.req.json()) } });
    return c.json({ data: appt }, 201);
  } catch (error) { throw error; }
};

export const updateAppointment = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const body = await c.req.json();
    const existing = await prisma.appointment.findFirst({ where: { id, provider: { practiceId } } });
    if (!existing) return c.json({ error: 'Appointment not found' }, 404);
    const appt = await prisma.appointment.update({ where: { id }, data: body });
    // Auto-create task if NO_SHOW
    if (body.status === 'NO_SHOW' && existing.status !== 'NO_SHOW') {
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
    return c.json({ data: appt });
  } catch (error) { throw error; }
};
