/**
 * App constants – no dummy data. Enums from backend can be added here when available.
 */

export const USER_TYPES = {
  COMPANY: 'Company',
  SERVICE_CENTER: 'ServiceCenter',
};

export const ROLES = ['Admin', 'Supervisor', 'Employee'];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  SIGN_UP_NORMAL: '/sign-up/normal',
  SIGN_UP_SERVICE_CENTER: '/sign-up/service-center',
  PORTAL: '/portal',
  PORTAL_DASHBOARD: '/portal/dashboard',
  PORTAL_COMPANY_DASHBOARD: '/portal/company/dashboard',
  PORTAL_SERVICE_CENTER_DASHBOARD: '/portal/service-center/dashboard',
  PORTAL_TEST_PERMISSION_ROLE: '/portal/test-permission-role',
  SUPER_ADMIN: '/superadmin',
  SUPER_ADMIN_DASHBOARD: '/superadmin/dashboard',
  SUPER_ADMIN_LOCATIONS: '/superadmin/locations',
  SUPER_ADMIN_SHIFTS: '/superadmin/shifts',
  SUPER_ADMIN_USERS: '/superadmin/users',
  SUPER_ADMIN_PERMISSIONS: '/superadmin/permissions',
  SUPER_ADMIN_GROUPS: '/superadmin/groups',
  FORBIDDEN: '/403',
};

/** Permission names (must match backend). */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_ASSIGN_ROLE: 'users.assign_role',
  USERS_ASSIGN_PERMISSIONS: 'users.assign_permissions',
  LOCATIONS_VIEW: 'locations.view',
  LOCATIONS_MANAGE: 'locations.manage',
  SHIFTS_VIEW: 'shifts.view',
  SHIFTS_MANAGE: 'shifts.manage',
  PERMISSIONS_VIEW: 'permissions.view',
  PERMISSIONS_MANAGE: 'permissions.manage',
  TEST_PERMISSION_ROLE: 'test.permission_role',
};

/** Permission name options for dropdown (value + label). */
export const PERMISSION_NAME_OPTIONS = Object.entries(PERMISSIONS).map(([key, value]) => ({
  value,
  label: value,
}));

/** Map permission name -> page/module label (for "pages this user can see"). */
export const PERMISSION_TO_PAGE_LABEL = {
  'dashboard.view': 'Portal — Dashboard',
  'users.view': 'Super Admin — Users',
  'users.create': 'Super Admin — Create User',
  'users.update': 'Super Admin — Update User',
  'users.delete': 'Super Admin — Delete User',
  'users.assign_role': 'Super Admin — Assign Role',
  'users.assign_permissions': 'Super Admin — Assign Permissions',
  'locations.view': 'Super Admin — Locations (view)',
  'locations.manage': 'Super Admin — Locations (manage)',
  'shifts.view': 'Super Admin — Shifts (view)',
  'shifts.manage': 'Super Admin — Shifts (manage)',
  'permissions.view': 'Super Admin — Permissions (view)',
  'permissions.manage': 'Super Admin — Permissions (manage)',
  'test.permission_role': 'Portal — Test Permission and Role',
};

/** Module/Page options for permission dropdown. */
export const PERMISSION_MODULE_OPTIONS = [
  { value: 'Portal', label: 'Portal' },
  { value: 'Super Admin', label: 'Super Admin' },
  { value: 'Users', label: 'Users' },
  { value: 'Locations', label: 'Locations' },
  { value: 'Shifts', label: 'Shifts' },
  { value: 'Permissions', label: 'Permissions' },
];

/** Storage key for auth token (sessionStorage for security; no long-lived localStorage) */
export const AUTH_TOKEN_KEY = 'kamel_auth_token';

/** Default language */
export const DEFAULT_LANG = 'ar';

export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
];
