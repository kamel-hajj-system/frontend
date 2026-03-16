import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { PublicLayout } from '../layouts/PublicLayout';
import { PortalLayout } from '../layouts/PortalLayout';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { SuperAdminRoute } from './SuperAdminRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { PermissionRoute } from './PermissionRoute';
import { PortalRedirect } from './PortalRedirect';
import { RequirePortalCompany, RequirePortalServiceCenter } from './PortalDashboardRoute';

import { HomePage } from '../pages/public/HomePage';
import { LoginPage } from '../pages/public/LoginPage';
import { SignUpNormalPage } from '../pages/public/SignUpNormalPage';
import { SignUpServiceCenterPage } from '../pages/public/SignUpServiceCenterPage';
import { CompanyDashboardPage } from '../pages/portal/company/CompanyDashboardPage';
import { ServiceCenterDashboardPage } from '../pages/portal/servicecenter/ServiceCenterDashboardPage';
import { TestPermissionRolePage } from '../pages/portal/TestPermissionRolePage';
import { SuperAdminDashboardPage } from '../pages/superadmin/SuperAdminDashboardPage';
import { LocationsPage } from '../pages/superadmin/LocationsPage';
import { ShiftsPage } from '../pages/superadmin/ShiftsPage';
import { PermissionsPage } from '../pages/superadmin/PermissionsPage';
import { GroupsPage } from '../pages/superadmin/GroupsPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';

const router = createBrowserRouter([
  {
    path: ROUTES.FORBIDDEN,
    element: <ForbiddenPage />,
  },
  {
    path: ROUTES.HOME,
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'sign-up',
        children: [
          {
            path: 'normal',
            element: (
              <PublicOnlyRoute>
                <SignUpNormalPage />
              </PublicOnlyRoute>
            ),
          },
          {
            path: 'service-center',
            element: (
              <PublicOnlyRoute>
                <SignUpServiceCenterPage />
              </PublicOnlyRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: 'portal',
    element: (
      <ProtectedRoute>
        <PortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <PortalRedirect /> },
      { path: 'company/dashboard', element: <RequirePortalCompany><CompanyDashboardPage /></RequirePortalCompany> },
      { path: 'service-center/dashboard', element: <RequirePortalServiceCenter><ServiceCenterDashboardPage /></RequirePortalServiceCenter> },
      { path: 'test-permission-role', element: <PermissionRoute permission="test.permission_role"><TestPermissionRolePage /></PermissionRoute> },
    ],
  },
  {
    path: 'superadmin',
    element: (
      <SuperAdminRoute>
        <SuperAdminLayout />
      </SuperAdminRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace /> },
      { path: 'dashboard', element: <PermissionRoute permission="users.view"><SuperAdminDashboardPage /></PermissionRoute> },
      { path: 'locations', element: <PermissionRoute permission={['locations.view', 'locations.manage']}><LocationsPage /></PermissionRoute> },
      { path: 'shifts', element: <PermissionRoute permission={['shifts.view', 'shifts.manage']}><ShiftsPage /></PermissionRoute> },
      { path: 'permissions', element: <PermissionRoute permission={['permissions.view', 'permissions.manage']}><PermissionsPage /></PermissionRoute> },
      { path: 'groups', element: <GroupsPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
