import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const practice = await prisma.practice.findFirst();
  if (!practice) {
    console.log('No practice found, please seed first');
    return;
  }
  
  await prisma.campaign.createMany({
    data: [
      { practiceId: practice.id, name: 'Google Ads Q3', type: 'PPC', status: 'Active', budget: '$5,000/mo', clicks: 1245, cost: '$3,120', cpa: '$45' },
      { practiceId: practice.id, name: 'Facebook Retargeting', type: 'Social', status: 'Active', budget: '$2,000/mo', clicks: 830, cost: '$1,200', cpa: '$35' }
    ]
  });

  await prisma.seoKeyword.createMany({
    data: [
      { practiceId: practice.id, term: 'cardiology clinic near me', position: 3, volume: '2.4k', trend: 2 },
      { practiceId: practice.id, term: 'heart specialist', position: 5, volume: '1.2k', trend: -1 },
      { practiceId: practice.id, term: 'pediatric cardiologist', position: 12, volume: '800', trend: 5 }
    ]
  });
  console.log('Marketing data seeded successfully');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
