import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

export const getDashboard = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    if (!practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // KPIs
    const [
      totalRevenueResult,
      outstandingARResult,
      deniedClaimsCount,
      pendingClaimsCount,
      todayAppointments,
      claimsStatusCounts,
      recentPayments,
      denialsByReason,
      totalClaims,
      activePatients,
      openTasks,
      recentClaims,
      recentDenials
    ] = await Promise.all([
      // Total revenue (sum of all payments)
      prisma.payment.aggregate({
        where: { claim: { provider: { practiceId } } },
        _sum: { amount: true },
      }),
      // Outstanding A/R (sum of unresolved balances)
      prisma.claim.aggregate({
        where: { provider: { practiceId }, status: { notIn: ['PAID', 'CLOSED'] } },
        _sum: { billedAmount: true, paidAmount: true },
      }),
      // Denied claims count
      prisma.claim.count({
        where: { provider: { practiceId }, status: 'DENIED' },
      }),
      // Pending claims count
      prisma.claim.count({
        where: { provider: { practiceId }, status: { in: ['SUBMITTED', 'PENDING', 'ACCEPTED'] } },
      }),
      // Today's appointments
      prisma.appointment.count({
        where: {
          provider: { practiceId },
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      // Claims by status
      prisma.claim.groupBy({
        by: ['status'],
        where: { provider: { practiceId } },
        _count: { status: true },
        _sum: { billedAmount: true },
      }),
      // Recent payments for revenue trend (in memory group)
      prisma.payment.findMany({
        where: {
          claim: { provider: { practiceId } },
          paidDate: { gte: twelveMonthsAgo },
        },
        select: { amount: true, paidDate: true },
        orderBy: { paidDate: 'asc' },
      }),
      // Denials by reason
      prisma.denial.groupBy({
        by: ['denialReason'],
        where: { claim: { provider: { practiceId } } },
        _count: { denialReason: true },
        _sum: { deniedAmount: true },
        orderBy: { _count: { denialReason: 'desc' } },
        take: 6,
      }),
      // Total Claims
      prisma.claim.count({
        where: { provider: { practiceId } }
      }),
      // Active patients
      prisma.patient.count({
        where: { practiceId }
      }),
      // Open tasks
      prisma.task.findMany({
        where: { 
          OR: [
            { assignedToId: c.get('user')!.userId },
            { createdById: c.get('user')!.userId }
          ],
          status: { notIn: ['COMPLETED'] }
        },
        take: 5,
        orderBy: { dueDate: 'asc' }
      }),
      // Recent claims
      prisma.claim.findMany({
        where: { provider: { practiceId } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { patient: true }
      }),
      // Recent denials
      prisma.denial.findMany({
        where: { claim: { provider: { practiceId } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { claim: true }
      })
    ]);

    // Group monthly revenue in memory
    const monthlyRevenueMap: Record<string, number> = {};
    recentPayments.forEach(p => {
      const monthStr = p.paidDate.toISOString().substring(0, 7); // "YYYY-MM"
      monthlyRevenueMap[monthStr] = (monthlyRevenueMap[monthStr] || 0) + p.amount;
    });
    const monthlyRevenue = Object.entries(monthlyRevenueMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate A/R
    const outstandingAR = Math.max(0, Number(outstandingARResult?._sum?.billedAmount || 0) - Number(outstandingARResult?._sum?.paidAmount || 0));
    
    // Mock AR buckets based on total A/R for visual purposes
    const arBuckets = [
      { agingBucket: '0-30', _sum: { balance: outstandingAR * 0.4 }, _count: 10 },
      { agingBucket: '31-60', _sum: { balance: outstandingAR * 0.3 }, _count: 8 },
      { agingBucket: '61-90', _sum: { balance: outstandingAR * 0.2 }, _count: 5 },
      { agingBucket: '90+', _sum: { balance: outstandingAR * 0.1 }, _count: 3 },
    ];

    // Calculate recovery opportunity (denied amount - recovered)
    const denialAgg = await prisma.denial.aggregate({
      where: { claim: { provider: { practiceId } } },
      _sum: { deniedAmount: true, recoveredAmount: true },
    });

    const deniedTotal = Number(denialAgg?._sum?.deniedAmount || 0);
    const recoveredTotal = Number(denialAgg?._sum?.recoveredAmount || 0);
    const recoveryOpportunity = deniedTotal - recoveredTotal;

    // Collection rate = payments / (billedAmount of paid claims)
    const billedAgg = await prisma.claim.aggregate({
      where: { provider: { practiceId }, status: { in: ['PAID', 'CLOSED'] } },
      _sum: { billedAmount: true, paidAmount: true },
    });
    const collectionRate = billedAgg?._sum?.billedAmount
      ? (Number(billedAgg._sum.paidAmount || 0) / Number(billedAgg._sum.billedAmount)) * 100
      : 0;

    // Denial rate
    const totalSubmitted = await prisma.claim.count({
      where: { provider: { practiceId }, status: { notIn: ['DRAFT'] } },
    });
    const denialRate = totalSubmitted > 0 ? (deniedClaimsCount / totalSubmitted) * 100 : 0;

    return c.json({
      kpis: {
        totalRevenue: Number(totalRevenueResult?._sum?.amount || 0),
        monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[monthlyRevenue.length - 1].revenue : 0,
        totalClaims,
        openDenials: deniedClaimsCount,
        collectionRate: Math.round(collectionRate * 10) / 10,
        pendingAR: outstandingAR,
        activePatients,
        outstandingAR,
        deniedClaims: deniedClaimsCount,
        pendingClaims: pendingClaimsCount,
        recoveryOpportunity: Math.max(0, recoveryOpportunity),
        todayAppointments,
        denialRate: Math.round(denialRate * 10) / 10,
      },
      recentClaims,
      recentDenials,
      monthlyRevenue,
      claimsByStatus: claimsStatusCounts.map(c => ({ status: c.status, _count: c._count.status })),
      arBuckets,
      // For backwards compatibility
      claimsStatus: claimsStatusCounts.map(c => ({
        status: c.status,
        count: c._count.status,
        amount: Number(c._sum.billedAmount || 0),
      })),
      arAging: arBuckets.map(a => ({
        bucket: a.agingBucket,
        total: Number(a._sum.balance || 0),
        count: a._count,
      })),
      denialsByReason: denialsByReason.map(d => ({
        reason: d.denialReason, denialDate: new Date(),
        count: d._count.denialReason,
        amount: Number(d._sum.deniedAmount || 0),
      })),
      revenueByMonth: monthlyRevenue,
      tasks: openTasks
    });
  } catch (error) {
    throw error;
  }
};
export const getPriorityActions = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    if (!practiceId) {
      return c.json({ error: 'Practice ID is required' }, 403);
    }
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const timingLimit = new Date(Date.now() - 270 * 24 * 60 * 60 * 1000); // 270 days ago

    const [
      missingInfoDenials,
      timingFilingClaims,
      expiringAuths,
      unresolvedDenials,
    ] = await Promise.all([
      prisma.denial.count({
        where: {
          claim: { provider: { practiceId } },
          denialReason: { contains: 'missing' },
          status: { notIn: ['RESOLVED', 'APPEAL_APPROVED'] },
        },
      }),
      prisma.claim.count({
        where: {
          provider: { practiceId },
          status: { in: ['DENIED', 'REJECTED'] },
          dateOfService: { lte: timingLimit },
        },
      }),
      prisma.priorAuthorization.count({
        where: {
          patient: { practiceId },
          status: 'APPROVED',
          expirationDate: { lte: sevenDaysFromNow, gte: new Date() },
        },
      }),
      prisma.denial.count({
        where: {
          claim: { provider: { practiceId } },
          status: { in: ['NEW', 'UNDER_REVIEW', 'DOCUMENTATION_NEEDED'] },
        },
      }),
    ]);

    const actions = [];

    if (missingInfoDenials > 0) {
      actions.push({
        id: 'missing-info',
        level: 'URGENT',
        message: `${missingInfoDenials} claim${missingInfoDenials > 1 ? 's have' : ' has'} been denied for missing information.`,
        link: '/denials',
        count: missingInfoDenials,
      });
    }

    if (timingFilingClaims > 0) {
      actions.push({
        id: 'timely-filing',
        level: 'HIGH',
        message: `${timingFilingClaims} claim${timingFilingClaims > 1 ? 's are' : ' is'} approaching timely filing limits.`,
        link: '/claims',
        count: timingFilingClaims,
      });
    }

    if (expiringAuths > 0) {
      actions.push({
        id: 'expiring-auths',
        level: 'MEDIUM',
        message: `${expiringAuths} prior authorization${expiringAuths > 1 ? 's' : ''} expiring within 7 days.`,
        link: '/prior-authorizations',
        count: expiringAuths,
      });
    }

    if (unresolvedDenials > 0) {
      actions.push({
        id: 'unresolved-denials',
        level: 'HIGH',
        message: `${unresolvedDenials} denial${unresolvedDenials > 1 ? 's require' : ' requires'} follow-up.`,
        link: '/denials',
        count: unresolvedDenials,
      });
    }

    return c.json({ actions });
  } catch (error) {
    throw error;
  }
};
