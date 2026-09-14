import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration...');

  // 1. Create or get the Demo Practice
  let practice = await prisma.practice.findFirst({
    where: { name: 'MedRevFlow Demo Medical Practice' }
  });

  if (!practice) {
    console.log('Creating Demo Practice...');
    practice = await prisma.practice.create({
      data: {
        name: 'MedRevFlow Demo Medical Practice',
        legalName: 'MedRevFlow Demo Medical Practice LLC',
        specialty: 'Family Medicine',
        practiceType: 'Private Practice',
        status: 'ACTIVE',
        address: '123 Health Way',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        email: 'info@demopractice.com',
      }
    });
  }
  
  const practiceId = practice.id;
  console.log(`Using Practice ID: ${practiceId}`);

  // 2. Assign all non-Super Admin users without a practice to this practice
  const updatedUsers = await prisma.user.updateMany({
    where: {
      role: { not: 'SUPER_ADMIN' },
      practiceId: null
    },
    data: { practiceId }
  });
  console.log(`Updated ${updatedUsers.count} users.`);

  // 3. Assign Claims
  const updatedClaims = await prisma.claim.updateMany({
    where: { practiceId: null },
    data: { practiceId }
  });
  console.log(`Updated ${updatedClaims.count} claims.`);

  // 4. Assign Denials
  const updatedDenials = await prisma.denial.updateMany({
    where: { practiceId: null },
    data: { practiceId }
  });
  console.log(`Updated ${updatedDenials.count} denials.`);

  // 5. Assign Appointments
  const updatedAppointments = await prisma.appointment.updateMany({
    where: { practiceId: null },
    data: { practiceId }
  });
  console.log(`Updated ${updatedAppointments.count} appointments.`);

  // 6. Assign Insurances
  const updatedInsurances = await prisma.insurance.updateMany({
    where: { practiceId: null },
    data: { practiceId }
  });
  console.log(`Updated ${updatedInsurances.count} insurances.`);

  // 7. Assign Tasks
  const updatedTasks = await prisma.task.updateMany({
    where: { practiceId: null },
    data: { practiceId }
  });
  console.log(`Updated ${updatedTasks.count} tasks.`);

  // 8. Assign Prior Authorizations
  const updatedPriorAuths = await prisma.priorAuthorization.updateMany({
    where: { practiceId: null },
    data: { practiceId }
  });
  console.log(`Updated ${updatedPriorAuths.count} prior authorizations.`);

  // 9. Assign Messages
  const updatedMessages = await prisma.message.updateMany({
    where: { practiceId: null },
    data: { practiceId }
  });
  console.log(`Updated ${updatedMessages.count} messages.`);

  console.log('Migration completed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
