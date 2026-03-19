export const USER_TYPES = {
  COMPANY: 'Company',
  SERVICE_CENTER: 'ServiceCenter',
  SUPER_ADMIN: 'SuperAdmin',
};

export const ROLES = ['Supervisor', 'EmpRead', 'EmpManage'];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  SIGN_UP_NORMAL: '/sign-up/normal',
  SIGN_UP_SERVICE_CENTER: '/sign-up/service-center',
  PORTAL: '/portal',
  PORTAL_HR_DASHBOARD: '/portal/hr/dashboard',
  PORTAL_HR_USERS: '/portal/hr/users',
  PORTAL_HR_SUPERVISORS: '/portal/hr/supervisors',
  PORTAL_HR_ATTENDANCE: '/portal/hr/attendance',
  PORTAL_COMPANY_DASHBOARD: '/portal/company/dashboard',
  PORTAL_COMPANY_NOTIFICATIONS: '/portal/company/notifications',
  PORTAL_COMPANY_EMPLOYEES: '/portal/company/employees',
  PORTAL_COMPANY_ATTENDANCE_DEPARTURE: '/portal/company/attendance-departure',
  PORTAL_SERVICE_CENTER_DASHBOARD: '/portal/service-center/dashboard',
  PORTAL_SERVICE_CENTER_NOTIFICATIONS: '/portal/service-center/notifications',
  PORTAL_RECEPTION_DASHBOARD: '/portal/reception/dashboard',
  SUPER_ADMIN: '/superadmin',
  SUPER_ADMIN_DASHBOARD: '/superadmin/dashboard',
  SUPER_ADMIN_ACCESS: '/superadmin/access',
  SUPER_ADMIN_ASSIGN_SUPERVISOR: '/superadmin/assign-supervisor',
  SUPER_ADMIN_SUPERVISORS: '/superadmin/supervisors',
  SUPER_ADMIN_LOCATIONS: '/superadmin/locations',
  SUPER_ADMIN_SHIFTS: '/superadmin/shifts',
  /** Super Admin: received notifications (inbox). */
  SUPER_ADMIN_NOTIFICATION_INBOX: '/superadmin/notification-inbox',
  /** Super Admin: broadcast / send to users. */
  SUPER_ADMIN_NOTIFICATIONS: '/superadmin/notifications',
  FORBIDDEN: '/403',
};

// Access control codes (stored in DB). Keep stable.
export const ACCESS_TREE = [
  {
    key: 'module.portal',
    titleAr: 'البوابة',
    titleEn: 'Portal',
    children: [
      { key: 'portal.company.dashboard', titleAr: 'لوحة الشركة', titleEn: 'Company Dashboard' },
      { key: 'portal.servicecenter.dashboard', titleAr: 'لوحة مركز الخدمة', titleEn: 'Service Center Dashboard' },
    ],
  },
  {
    key: 'module.hr',
    titleAr: 'الموارد البشرية',
    titleEn: 'HR',
    children: [
      { key: 'hr.dashboard', titleAr: 'لوحة الموارد البشرية', titleEn: 'HR Dashboard' },
      { key: 'hr.users', titleAr: 'مستخدمو النظام (HR)', titleEn: 'System Users (HR)' },
    ],
  },
  {
    key: 'module.reception',
    titleAr: 'الاستقبال',
    titleEn: 'Reception',
    children: [
      { key: 'reception.dashboard', titleAr: 'لوحة الاستقبال', titleEn: 'Reception Dashboard' },
    ],
  },
];

export const AUTH_TOKEN_KEY = 'kamel_auth_token';

export const DEFAULT_LANG = 'ar';

export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
];
