export const USER_TYPES = {
  COMPANY: 'Company',
  SERVICE_CENTER: 'ServiceCenter',
  SUPER_ADMIN: 'SuperAdmin',
};

export const ROLES = ['Supervisor', 'EmpRead', 'EmpManage'];

/** Roles a company supervisor may assign to direct reports (not Supervisor). */
export const SUPERVISOR_ASSIGNABLE_ROLES = ['EmpRead', 'EmpManage'];

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
  PORTAL_HR_SEND_NOTIFICATIONS: '/portal/hr/send-notifications',
  /** HR: approve self-service sign-ups (company vs service-center path). */
  PORTAL_COMPANY_HR_PENDING: '/portal/company/hr/pending-approvals',
  PORTAL_SERVICE_CENTER_HR_PENDING: '/portal/service-center/hr/pending-approvals',
  PORTAL_COMPANY_DASHBOARD: '/portal/company/dashboard',
  PORTAL_COMPANY_NOTIFICATIONS: '/portal/company/notifications',
  PORTAL_COMPANY_EMPLOYEES: '/portal/company/employees',
  /** Company supervisor: team attendance (read-only). */
  PORTAL_COMPANY_SUPERVISOR_ATTENDANCE: '/portal/company/supervisor/attendance',
  PORTAL_COMPANY_ATTENDANCE_DEPARTURE: '/portal/company/attendance-departure',
  /** Company supervisor: notify direct employees + schedule */
  PORTAL_COMPANY_SEND_NOTIFICATIONS: '/portal/company/send-notifications',
  /** Company supervisor: pending sign-ups for employees who chose this supervisor */
  PORTAL_COMPANY_SUPERVISOR_PENDING: '/portal/company/supervisor/pending-approvals',
  PORTAL_SERVICE_CENTER_DASHBOARD: '/portal/service-center/dashboard',
  PORTAL_SERVICE_CENTER_NOTIFICATIONS: '/portal/service-center/notifications',
  PORTAL_RECEPTION_DASHBOARD: '/portal/reception/dashboard',
  PORTAL_RECEPTION_SERVICE_CENTERS: '/portal/reception/service-centers',
  PORTAL_RECEPTION_NATIONALITIES: '/portal/reception/nationalities',
  SUPER_ADMIN: '/superadmin',
  SUPER_ADMIN_DASHBOARD: '/superadmin/dashboard',
  SUPER_ADMIN_ACCESS: '/superadmin/access',
  SUPER_ADMIN_ASSIGN_SUPERVISOR: '/superadmin/assign-supervisor',
  SUPER_ADMIN_SUPERVISORS: '/superadmin/supervisors',
  SUPER_ADMIN_LOCATIONS: '/superadmin/locations',
  SUPER_ADMIN_SHIFTS: '/superadmin/shifts',
  SUPER_ADMIN_SERVICE_CENTERS: '/superadmin/service-centers',
  /** Super Admin: received notifications (inbox). */
  SUPER_ADMIN_NOTIFICATION_INBOX: '/superadmin/notification-inbox',
  /** Super Admin: broadcast / send to users. */
  SUPER_ADMIN_NOTIFICATIONS: '/superadmin/notifications',
  FORBIDDEN: '/403',
};

/**
 * Access grant codes for Super Admin → Access Control (`/superadmin/access`).
 * Leaf `key` values are stored in the DB; keep them stable. Optional `path` is for display only (must match the app route).
 * When adding a new screen: add a leaf under the right module, use a new unique `key`, set `path` from `ROUTES` or the route string, then wire `hasAccess('your.key')` in the UI if this page should respect grants.
 */
export const ACCESS_TREE = [
  {
    key: 'module.portal',
    titleAr: 'البوابة',
    titleEn: 'Portal',
    children: [
      {
        key: 'portal.company.dashboard',
        titleAr: 'لوحة الشركة',
        titleEn: 'Company dashboard',
        path: ROUTES.PORTAL_COMPANY_DASHBOARD,
      },
      {
        key: 'portal.servicecenter.dashboard',
        titleAr: 'لوحة مركز الخدمة',
        titleEn: 'Service center dashboard',
        path: ROUTES.PORTAL_SERVICE_CENTER_DASHBOARD,
      },
      {
        key: 'portal.company.notifications',
        titleAr: 'إشعارات الشركة',
        titleEn: 'Company notifications',
        path: ROUTES.PORTAL_COMPANY_NOTIFICATIONS,
      },
      {
        key: 'portal.servicecenter.notifications',
        titleAr: 'إشعارات مركز الخدمة',
        titleEn: 'Service center notifications',
        path: ROUTES.PORTAL_SERVICE_CENTER_NOTIFICATIONS,
      },
      {
        key: 'portal.company.attendance_departure',
        titleAr: 'الحضور والانصراف',
        titleEn: 'Attendance & departure',
        path: ROUTES.PORTAL_COMPANY_ATTENDANCE_DEPARTURE,
      },
      {
        key: 'portal.company.employees',
        titleAr: 'الموظفون (فريق المشرف)',
        titleEn: 'Employees (supervisor team)',
        path: ROUTES.PORTAL_COMPANY_EMPLOYEES,
      },
      {
        key: 'portal.supervisor.attendance',
        titleAr: 'حضور الفريق (مشرف)',
        titleEn: 'Team attendance (supervisor)',
        path: ROUTES.PORTAL_COMPANY_SUPERVISOR_ATTENDANCE,
      },
      {
        key: 'portal.supervisor.pending',
        titleAr: 'تسجيلات الفريق المعلّقة',
        titleEn: 'Pending team sign-ups (supervisor)',
        path: ROUTES.PORTAL_COMPANY_SUPERVISOR_PENDING,
      },
      {
        key: 'portal.company.send_notifications',
        titleAr: 'إشعارات للموظفين (مشرف)',
        titleEn: 'Notify employees (supervisor)',
        path: ROUTES.PORTAL_COMPANY_SEND_NOTIFICATIONS,
      },
      {
        key: 'portal.hr.pending_company',
        titleAr: 'موافقات HR — شركة',
        titleEn: 'HR pending approvals (company)',
        path: ROUTES.PORTAL_COMPANY_HR_PENDING,
      },
      {
        key: 'portal.hr.pending_service_center',
        titleAr: 'موافقات HR — مركز خدمة',
        titleEn: 'HR pending approvals (service center)',
        path: ROUTES.PORTAL_SERVICE_CENTER_HR_PENDING,
      },
    ],
  },
  {
    key: 'module.hr',
    titleAr: 'الموارد البشرية',
    titleEn: 'HR',
    children: [
      {
        key: 'hr.dashboard',
        titleAr: 'لوحة الموارد البشرية',
        titleEn: 'HR dashboard',
        path: ROUTES.PORTAL_HR_DASHBOARD,
      },
      {
        key: 'hr.users',
        titleAr: 'مستخدمو النظام (HR)',
        titleEn: 'System users (HR)',
        path: ROUTES.PORTAL_HR_USERS,
      },
      {
        key: 'hr.supervisors',
        titleAr: 'المشرفون والموظفون',
        titleEn: 'Supervisors & employees (HR)',
        path: ROUTES.PORTAL_HR_SUPERVISORS,
      },
      {
        key: 'hr.attendance',
        titleAr: 'الحضور والانصراف (HR)',
        titleEn: 'Attendance (HR)',
        path: ROUTES.PORTAL_HR_ATTENDANCE,
      },
      {
        key: 'hr.send_notifications',
        titleAr: 'إرسال إشعارات (HR)',
        titleEn: 'Send notifications (HR)',
        path: ROUTES.PORTAL_HR_SEND_NOTIFICATIONS,
      },
    ],
  },
  {
    key: 'module.reception',
    titleAr: 'الاستقبال',
    titleEn: 'Reception',
    children: [
      {
        key: 'reception.dashboard',
        titleAr: 'لوحة الاستقبال',
        titleEn: 'Reception dashboard',
        path: ROUTES.PORTAL_RECEPTION_DASHBOARD,
      },
      {
        key: 'reception.serviceCenters',
        titleAr: 'مراكز الخدمة',
        titleEn: 'Service centers overview',
        path: ROUTES.PORTAL_RECEPTION_SERVICE_CENTERS,
      },
      {
        key: 'reception.nationalities',
        titleAr: 'الجنسيات',
        titleEn: 'Nationalities',
        path: ROUTES.PORTAL_RECEPTION_NATIONALITIES,
      },
    ],
  },
  {
    key: 'module.superadmin',
    titleAr: 'المشرف الأعلى',
    titleEn: 'Super Admin',
    children: [
      {
        key: 'superadmin.dashboard',
        titleAr: 'لوحة المشرف الأعلى',
        titleEn: 'Super Admin dashboard',
        path: ROUTES.SUPER_ADMIN_DASHBOARD,
      },
      {
        key: 'superadmin.access',
        titleAr: 'التحكم في الوصول',
        titleEn: 'Access control',
        path: ROUTES.SUPER_ADMIN_ACCESS,
      },
      {
        key: 'superadmin.assign_supervisor',
        titleAr: 'تعيين مشرف',
        titleEn: 'Assign supervisor',
        path: ROUTES.SUPER_ADMIN_ASSIGN_SUPERVISOR,
      },
      {
        key: 'superadmin.supervisors',
        titleAr: 'المشرفون والموظفون',
        titleEn: 'Supervisors & employees',
        path: ROUTES.SUPER_ADMIN_SUPERVISORS,
      },
      {
        key: 'superadmin.locations',
        titleAr: 'المواقع',
        titleEn: 'Locations',
        path: ROUTES.SUPER_ADMIN_LOCATIONS,
      },
      {
        key: 'superadmin.service_centers',
        titleAr: 'مراكز الخدمة',
        titleEn: 'Service centers',
        path: ROUTES.SUPER_ADMIN_SERVICE_CENTERS,
      },
      {
        key: 'superadmin.shifts',
        titleAr: 'الورديات',
        titleEn: 'Shifts',
        path: ROUTES.SUPER_ADMIN_SHIFTS,
      },
      {
        key: 'superadmin.notification_inbox',
        titleAr: 'صندوق الإشعارات',
        titleEn: 'Notification inbox',
        path: ROUTES.SUPER_ADMIN_NOTIFICATION_INBOX,
      },
      {
        key: 'superadmin.notifications',
        titleAr: 'إرسال إشعارات',
        titleEn: 'Send notifications',
        path: ROUTES.SUPER_ADMIN_NOTIFICATIONS,
      },
    ],
  },
];

/** Marketing logos from `public/logo/` (KamelLogo picks light vs dark from theme). */
export const KAMEL_LOGO_LIGHT_SRC = '/logo/KamelLogoLightMode.png';
export const KAMEL_LOGO_DARK_SRC = '/logo/KamelLogoDarkMood.png';
/** Dark wordmark for public marketing pages (e.g. home) — use via `variant="darkPublic"`. */
export const KAMEL_LOGO_DARK_PUBLIC_SRC = '/logo/KamelLogoDarkPublic.png';
/** Light wordmark for public marketing pages (e.g. home) — use via `variant="lightPublic"`. */
export const KAMEL_LOGO_LIGHT_PUBLIC_SRC = '/logo/KamelLogoLightPublic.png';

export const AUTH_TOKEN_KEY = 'kamel_auth_token';

export const DEFAULT_LANG = 'ar';

export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'English', dir: 'ltr' },
];
