const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../src/routes');

const replacements = [
  {
    file: 'claims.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF'\)/g, to: 'requirePermission(Permission.VIEW_CLAIMS)' },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER'\)/g, to: 'requirePermission(Permission.EDIT_CLAIM)' },
    ]
  },
  {
    file: 'admin.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('SUPER_ADMIN'\)/g, to: 'requirePermission(Permission.PLATFORM_MANAGE_PRACTICES)' },
    ]
  },
  {
    file: 'appointments.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'FRONT_DESK'\)/g, to: 'requirePermission(Permission.VIEW_APPOINTMENTS)' },
    ]
  },
  {
    file: 'ar.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF'\)/g, to: 'requirePermission(Permission.VIEW_AR)' },
    ]
  },
  {
    file: 'audit.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'SUPER_ADMIN'\)/g, to: 'requirePermission(Permission.VIEW_AUDIT_LOG)' },
    ]
  },
  {
    file: 'contact.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('SUPER_ADMIN', 'PRACTICE_OWNER'\)/g, to: 'requirePermission(Permission.PLATFORM_MANAGE_USERS)' },
    ]
  },
  {
    file: 'denials.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF'\)/g, to: 'requirePermission(Permission.VIEW_DENIALS)' },
    ]
  },
  {
    file: 'insurance.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF', 'FRONT_DESK'\)/g, to: 'requirePermission(Permission.VIEW_INSURANCE)' },
    ]
  },
  {
    file: 'leads.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER'\)/g, to: 'requirePermission(Permission.VIEW_LEADS)' },
    ]
  },
  {
    file: 'messages.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF', 'FRONT_DESK'\)/g, to: 'requirePermission(Permission.VIEW_MESSAGES)' },
    ]
  },
  {
    file: 'patients.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF', 'FRONT_DESK'\)/g, to: 'requirePermission(Permission.VIEW_PATIENTS)' },
    ]
  },
  {
    file: 'priorAuth.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF', 'FRONT_DESK'\)/g, to: 'requirePermission(Permission.VIEW_PATIENTS)' },
    ]
  },
  {
    file: 'providers.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF'\)/g, to: 'requirePermission(Permission.VIEW_PROVIDERS)' },
    ]
  },
  {
    file: 'reports.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF'\)/g, to: 'requirePermission(Permission.VIEW_REPORTS)' },
    ]
  },
  {
    file: 'seo.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER'\)/g, to: 'requirePermission(Permission.VIEW_MARKETING)' },
    ]
  },
  {
    file: 'settings.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER'\)/g, to: 'requirePermission(Permission.MANAGE_PRACTICE_SETTINGS)' },
      { from: /authorize\('PRACTICE_OWNER'\)/g, to: 'requirePermission(Permission.MANAGE_USERS)' },
    ]
  },
  {
    file: 'tasks.routes.ts',
    replaces: [
      { from: /import \{ authenticate, authorize \} from '\.\.\/middleware\/auth';/, to: "import { authenticate, requirePermission } from '../middleware/auth';\nimport { Permission } from '../middleware/permissions';" },
      { from: /authorize\('PRACTICE_OWNER', 'PRACTICE_MANAGER', 'BILLING_STAFF', 'FRONT_DESK'\)/g, to: 'requirePermission(Permission.VIEW_TASKS)' },
    ]
  }
];

replacements.forEach(rep => {
  const filePath = path.join(routesDir, rep.file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    rep.replaces.forEach(r => {
      content = content.replace(r.from, r.to);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + rep.file);
  }
});
