import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth';
import { paginate, paginatedResponse, createAuditLog } from '../utils/helpers';

export const getPatients = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { page = '1', limit = '20', search = '' } = req.query as Record<string, string>;
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
    res.json(paginatedResponse(patients, total, pageNum, limitNum));
  } catch (error) { next(error); }
};

export const getPatient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId } = req.user!;
    const { id } = req.params;
    const patient = await prisma.patient.findFirst({
      where: { id, practiceId },
      include: {
        appointments: { orderBy: { startTime: 'desc' }, take: 10, include: { provider: { select: { firstName: true, lastName: true } } } },
        claims: { orderBy: { dateOfService: 'desc' }, take: 10, include: { insurance: { select: { name: true } } } },
      },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json({ data: patient });
  } catch (error) { next(error); }
};

export const createPatient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId, userId } = req.user!;
    const patient = await prisma.patient.create({ data: { ...req.body, practiceId } });
    await createAuditLog({ userId, action: 'PATIENT_CREATED', resourceType: 'Patient', resourceId: patient.id });
    res.status(201).json({ data: patient });
  } catch (error) { next(error); }
};

export const updatePatient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { practiceId, userId } = req.user!;
    const { id } = req.params;
    const existing = await prisma.patient.findFirst({ where: { id, practiceId } });
    if (!existing) return res.status(404).json({ error: 'Patient not found' });
    const patient = await prisma.patient.update({ where: { id }, data: req.body });
    await createAuditLog({ userId, action: 'PATIENT_UPDATED', resourceType: 'Patient', resourceId: id, oldValues: existing, newValues: req.body });
    res.json({ data: patient });
  } catch (error) { next(error); }
};
