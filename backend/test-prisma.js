const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const practiceId = 'new-practice';
  console.log('Testing dashboard queries for empty practice:', practiceId);
  try {
    const claims = await prisma.claim.groupBy({
      by: ['status'],
      where: { provider: { practiceId } },
      _count: { status: true },
      _sum: { billedAmount: true },
    });
    console.log('Claims:', claims);

    const totalRevenueResult = await prisma.payment.aggregate({
      where: { claim: { provider: { practiceId } } },
      _sum: { amount: true },
    });
    console.log('totalRevenueResult:', totalRevenueResult);

    const billedAgg = await prisma.claim.aggregate({
      where: { provider: { practiceId } },
      _sum: { billedAmount: true, paidAmount: true },
    });
    console.log('billedAgg:', billedAgg);

    const collectionRate = billedAgg?._sum?.billedAmount
      ? (Number(billedAgg._sum.paidAmount || 0) / Number(billedAgg._sum.billedAmount)) * 100
      : 0;
    console.log('collectionRate:', collectionRate);

    const denialAgg = await prisma.denial.aggregate({
      where: { claim: { provider: { practiceId } } },
      _sum: { deniedAmount: true, recoveredAmount: true },
    });
    console.log('denialAgg:', denialAgg);

    const ar0_30 = await prisma.claim.aggregate({
      where: {
        provider: { practiceId },
        status: { in: ['SUBMITTED', 'PENDING'] },
      },
      _sum: { billedAmount: true },
    });
    console.log('ar0_30:', ar0_30);
  } catch (e) {
    console.error('Error in Claims:', e);
  }
}
test().finally(() => prisma.$disconnect());
