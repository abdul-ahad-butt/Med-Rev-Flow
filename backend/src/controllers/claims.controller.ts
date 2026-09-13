import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';
import { paginate, paginatedResponse, createAuditLog } from '../utils/helpers';


export const getClaims = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const {
      page = '1', limit = '20', search = '', status = '', providerId = '',
      insuranceId = '', dateFrom = '', dateTo = '', sortBy = 'createdAt', sortOrder = 'desc',
    } = c.req.query();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const { skip, take } = paginate(pageNum, limitNum);

    const where: Record<string, unknown> = { provider: { practiceId } };

    if (search) {
      where.OR = [
        { claimNumber: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) where.status = status as string;
    if (providerId) where.providerId = providerId;
    if (insuranceId) where.insuranceId = insuranceId;
    if (dateFrom || dateTo) {
      where.dateOfService = {};
      if (dateFrom) (where.dateOfService as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.dateOfService as Record<string, Date>).lte = new Date(dateTo);
    }

    const validSortFields = ['createdAt', 'dateOfService', 'billedAmount', 'status', 'claimNumber'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take,
        orderBy: { [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true,  } },
          provider: { select: { id: true, firstName: true, lastName: true } },
          insurance: { select: { id: true, name: true } },
        },
      }),
      prisma.claim.count({ where }),
    ]);

    return c.json(paginatedResponse(claims, total, pageNum, limitNum));
  } catch (error) {
    throw error;
  }
};

export const getClaim = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();

    const claim = await prisma.claim.findFirst({
      where: { id, provider: { practiceId } },
      include: {
        patient: true,
        provider: true,
        insurance: true,
        statusHistory: { orderBy: { changedAt: 'asc' } },
        denials: {
          include: {
            notes: { include: { user: { select: { firstName: true, lastName: true } } } },
            appeals: true,
            assignedTo: { select: { firstName: true, lastName: true } },
          },
        },
        payments: { orderBy: { paidDate: 'desc' } },
      },
    });

    if (!claim) return c.json({ error: 'Claim not found' }, 404);

    return c.json({ data: claim });
  } catch (error) {
    throw error;
  }
};

export const createClaim = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;

    const claimNumber = `CLM-${Date.now().toString().slice(-8)}`;

    const claim = await prisma.claim.create({
      data: {
        ...(await c.req.json()),
        claimNumber,
      },
    });

    await prisma.claimStatusHistory.create({
      data: { claimId: claim.id, toStatus: claim.status, notes: 'Claim created' },
    });

    await createAuditLog({
      userId,
      action: 'CLAIM_CREATED',
      resourceType: 'Claim',
      resourceId: claim.id,
      newValues: (await c.req.json()),
    });

    return c.json({ data: claim }, 201);
  } catch (error) {
    throw error;
  }
};

export const updateClaim = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;
    const { id } = c.req.param();

    const existing = await prisma.claim.findFirst({ where: { id, provider: { practiceId } } });
    if (!existing) return c.json({ error: 'Claim not found' }, 404);

    const claim = await prisma.claim.update({
      where: { id },
      data: (await c.req.json()),
    });

    await createAuditLog({
      userId,
      action: 'CLAIM_UPDATED',
      resourceType: 'Claim',
      resourceId: claim.id,
      oldValues: existing,
      newValues: (await c.req.json()),
    });

    return c.json({ data: claim });
  } catch (error) {
    throw error;
  }
};

export const deleteClaim = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;
    const { id } = c.req.param();

    const existing = await prisma.claim.findFirst({ where: { id, provider: { practiceId } } });
    if (!existing) return c.json({ error: 'Claim not found' }, 404);

    if (existing.status !== 'DRAFT') {
      return c.json({ error: 'Only draft claims can be deleted' }, 400);
    }

    await prisma.claim.delete({ where: { id } });

    await createAuditLog({
      userId,
      action: 'CLAIM_DELETED',
      resourceType: 'Claim',
      resourceId: id,
    });

    return c.json({ message: 'Claim deleted' });
  } catch (error) {
    throw error;
  }
};

export const updateClaimStatus = async (c: Context) => {
  try {
    const { practiceId, userId } = c.get('user')!;
    const { id } = c.req.param();
    const { status, notes } = (await c.req.json()) as { status: string; notes?: string };

    const existing = await prisma.claim.findFirst({ where: { id, provider: { practiceId } } });
    if (!existing) return c.json({ error: 'Claim not found' }, 404);

    const claim = await prisma.claim.update({
      where: { id },
      data: { status },
    });

    await prisma.claimStatusHistory.create({
      data: { claimId: id, fromStatus: existing.status, toStatus: status, notes },
    });

    // Auto-create denial if status is DENIED
    if (status === 'DENIED') {
      await prisma.denial.create({
        data: {
          claimId: id,
          denialReason: notes || 'Claim denied',
          deniedAmount: existing.billedAmount,
          status: 'NEW',
          denialDate: new Date(),
          priority: 'HIGH',
        },
      });

      // Create notification for billing staff
      const billingUsers = await prisma.user.findMany({
        where: { practiceId, role: { in: ['BILLING_STAFF', 'PRACTICE_MANAGER', 'PRACTICE_OWNER'] } },
        select: { id: true },
      });

      await prisma.notification.createMany({
        data: billingUsers.map(u => ({
          userId: u.id,
          type: 'CLAIM',
          title: 'Claim Denied',
          message: `Claim ${existing.claimNumber} has been denied.`,
        })),
      });
    }

    await createAuditLog({
      userId,
      action: 'CLAIM_STATUS_CHANGED',
      resourceType: 'Claim',
      resourceId: id,
      oldValues: { status: existing.status },
      newValues: { status },
    });

    return c.json({ data: claim });
  } catch (error) {
    throw error;
  }
};

export const addClaimNote = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { id } = c.req.param();
    const {  notes  } = await c.req.json();

    const existing = await prisma.claim.findFirst({ where: { id, provider: { practiceId } } });
    if (!existing) return c.json({ error: 'Claim not found' }, 404);

    const claim = await prisma.claim.update({
      where: { id },
      data: { notes: existing.notes ? `${existing.notes}\n\n${notes}` : notes },
    });

    return c.json({ data: claim });
  } catch (error) {
    throw error;
  }
};

export const exportClaims = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { status = '', dateFrom = '', dateTo = '' } = c.req.query();

    const where: Record<string, unknown> = { provider: { practiceId } };
    if (status) where.status = status as string;
    if (dateFrom || dateTo) {
      where.dateOfService = {};
      if (dateFrom) (where.dateOfService as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.dateOfService as Record<string, Date>).lte = new Date(dateTo);
    }

    const claims = await prisma.claim.findMany({
      where,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        provider: { select: { firstName: true, lastName: true } },
        insurance: { select: { name: true } },
      },
      orderBy: { dateOfService: 'desc' },
    });

    const csvRows = [
      ['Claim ID', 'Patient', 'Date of Service', 'Provider', 'Insurance', 'Billed', 'Allowed', 'Paid', 'Status'].join(','),
      ...claims.map(c => [
        c.claimNumber,
        `"${c.patient.lastName}, ${c.patient.firstName}"`,
        c.dateOfService.toISOString().split('T')[0],
        `"${c.provider.firstName} ${c.provider.lastName}"`,
        `"${c.insurance?.name || ''}"`,
        c.billedAmount,
        c.allowedAmount || '',
        c.paidAmount || '',
        c.status,
      ].join(',')),
    ];

    c.header('Content-Type', 'text/csv');
    c.header('Content-Disposition', 'attachment; filename="claims.csv"');
    return c.text(csvRows.join('\n'));
  } catch (error) {
    throw error;
  }
};
