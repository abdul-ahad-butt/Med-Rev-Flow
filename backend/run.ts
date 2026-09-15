import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ select: { email: true, role: true, mustChangePassword: true, isActive: true } });
  console.table(users);
}
run();
