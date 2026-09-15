import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Migrating legacy roles...');
  
  const users = await prisma.user.findMany();
  for (const user of users) {
    let newRole = user.role;
    if (user.role === 'ADMIN') {
      if (user.email.includes('owner')) {
        newRole = 'PRACTICE_OWNER';
      } else if (user.email.includes('admin')) {
        newRole = 'SUPER_ADMIN';
      } else {
        newRole = 'PRACTICE_MANAGER';
      }
    } else if (user.role === 'BILLING') {
      newRole = 'BILLING_STAFF';
    } else if (user.role === 'STAFF') {
      newRole = 'FRONT_DESK';
    }
    
    if (newRole !== user.role) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
      });
      console.log(`Updated ${user.email}: ${user.role} -> ${newRole}`);
    }
  }
  
  console.log('Migration complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
