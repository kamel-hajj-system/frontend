import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Drawer, Typography, Grid } from 'antd';
import {
  BellOutlined,
  DashboardOutlined,
  InboxOutlined,
  LogoutOutlined,
  GlobalOutlined,
  CalendarOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES, USER_TYPES } from '../utils/constants';
import { NotificationBellDropdown } from '../components/common/NotificationBellDropdown';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

export function PortalLayout() {
  const { user, logout, hasAccess } = useAuth();
  const { t, lang, setLang, LANGUAGES } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md ?? true;
  const isRtl = lang === 'ar';
  const siderWidth = siderCollapsed ? 80 : 240;

  const displayName = user?.fullNameAr || user?.fullName || user?.email || '';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
    setDrawerOpen(false);
  };

  const langMenuItems = LANGUAGES.map((l) => ({
    key: l.code,
    icon: <GlobalOutlined />,
    label: l.label,
    onClick: () => setLang(l.code),
  }));

  const userMenuItems = [
    { key: 'name', label: displayName, disabled: true },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: t('nav.logout'), danger: true, onClick: handleLogout },
  ];

  const dashboardRoute =
    user?.userType === USER_TYPES.SERVICE_CENTER
      ? ROUTES.PORTAL_SERVICE_CENTER_DASHBOARD
      : ROUTES.PORTAL_COMPANY_DASHBOARD;
  const dashboardLabel =
    user?.userType === USER_TYPES.SERVICE_CENTER
      ? t('portal.serviceCenterDashboardTitle')
      : t('portal.companyDashboardTitle');
  const notificationsRoute =
    user?.userType === USER_TYPES.SERVICE_CENTER
      ? ROUTES.PORTAL_SERVICE_CENTER_NOTIFICATIONS
      : ROUTES.PORTAL_COMPANY_NOTIFICATIONS;

  const sidebarMenuItems = [
    {
      key: dashboardRoute,
      icon: <DashboardOutlined />,
      label: dashboardLabel,
      onClick: () => {
        navigate(dashboardRoute);
        setDrawerOpen(false);
      },
    },
    ...(user?.userType === USER_TYPES.COMPANY && user?.role === 'Supervisor'
      ? [
          {
            key: ROUTES.PORTAL_COMPANY_EMPLOYEES,
            icon: <TeamOutlined />,
            label: t('portal.employeesTitle'),
            onClick: () => {
              navigate(ROUTES.PORTAL_COMPANY_EMPLOYEES);
              setDrawerOpen(false);
            },
          },
          {
            key: ROUTES.PORTAL_COMPANY_SEND_NOTIFICATIONS,
            icon: <BellOutlined />,
            label: t('portal.supervisorSendNotificationsTitle'),
            onClick: () => {
              navigate(ROUTES.PORTAL_COMPANY_SEND_NOTIFICATIONS);
              setDrawerOpen(false);
            },
          },
        ]
      : []),
    ...(user?.userType === USER_TYPES.COMPANY
      ? [
          {
            key: ROUTES.PORTAL_COMPANY_ATTENDANCE_DEPARTURE,
            icon: <CalendarOutlined />,
            label: t('portal.attendanceDepartureTitle'),
            onClick: () => {
              navigate(ROUTES.PORTAL_COMPANY_ATTENDANCE_DEPARTURE);
              setDrawerOpen(false);
            },
          },
        ]
      : []),
    ...(user?.isHr
      ? [
          {
            key: 'hr-root',
            icon: <TeamOutlined />,
            label: t('portal.hrDashboardTitle'),
            children: [
              {
                key: ROUTES.PORTAL_HR_DASHBOARD,
                label: t('portal.hrDashboardTitle'),
                onClick: () => {
                  navigate(ROUTES.PORTAL_HR_DASHBOARD);
                  setDrawerOpen(false);
                },
              },
              {
                key: ROUTES.PORTAL_HR_USERS,
                label: t('portal.hrUsersTitle'),
                onClick: () => {
                  navigate(ROUTES.PORTAL_HR_USERS);
                  setDrawerOpen(false);
                },
              },
              {
                key: ROUTES.PORTAL_HR_SUPERVISORS,
                label: t('portal.hrSupervisorsTitle'),
                onClick: () => {
                  navigate(ROUTES.PORTAL_HR_SUPERVISORS);
                  setDrawerOpen(false);
                },
              },
              {
                key: ROUTES.PORTAL_HR_ATTENDANCE,
                label: t('portal.hrAttendanceTitle'),
                onClick: () => {
                  navigate(ROUTES.PORTAL_HR_ATTENDANCE);
                  setDrawerOpen(false);
                },
              },
              ...(user?.role === 'Supervisor' || user?.role === 'EmpManage'
                ? [
                    {
                      key: ROUTES.PORTAL_HR_SEND_NOTIFICATIONS,
                      label: t('portal.hrSendNotificationsTitle'),
                      onClick: () => {
                        navigate(ROUTES.PORTAL_HR_SEND_NOTIFICATIONS);
                        setDrawerOpen(false);
                      },
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(hasAccess?.('reception.dashboard')
      ? [
          {
            key: ROUTES.PORTAL_RECEPTION_DASHBOARD,
            icon: <InboxOutlined />,
            label: t('portal.receptionDashboardTitle'),
            onClick: () => {
              navigate(ROUTES.PORTAL_RECEPTION_DASHBOARD);
              setDrawerOpen(false);
            },
          },
        ]
      : []),
  ];

  const isDarkSider = theme === 'dark';
  const siderBg = isDarkSider ? '#001529' : 'var(--color-bg-container)';
  const siderBorder = isDarkSider ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const siderTextColor = isDarkSider ? 'rgba(255,255,255,0.65)' : 'var(--color-text-secondary)';

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: siderBg }}>
      <div style={{ height: 32, margin: 16, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Button
          type="link"
          onClick={() => navigate(dashboardRoute)}
          style={{ fontWeight: 600, color: isDarkSider ? 'rgba(255,255,255,0.85)' : 'var(--color-text)', padding: 0 }}
        >
          {t('app.shortName')}
        </Button>
      </div>
      <Menu
        theme={isDarkSider ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={sidebarMenuItems}
        style={{ borderRight: 0, flex: 1, background: 'transparent' }}
      />
      <div style={{ padding: 12, borderTop: `1px solid ${siderBorder}`, flexShrink: 0 }}>
        <Text
          type="secondary"
          style={{ color: siderTextColor, display: 'block', fontSize: 12 }}
          ellipsis
          title={displayName}
        >
          {displayName}
        </Text>
      </div>
    </div>
  );

  const headerActions = (
    <>
      <Dropdown menu={{ items: langMenuItems }} placement="bottomEnd">
        <Button type="text" icon={<GlobalOutlined />} aria-label={t('nav.login')} />
      </Dropdown>
      <Button
        type="text"
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
      />
      <Dropdown menu={{ items: userMenuItems }} placement="bottomEnd">
        <Button icon={<UserOutlined />}>{t('nav.logout')}</Button>
      </Dropdown>
      <NotificationBellDropdown allNotificationsPath={notificationsRoute} placement="bottomRight" />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isDesktop ? (
        <Sider
          collapsible
          collapsed={siderCollapsed}
          onCollapse={setSiderCollapsed}
          width={240}
          collapsedWidth={80}
          trigger={null}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            top: 0,
            bottom: 0,
            zIndex: 100,
            background: siderBg,
            ...(isRtl ? { right: 0 } : { left: 0 }),
          }}
        >
          {sidebar}
        </Sider>
      ) : (
        <Drawer
          title={t('app.shortName')}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement={isRtl ? 'right' : 'left'}
          bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', background: siderBg }}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            theme={isDarkSider ? 'dark' : 'light'}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={sidebarMenuItems}
            style={{ flex: 1, borderRight: 0, background: 'transparent' }}
            onClick={() => setDrawerOpen(false)}
          />
          <div style={{ padding: 16, borderTop: `1px solid ${siderBorder}` }}>
            <Text type="secondary" style={{ display: 'block', color: siderTextColor }} ellipsis>
              {displayName}
            </Text>
          </div>
        </Drawer>
      )}

      <Layout
        style={{
          marginInlineStart: isDesktop ? siderWidth : 0,
        }}
      >
        <Header style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isDesktop && <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />}
          {isDesktop && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
            />
          )}
          <div style={{ flex: 1 }} />
          {headerActions}
        </Header>
        <Content style={{ margin: 24, padding: 24, minHeight: 280, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
