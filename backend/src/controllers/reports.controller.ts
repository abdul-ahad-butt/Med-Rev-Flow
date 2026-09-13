import { Context } from 'hono';
import { prisma } from '../config/prisma';
import { AuthPayload } from '../middleware/auth';

const getDateFilter = (dateFrom: string, dateTo: string) => {
  if (!dateFrom && !dateTo) return undefined;
  const filter: Record<string, Date> = {};
  if (dateFrom) filter.gte = new Date(dateFrom);
  if (dateTo) filter.lte = new Date(dateTo);
  return filter;
};

export const getRevenueCycle = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { dateFrom = '', dateTo = '', providerId = '', insuranceId = '' } = c.req.query();
    const claimWhere: Record<string, unknown> = { provider: { practiceId } };
    if (providerId) claimWhere.providerId = providerId;
    if (insuranceId) claimWhere.insuranceId = insuranceId;
    const dateFilter = getDateFilter(dateFrom, dateTo);
    if (dateFilter) claimWhere.dateOfService = dateFilter;

    const [claimsAgg, paymentAgg, denialAgg, submittedCount, acceptedCount, paidCount] = await Promise.all([
      prisma.claim.aggregate({ where: claimWhere, _sum: { billedAmount: true, allowedAmount: true }, _count: true }),
      prisma.payment.aggregate({ where: { claim: claimWhere }, _sum: { amount: true } }),
      prisma.denial.aggregate({ where: { claim: claimWhere }, _count: true, _sum: { deniedAmount: true } }),
      prisma.claim.count({ where: { ...claimWhere, status: { notIn: ['DRAFT'] } } }),
      prisma.claim.count({ where: { ...claimWhere, status: { notIn: ['DRAFT', 'REJECTED', 'DENIED'] } } }),
      prisma.claim.count({ where: { ...claimWhere, status: 'PAID' } }),
    ]);

    const grossCharges = Number(claimsAgg._sum.billedAmount || 0);
    const payments = Number(paymentAgg._sum.amount || 0);
    const adjustments = 0; // adjustmentAmount not in Claim model
    const outstandingAR = grossCharges - payments - adjustments;

    c.json({
      grossCharges,
      payments,
      adjustments,
      outstandingAR: Math.max(0, outstandingAR),
      collectionRate: grossCharges > 0 ? Math.round((payments / grossCharges) * 1000) / 10 : 0,
      denialRate: submittedCount > 0 ? Math.round((denialAgg._count / submittedCount) * 1000) / 10 : 0,
      funnel: {
        totalClaims: claimsAgg._count,
        submitted: submittedCount,
        accepted: acceptedCount,
        paid: paidCount,
      },
    });
  } catch (error) { throw error; }
};

export const getClaimsReport = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const { dateFrom = '', dateTo = '', providerId = '', insuranceId = '' } = c.req.query();
    const where: Record<string, unknown> = { provider: { practiceId } };
    if (providerId) where.providerId = providerId;
    if (insuranceId) where.insuranceId = insuranceId;
    const dateFilter = getDateFilter(dateFrom, dateTo);
    if (dateFilter) where.dateOfService = dateFilter;
    
    const byStatus = await prisma.claim.groupBy({ by: ['status'], where, _count: true, _sum: { billedAmount: true } });
    
    // JS grouping instead of raw SQL
    const allClaims = await prisma.claim.findMany({ where, select: { dateOfService: true, billedAmount: true } });
    const monthlyMap: Record<string, { count: number; billed: number }> = {};
    for (const claim of allClaims) {
      const month = claim.dateOfService.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyMap[month]) monthlyMap[month] = { count: 0, billed: 0 };
      monthlyMap[month].count += 1;
      monthlyMap[month].billed += (claim.billedAmount || 0);
    }
    const monthly = Object.keys(monthlyMap).sort().map(m => ({ month: m, ...monthlyMap[m] }));
    
    return c.json({ byStatus, monthly });
  } catch (error) { throw error; }
};

export const getDenialReport = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const [byReason, byStatus, trend] = await Promise.all([
      prisma.denial.groupBy({ by: ['denialReason'], where: { claim: { provider: { practiceId } } }, _count: true, _sum: { deniedAmount: true, recoveredAmount: true }, orderBy: { _count: { denialReason: 'desc' } }, take: 10 }),
      prisma.denial.groupBy({ by: ['status'], where: { claim: { provider: { practiceId } } }, _count: true, _sum: { deniedAmount: true } }),
      prisma.denial.aggregate({ where: { claim: { provider: { practiceId } } }, _sum: { deniedAmount: true, recoveredAmount: true }, _count: true }),
    ]);
    return c.json({ byReason, byStatus, summary: { total: trend._count, totalDenied: Number(trend._sum.deniedAmount || 0), totalRecovered: Number(trend._sum.recoveredAmount || 0) } });
  } catch (error) { throw error; }
};

export const getARReport = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    // AccountReceivable model does not exist. We compute from claims with patientBalance.
    const unpaidClaims = await prisma.claim.findMany({ 
      where: { provider: { practiceId }, patientBalance: { gt: 0 } },
      select: { dateOfService: true, patientBalance: true }
    });
    let totalOutstanding = 0;
    const bucketMap = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    const now = Date.now();
    for (const c of unpaidClaims) {
      const balance = c.patientBalance || 0;
      totalOutstanding += balance;
      const days = (now - c.dateOfService.getTime()) / (1000 * 3600 * 24);
      if (days <= 30) bucketMap['0-30'] += balance;
      else if (days <= 60) bucketMap['31-60'] += balance;
      else if (days <= 90) bucketMap['61-90'] += balance;
      else bucketMap['90+'] += balance;
    }
    const byBucket = Object.keys(bucketMap).map(k => ({ agingBucket: k, _sum: { balance: bucketMap[k as keyof typeof bucketMap] } }));
    return c.json({ byBucket, totalOutstanding });
  } catch (error) { throw error; }
};

export const getProviderReport = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const providers = await prisma.provider.findMany({ where: { practiceId, isActive: true } });
    const withStats = await Promise.all(providers.map(async (p) => {
      const [claims, revenue, denials, appts] = await Promise.all([
        prisma.claim.count({ where: { providerId: p.id } }),
        prisma.payment.aggregate({ where: { claim: { providerId: p.id } }, _sum: { amount: true } }),
        prisma.claim.count({ where: { providerId: p.id, status: 'DENIED' } }),
        prisma.appointment.count({ where: { providerId: p.id } }),
      ]);
      return { ...p, claims, revenue: Number(revenue._sum.amount || 0), denials, appointments: appts, denialRate: claims > 0 ? Math.round((denials / claims) * 1000) / 10 : 0 };
    }));
    return c.json({ data: withStats });
  } catch (error) { throw error; }
};

export const getInsuranceReport = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const insurances = await prisma.insurance.findMany({ where: { claims: { some: { provider: { practiceId } } } } });
    const withStats = await Promise.all(insurances.map(async (ins) => {
      const [claims, paid, denied, revenue] = await Promise.all([
        prisma.claim.count({ where: { insuranceId: ins.id, provider: { practiceId } } }),
        prisma.claim.count({ where: { insuranceId: ins.id, provider: { practiceId }, status: 'PAID' } }),
        prisma.claim.count({ where: { insuranceId: ins.id, provider: { practiceId }, status: 'DENIED' } }),
        prisma.payment.aggregate({ where: { claim: { insuranceId: ins.id, provider: { practiceId } } }, _sum: { amount: true } }),
      ]);
      return { ...ins, claims, paid, denied, revenue: Number(revenue._sum.amount || 0), denialRate: claims > 0 ? Math.round((denied / claims) * 1000) / 10 : 0 };
    }));
    return c.json({ data: withStats });
  } catch (error) { throw error; }
};

export const getPatientAcquisitionReport = async (c: Context) => {
  try {
    const { practiceId } = c.get('user')!;
    const [bySource, byStatus] = await Promise.all([
      prisma.lead.groupBy({ by: ['source'], where: { practiceId }, _count: true }),
      prisma.lead.groupBy({ by: ['status'], where: { practiceId }, _count: true }),
    ]);
    const allLeads = await prisma.lead.findMany({ where: { practiceId }, select: { createdAt: true } });
    const monthlyMap: Record<string, number> = {};
    for (const lead of allLeads) {
      const m = lead.createdAt.toISOString().substring(0, 7);
      monthlyMap[m] = (monthlyMap[m] || 0) + 1;
    }
    const monthly = Object.keys(monthlyMap).sort().slice(-12).map(m => ({ month: m, count: monthlyMap[m] }));
    const total = byStatus.reduce((s, b) => s + b._count, 0);
    const converted = byStatus.find(s => s.status === 'CONVERTED')?._count || 0;
    return c.json({ bySource, byStatus, monthly, conversionRate: total > 0 ? Math.round((converted / total) * 1000) / 10 : 0 });
  } catch (error) { throw error; }
};
