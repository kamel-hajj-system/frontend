import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { PublicLayout } from '../layouts/PublicLayout';
import { PortalLayout } from '../layouts/PortalLayout';
import { SuperAdminLayout } from '../layouts/SuperAdminLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { SuperAdminRoute } from './SuperAdminRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { PortalRedirect } from './PortalRedirect';
import { RequirePortalCompany, RequirePortalServiceCenter } from './PortalDashboardRoute';

import { HomePage } from '../pages/public/HomePage';
import { LoginPage } from '../pages/public/LoginPage';
import { SignUpNormalPage } from '../pages/public/SignUpNormalPage';
import { SignUpServiceCenterPage } from '../pages/public/SignUpServiceCenterPage';
import { CompanyDashboardPage } from '../pages/portal/company/CompanyDashboardPage';
import { EmployeesPage } from '../pages/portal/company/Employees/EmployeesPage';
import { AttendanceAndDeparturePage } from '../pages/portal/company/public/AttendanceAndDeparture/AttendanceAndDeparturePage';
import { ServiceCenterDashboardPage } from '../pages/portal/servicecenter/ServiceCenterDashboardPage';
import { HrDashboardPage } from '../pages/portal/company/hr/HrDashboardPage';
import { HrUsersPage } from '../pages/portal/company/hr/HrUsersPage';
import { HrSupervisorsPage } from '../pages/portal/company/hr/HrSupervisorsPage';
import { HrAttendancePage } from '../pages/portal/company/hr/HrAttendancePage';
import { ReceptionDashboardPage } from '../pages/portal/company/reception/ReceptionDashboardPage';
import { SuperAdminDashboardPage } from '../pages/superadmin/SuperAdminDashboardPage';
import { AccessControlPage } from '../pages/superadmin/AccessControlPage';
import { AssignSupervisorPage } from '../pages/superadmin/AssignSupervisorPage';
import { SupervisorsManagementPage } from '../pages/superadmin/SupervisorsManagementPage';
import { LocationsPage } from '../pages/superadmin/LocationsPage';
import { ShiftsPage } from '../pages/superadmin/ShiftsPage';
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
      {
        path: 'company/dashboard',
        element: (
          <RequirePortalCompany>
            <CompanyDashboardPage />
          </RequirePortalCompany>
        ),
      },
      {
        path: 'company/employees',
        element: (
          <RequirePortalCompany>
            <EmployeesPage />
          </RequirePortalCompany>
        ),
      },
      {
        path: 'company/attendance-departure',
        element: (
          <RequirePortalCompany>
            <AttendanceAndDeparturePage />
          </RequirePortalCompany>
        ),
      },
      {
        path: 'service-center/dashboard',
        element: (
          <RequirePortalServiceCenter>
            <ServiceCenterDashboardPage />
          </RequirePortalServiceCenter>
        ),
      },
      {
        path: 'hr/dashboard',
        element: <HrDashboardPage />,
      },
      {
        path: 'hr/users',
        element: <HrUsersPage />,
      },
      {
        path: 'hr/supervisors',
        element: <HrSupervisorsPage />,
      },
      {
        path: 'hr/attendance',
        element: <HrAttendancePage />,
      },
      {
        path: 'reception/dashboard',
        element: <ReceptionDashboardPage />,
      },
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
      { path: 'dashboard', element: <SuperAdminDashboardPage /> },
      { path: 'access', element: <AccessControlPage /> },
      { path: 'assign-supervisor', element: <AssignSupervisorPage /> },
      { path: 'supervisors', element: <SupervisorsManagementPage /> },
      { path: 'locations', element: <LocationsPage /> },
      { path: 'shifts', element: <ShiftsPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
