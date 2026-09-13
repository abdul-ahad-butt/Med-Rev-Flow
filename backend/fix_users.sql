
UPDATE "User" SET role = 'PRACTICE_OWNER', passwordHash = '$2a$10$ZYtxs.YqPY1sFCQs4T1bq.z0v6oP2Xhyn8uRdS2X2xtRwE2486WTO' WHERE email = 'owner@demo.medrevflow.com';
UPDATE "User" SET role = 'PRACTICE_MANAGER', passwordHash = '$2a$10$ZYtxs.YqPY1sFCQs4T1bq.z0v6oP2Xhyn8uRdS2X2xtRwE2486WTO' WHERE email = 'manager@demo.medrevflow.com';
UPDATE "User" SET role = 'BILLING_STAFF', passwordHash = '$2a$10$ZYtxs.YqPY1sFCQs4T1bq.z0v6oP2Xhyn8uRdS2X2xtRwE2486WTO' WHERE email = 'billing@demo.medrevflow.com';
UPDATE "User" SET role = 'FRONT_DESK', passwordHash = '$2a$10$ZYtxs.YqPY1sFCQs4T1bq.z0v6oP2Xhyn8uRdS2X2xtRwE2486WTO' WHERE email = 'frontdesk@demo.medrevflow.com';
UPDATE "User" SET role = 'SUPER_ADMIN', passwordHash = '$2a$10$ZYtxs.YqPY1sFCQs4T1bq.z0v6oP2Xhyn8uRdS2X2xtRwE2486WTO' WHERE email = 'admin@medrevflow.demo';

-- Also insert admin@medrevflow.com if missing, or update it
INSERT INTO "User" ("id", "practiceId", "email", "passwordHash", "firstName", "lastName", "role", "isActive", "createdAt", "updatedAt")
SELECT 
  'super-admin-id-123', 
  "practiceId", 
  'admin@medrevflow.com', 
  '$2a$10$ulG33vf9bXP12PnYEw7oxePnlUs3yF6.ZVJKz.ZhDXxA7kO7LoFKi', 
  'Super', 
  'Admin', 
  'SUPER_ADMIN', 
  1, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
FROM "User" 
WHERE email = 'owner@demo.medrevflow.com' 
ON CONFLICT (email) DO UPDATE SET passwordHash = '$2a$10$ulG33vf9bXP12PnYEw7oxePnlUs3yF6.ZVJKz.ZhDXxA7kO7LoFKi', role = 'SUPER_ADMIN';
  