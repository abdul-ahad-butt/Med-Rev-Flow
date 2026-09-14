const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Setting isDemo flags...');
  const emails = [
    'owner@demo.medrevflow.com',
    'manager@demo.medrevflow.com',
    'billing@demo.medrevflow.com',
    'frontdesk@demo.medrevflow.com',
    'admin@medrevflow.demo'
  ];
  const users = await prisma.user.findMany({ where: { email: { in: emails } } });
  
  if (users.length > 0) {
    const practiceId = users[0].practiceId;
    await prisma.practice.update({
      where: { id: practiceId },
      data: { isDemo: true }
    });
    console.log(`Updated Practice ${practiceId} to isDemo = true`);
  }
  
  const updatedUsers = await prisma.user.updateMany({
    where: { email: { in: emails } },
    data: { isDemo: true }
  });
  console.log(`Updated ${updatedUsers.count} demo users to isDemo = true`);
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
