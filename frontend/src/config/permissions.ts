export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRACTICE_OWNER'
  | 'PRACTICE_MANAGER'
  | 'BILLING_STAFF'
  | 'FRONT_DESK'
  | 'MARKETING_MANAGER'
  | 'VIEWER';

export enum Permission {
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_CLAIMS = 'VIEW_CLAIMS',
  CREATE_CLAIM = 'CREATE_CLAIM',
  EDIT_CLAIM = 'EDIT_CLAIM',
  VIEW_DENIALS = 'VIEW_DENIALS',
  MANAGE_DENIALS = 'MANAGE_DENIALS',
  VIEW_AR = 'VIEW_AR',
  MANAGE_AR = 'MANAGE_AR',
  VIEW_PATIENTS = 'VIEW_PATIENTS',
  CREATE_PATIENT = 'CREATE_PATIENT',
  EDIT_PATIENT = 'EDIT_PATIENT',
  VIEW_APPOINTMENTS = 'VIEW_APPOINTMENTS',
  CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
  EDIT_APPOINTMENT = 'EDIT_APPOINTMENT',
  VIEW_PROVIDERS = 'VIEW_PROVIDERS',
  MANAGE_PROVIDERS = 'MANAGE_PROVIDERS',
  VIEW_INSURANCE = 'VIEW_INSURANCE',
  VIEW_MARKETING = 'VIEW_MARKETING',
  MANAGE_MARKETING = 'MANAGE_MARKETING',
  VIEW_LEADS = 'VIEW_LEADS',
  MANAGE_LEADS = 'MANAGE_LEADS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  VIEW_TASKS = 'VIEW_TASKS',
  MANAGE_TASKS = 'MANAGE_TASKS',
  VIEW_MESSAGES = 'VIEW_MESSAGES',
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG',
  MANAGE_PRACTICE_SETTINGS = 'MANAGE_PRACTICE_SETTINGS',
  PLATFORM_MANAGE_PRACTICES = 'PLATFORM_MANAGE_PRACTICES',
  PLATFORM_MANAGE_USERS = 'PLATFORM_MANAGE_USERS',
  PLATFORM_VIEW_ANALYTICS = 'PLATFORM_VIEW_ANALYTICS'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    Permission.PLATFORM_MANAGE_PRACTICES,
    Permission.PLATFORM_MANAGE_USERS,
    Permission.PLATFORM_VIEW_ANALYTICS,
    Permission.VIEW_AUDIT_LOG
  ],
  PRACTICE_OWNER: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CLAIMS, Permission.CREATE_CLAIM, Permission.EDIT_CLAIM,
    Permission.VIEW_DENIALS, Permission.MANAGE_DENIALS,
    Permission.VIEW_AR, Permission.MANAGE_AR,
    Permission.VIEW_PATIENTS, Permission.CREATE_PATIENT, Permission.EDIT_PATIENT,
    Permission.VIEW_APPOINTMENTS, Permission.CREATE_APPOINTMENT, Permission.EDIT_APPOINTMENT,
    Permission.VIEW_PROVIDERS, Permission.MANAGE_PROVIDERS,
    Permission.VIEW_INSURANCE,
    Permission.VIEW_MARKETING, Permission.MANAGE_MARKETING,
    Permission.VIEW_LEADS, Permission.MANAGE_LEADS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_TASKS, Permission.MANAGE_TASKS,
    Permission.VIEW_MESSAGES,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOG,
    Permission.MANAGE_PRACTICE_SETTINGS
  ],
  PRACTICE_MANAGER: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CLAIMS, Permission.CREATE_CLAIM, Permission.EDIT_CLAIM,
    Permission.VIEW_DENIALS, Permission.MANAGE_DENIALS,
    Permission.VIEW_AR, Permission.MANAGE_AR,
    Permission.VIEW_PATIENTS, Permission.CREATE_PATIENT, Permission.EDIT_PATIENT,
    Permission.VIEW_APPOINTMENTS, Permission.CREATE_APPOINTMENT, Permission.EDIT_APPOINTMENT,
    Permission.VIEW_PROVIDERS, Permission.MANAGE_PROVIDERS,
    Permission.VIEW_INSURANCE,
    Permission.VIEW_REPORTS,
    Permission.VIEW_TASKS, Permission.MANAGE_TASKS,
    Permission.VIEW_MESSAGES,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOG
  ],
  BILLING_STAFF: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CLAIMS, Permission.CREATE_CLAIM, Permission.EDIT_CLAIM,
    Permission.VIEW_DENIALS, Permission.MANAGE_DENIALS,
    Permission.VIEW_AR, Permission.MANAGE_AR,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_INSURANCE,
    Permission.VIEW_TASKS,
    Permission.VIEW_MESSAGES
  ],
  FRONT_DESK: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PATIENTS, Permission.CREATE_PATIENT, Permission.EDIT_PATIENT,
    Permission.VIEW_APPOINTMENTS, Permission.CREATE_APPOINTMENT, Permission.EDIT_APPOINTMENT,
    Permission.VIEW_TASKS,
    Permission.VIEW_MESSAGES,
    Permission.VIEW_INSURANCE
  ],
  MARKETING_MANAGER: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MARKETING, Permission.MANAGE_MARKETING,
    Permission.VIEW_LEADS, Permission.MANAGE_LEADS,
    Permission.VIEW_TASKS,
    Permission.VIEW_MESSAGES
  ],
  VIEWER: [
    Permission.VIEW_DASHBOARD
  ]
};

export function hasPermission(userRole: string | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  const role = userRole as UserRole;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getDefaultRouteForRole(userRole: string | undefined): string {
  switch (userRole) {
    case 'MARKETING_MANAGER':
      return '/app/marketing';
    case 'FRONT_DESK':
      return '/app/appointments';
    case 'BILLING_STAFF':
      return '/app/claims'; // Billing staff mostly deal with claims/denials
    case 'SUPER_ADMIN':
    case 'PRACTICE_OWNER':
    case 'PRACTICE_MANAGER':
    case 'VIEWER':
    default:
      return '/app/dashboard';
  }
}
