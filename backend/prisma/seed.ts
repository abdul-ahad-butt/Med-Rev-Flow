import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Synthetic data helpers
const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const DENIAL_REASONS = ['Missing information', 'Authorization required', 'Coding error', 'Eligibility issue'];
const VISIT_TYPES = ['New Patient', 'Follow-up', 'Annual Physical', 'Urgent Care'];
const ICD_CODES = ['Z00.00', 'I10', 'E11.9', 'M54.5', 'J06.9'];
const CPT_CODES = ['99213', '99214', '99215', '99203', '99204'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(daysAgo: number, daysFrom = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - randInt(daysFrom, daysAgo));
  return d;
}
function randPhone(): string { return `(${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`; }

async function main() {
  console.log('🌱 Seeding MedRevFlow database...');

  // Clear existing data (if needed, but skipping TRUNCATE for SQLite)
  
  // ── Practice ─────────────────────────────────────────────────────────────
  const practice = await prisma.practice.create({
    data: {
      name: 'Sunrise Family Medical Center',
      npi: '1234567890',
      taxId: '12-3456789',
      phone: '(305) 555-0100',
      email: 'admin@sunrisemedical.com',
      website: 'https://sunrisemedical.com',
      address: '8500 NW 53rd Street',
      city: 'Miami',
      state: 'FL',
      zipCode: '33166',
    },
  });
  console.log('✅ Practice created');

  // ── Insurances ────────────────────────────────────────────────────────────
  const insurances = await Promise.all([
    prisma.insurance.create({ data: { name: 'BlueCross BlueShield', payerId: 'BCBS001', phone: '(800) 555-1001' } }),
    prisma.insurance.create({ data: { name: 'UnitedHealthcare', payerId: 'UHC001', phone: '(800) 555-1002' } }),
    prisma.insurance.create({ data: { name: 'Aetna', payerId: 'AET001', phone: '(800) 555-1003' } }),
  ]);
  console.log('✅ 3 insurances created');

  // ── Users ─────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Demo@1234', 12);
  
  const users = await Promise.all([
    prisma.user.create({ data: { practiceId: practice.id, email: 'owner@demo.medrevflow.com', passwordHash: hashedPassword, firstName: 'Sarah', lastName: 'Smith', role: 'ADMIN' } }),
    prisma.user.create({ data: { practiceId: practice.id, email: 'manager@demo.medrevflow.com', passwordHash: hashedPassword, firstName: 'David', lastName: 'Johnson', role: 'ADMIN' } }),
    prisma.user.create({ data: { practiceId: practice.id, email: 'billing@demo.medrevflow.com', passwordHash: hashedPassword, firstName: 'Maria', lastName: 'Rodriguez', role: 'BILLING' } }),
    prisma.user.create({ data: { practiceId: practice.id, email: 'frontdesk@demo.medrevflow.com', passwordHash: hashedPassword, firstName: 'Jennifer', lastName: 'Wilson', role: 'STAFF' } }),
    prisma.user.create({ data: { practiceId: practice.id, email: 'admin@medrevflow.demo', passwordHash: await bcrypt.hash('admin123', 12), firstName: 'Admin', lastName: 'User', role: 'ADMIN' } }),
    // Real-time Super Admin
    prisma.user.create({ data: { email: 'abdulahadbutt420@gmail.com', passwordHash: await bcrypt.hash('Qaz123$$', 12), firstName: 'Abdul Ahad', lastName: 'Butt', role: 'SUPER_ADMIN' } }),
  ]);
  console.log('✅ 6 users created');
  const [owner, manager, billing, frontDesk] = users;

  // ── Providers ─────────────────────────────────────────────────────────────
  const providerData = [
    { firstName: 'Michael', lastName: 'Chang', specialty: 'Family Medicine', npi: '1111111111' },
    { firstName: 'Amanda', lastName: 'Foster', specialty: 'Internal Medicine', npi: '2222222222' },
  ];
  const providers = await Promise.all(providerData.map(p =>
    prisma.provider.create({ data: { ...p, practiceId: practice.id } })
  ));
  console.log('✅ 2 providers created');

  // ── Patients (20) ────────────────────────────────────────────────────────
  const patientList = [];
  for (let i = 0; i < 20; i++) {
    const firstName = rand(FIRST_NAMES);
    const lastName = rand(LAST_NAMES);
    patientList.push({
      practiceId: practice.id,
      firstName,
      lastName,
      dateOfBirth: new Date(Date.now() - randInt(18, 85) * 365 * 24 * 60 * 60 * 1000),
      gender: rand(['MALE', 'FEMALE']),
      phone: randPhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
      addressLine1: `${randInt(100, 9999)} Main St`,
      city: 'Miami',
      state: 'FL',
      zipCode: `331${randInt(10, 99)}`,
      memberId: `MBR${randInt(100000, 999999)}`,
      groupNumber: `GRP${randInt(1000, 9999)}`,
    });
  }
  await prisma.patient.createMany({ data: patientList });
  const allPatients = await prisma.patient.findMany();
  console.log('✅ 20 patients created');

  // ── Appointments (30) ────────────────────────────────────────────────────
  const apptStatuses = ['COMPLETED', 'SCHEDULED', 'CONFIRMED', 'CANCELED', 'NO_SHOW'];
  for (let i = 0; i < 30; i++) {
    const patient = rand(allPatients);
    const provider = rand(providers);
    const apptDate = i < 15 ? randDate(90, 0) : new Date(Date.now() + randInt(1, 30) * 24 * 60 * 60 * 1000);
    const status = i < 15 ? 'COMPLETED' : rand(['SCHEDULED', 'CONFIRMED']);
    
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        providerId: provider.id,
        startTime: apptDate,
        endTime: new Date(apptDate.getTime() + 30 * 60000),
        visitType: rand(VISIT_TYPES),
        status,
        notes: Math.random() > 0.7 ? `Patient notes for visit ${i + 1}` : null,
      },
    });
  }
  console.log('✅ 30 appointments created');

  // ── Claims (30) with payments and denials ──────────────────────────────
  const claimStatuses = ['PAID', 'PENDING', 'DENIED', 'SUBMITTED', 'REJECTED'];
  
  for (let i = 0; i < 30; i++) {
    const patient = rand(allPatients);
    const provider = rand(providers);
    const ins = rand(insurances);
    const dos = randDate(365, 0);
    const billedAmount = randInt(150, 4500);
    const status = rand(claimStatuses);
    const allowedAmount = Math.round(billedAmount * (0.6 + Math.random() * 0.3));
    const paidAmount = status === 'PAID' ? Math.round(allowedAmount * (0.7 + Math.random() * 0.25)) : 0;
    const patientBalance = status === 'PAID' ? Math.round(billedAmount * 0.15) : 0;

    const claim = await prisma.claim.create({
      data: {
        claimNumber: `CLM-${String(10000 + i).padStart(8, '0')}`,
        patientId: patient.id,
        providerId: provider.id,
        insuranceId: ins.id,
        dateOfService: dos,
        submittedDate: new Date(dos.getTime() + randInt(1, 5) * 24 * 60 * 60 * 1000),
        billedAmount,
        allowedAmount,
        paidAmount,
        patientBalance,
        status,
        icdCodes: JSON.stringify([rand(ICD_CODES), rand(ICD_CODES)]),
        cptCodes: JSON.stringify([rand(CPT_CODES)]),
        notes: Math.random() > 0.7 ? `Claim note for ${i + 1}` : null,
      },
    });

    // Status history
    await prisma.claimStatusHistory.create({ data: { claimId: claim.id, toStatus: 'SUBMITTED', notes: 'Initial submission', changedAt: new Date(dos.getTime() + 2 * 24 * 60 * 60 * 1000) } });
    if (status !== 'SUBMITTED') {
      await prisma.claimStatusHistory.create({ data: { claimId: claim.id, fromStatus: 'SUBMITTED', toStatus: status, changedAt: new Date(dos.getTime() + randInt(5, 30) * 24 * 60 * 60 * 1000) } });
    }

    // Payments for paid claims
    if (status === 'PAID' && paidAmount > 0) {
      await prisma.payment.create({
        data: {
          claimId: claim.id,
          paidDate: new Date(dos.getTime() + randInt(14, 45) * 24 * 60 * 60 * 1000),
          amount: paidAmount,
          adjustmentAmount: allowedAmount - paidAmount,
          paymentMethod: rand(['EFT', 'CHECK']),
          eraNumber: `ERA${randInt(10000, 99999)}`,
        },
      });
    }

    // Denials for denied claims
    if (status === 'DENIED' || status === 'REJECTED') {
      const denial = await prisma.denial.create({
        data: {
          claimId: claim.id,
          denialDate: randDate(10, 0),
          denialReason: rand(DENIAL_REASONS),
          denialCode: `D${randInt(100, 999)}`,
          deniedAmount: billedAmount,
          status: rand(['NEW', 'UNDER_REVIEW', 'APPEAL_SUBMITTED']),
          priority: rand(['LOW', 'MEDIUM', 'HIGH']),
          assignedToId: billing.id,
          followUpDate: new Date(Date.now() + randInt(1, 30) * 24 * 60 * 60 * 1000),
        },
      });

      // Add denial note
      if (Math.random() > 0.5) {
        await prisma.note.create({ data: { denialId: denial.id, userId: billing.id, content: `Reviewing denial.` } });
      }

      // Add appeal for some
      if (denial.status === 'APPEAL_SUBMITTED' || Math.random() > 0.7) {
        await prisma.appeal.create({
          data: {
            denialId: denial.id,
            submittedDate: new Date(Date.now() - randInt(5, 60) * 24 * 60 * 60 * 1000),
            reason: `Appeal for denial`,
            outcome: Math.random() > 0.5 ? 'Approved' : null,
          },
        });
      }
    }
  }
  console.log('✅ 30 claims created with payments and denials');

  console.log('\n🎉 Seed complete! Here are your demo credentials:');
  console.log('─────────────────────────────────────────────────');
  console.log('Owner:     owner@demo.medrevflow.com   / Demo@1234');
  console.log('Manager:   manager@demo.medrevflow.com / Demo@1234');
  console.log('Billing:   billing@demo.medrevflow.com / Demo@1234');
  console.log('Front Desk: frontdesk@demo.medrevflow.com / Demo@1234');
  console.log('─────────────────────────────────────────────────');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
