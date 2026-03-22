import { ROUTES, USER_TYPES } from './constants';

/**
 * Where to send an authenticated user instead of public (marketing / auth) pages.
 * Keeps login, sign-up, and home guest-only at the router level.
 *
 * Note: This is client-side routing only. All sensitive data must still be protected by the API.
 */
export function getAuthenticatedLandingRoute(user) {
  if (!user) return ROUTES.HOME;
  if (user.isSuperAdmin) return ROUTES.SUPER_ADMIN_DASHBOARD;
  if (user.userType === USER_TYPES.SERVICE_CENTER) return ROUTES.PORTAL_SERVICE_CENTER_DASHBOARD;
  return ROUTES.PORTAL_COMPANY_DASHBOARD;
}
