import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse, createAuditLog } from '../utils/helpers';

export const getPatients = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { page = '1', limit = '20', search = '' } = c.req.query();
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const { skip, take } = paginate(pageNum, limitNum);
    const where: Record<string, unknown> = { practiceId };
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where, skip, take,
        orderBy: { lastName: 'asc' },
        include: {
          _count: { select: { appointments: true, claims: true } },
        },
      }),
      prisma.patient.count({ where }),
    ]);
    return c.json(paginatedResponse(patients, total, pageNum, limitNum));
  } catch (error) { throw error; }
};

export const getPatient = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const patient = await prisma.patient.findFirst({
      where: { id, practiceId },
      include: {
        appointments: { orderBy: { startTime: 'desc' }, take: 10, include: { provider: { select: { firstName: true, lastName: true } } } },
        claims: { orderBy: { dateOfService: 'desc' }, take: 10, include: { insurance: { select: { name: true } } } },
      },
    });
    if (!patient) return c.json({ error: 'Patient not found' }, 404);
    return c.json({ data: patient });
  } catch (error) { throw error; }
};

export const createPatient = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;
    const patient = await prisma.patient.create({ data: { ...(await c.req.json()), practiceId } });
    await createAuditLog({ userId, action: 'PATIENT_CREATED', resourceType: 'Patient', resourceId: patient.id });
    return c.json({ data: patient }, 201);
  } catch (error) { throw error; }
};

export const updatePatient = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;
    const { id } = c.req.param();
    const existing = await prisma.patient.findFirst({ where: { id, practiceId } });
    if (!existing) return c.json({ error: 'Patient not found' }, 404);
    const patient = await prisma.patient.update({ where: { id }, data: (await c.req.json()) });
    await createAuditLog({ userId, action: 'PATIENT_UPDATED', resourceType: 'Patient', resourceId: id, oldValues: existing, newValues: (await c.req.json()) });
    return c.json({ data: patient });
  } catch (error) { throw error; }
};
