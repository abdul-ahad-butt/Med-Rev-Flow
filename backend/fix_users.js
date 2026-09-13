const bcrypt = require('bcryptjs');
const fs = require('fs');

async function generateSql() {
  const hash1 = await bcrypt.hash('Demo@1234', 10);
  const hash2 = await bcrypt.hash('Demo1234!', 10);

  const sql = `
UPDATE "User" SET role = 'PRACTICE_OWNER', passwordHash = '${hash1}' WHERE email = 'owner@demo.medrevflow.com';
UPDATE "User" SET role = 'PRACTICE_MANAGER', passwordHash = '${hash1}' WHERE email = 'manager@demo.medrevflow.com';
UPDATE "User" SET role = 'BILLING_STAFF', passwordHash = '${hash1}' WHERE email = 'billing@demo.medrevflow.com';
UPDATE "User" SET role = 'FRONT_DESK', passwordHash = '${hash1}' WHERE email = 'frontdesk@demo.medrevflow.com';
UPDATE "User" SET role = 'SUPER_ADMIN', passwordHash = '${hash1}' WHERE email = 'admin@medrevflow.demo';

-- Also insert admin@medrevflow.com if missing, or update it
INSERT INTO "User" ("id", "practiceId", "email", "passwordHash", "firstName", "lastName", "role", "isActive", "createdAt", "updatedAt")
SELECT 
  'super-admin-id-123', 
  "practiceId", 
  'admin@medrevflow.com', 
  '${hash2}', 
  'Super', 
  'Admin', 
  'SUPER_ADMIN', 
  1, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
FROM "User" 
WHERE email = 'owner@demo.medrevflow.com' 
ON CONFLICT (email) DO UPDATE SET passwordHash = '${hash2}', role = 'SUPER_ADMIN';
  `;

  fs.writeFileSync('fix_users.sql', sql);
  console.log('fix_users.sql generated.');
}

generateSql().catch(console.error);
