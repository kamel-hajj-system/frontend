import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Drawer, Typography, Grid, Space, Tooltip, theme as antTheme } from 'antd';
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
  const { token } = antTheme.useToken();
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
  const siderWidth = siderCollapsed ? 80 : 260;

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
    onClick: () => {
      setLang(l.code);
      setDrawerOpen(false);
    },
  }));

  const currentLangLabel = LANGUAGES.find((l) => l.code === lang)?.label || lang;

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
  const siderBg = isDarkSider ? '#0b1220' : token.colorBgContainer;
  const siderBorder = isDarkSider ? 'rgba(255,255,255,0.08)' : token.colorBorderSecondary;
  const siderTextColor = isDarkSider ? 'rgba(255,255,255,0.72)' : token.colorTextSecondary;
  const siderAccent = isDarkSider ? 'rgba(255,255,255,0.92)' : token.colorText;

  const footerDockStyle = {
    margin: siderCollapsed ? '0 8px 12px' : '0 12px 14px',
    padding: siderCollapsed ? '10px 6px' : '12px 12px',
    borderRadius: token.borderRadiusLG * 1.25,
    background: isDarkSider ? 'rgba(255,255,255,0.05)' : token.colorFillQuaternary,
    border: `1px solid ${isDarkSider ? 'rgba(255,255,255,0.07)' : token.colorBorderSecondary}`,
    boxShadow: isDarkSider ? '0 1px 0 rgba(255,255,255,0.04) inset' : `0 1px 2px ${token.colorBgLayout}40`,
  };

  const dockIconBtn = (extra = {}) => ({
    color: siderTextColor,
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: isDarkSider ? 'rgba(255,255,255,0.06)' : token.colorBgContainer,
    ...extra,
  });

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: siderBg }}>
      <div
        style={{
          margin: '18px 16px 8px',
          paddingBottom: 12,
          borderBottom: `1px solid ${siderBorder}`,
          flexShrink: 0,
        }}
      >
        <Button
          type="text"
          onClick={() => navigate(dashboardRoute)}
          style={{
            height: 'auto',
            padding: '4px 2px',
            fontWeight: 700,
            fontSize: siderCollapsed ? 15 : 17,
            letterSpacing: '-0.02em',
            color: siderAccent,
            lineHeight: 1.25,
          }}
        >
          {siderCollapsed ? t('app.shortName').slice(0, 1) : t('app.shortName')}
        </Button>
        {!siderCollapsed ? (
          <Text
            style={{
              display: 'block',
              marginTop: 2,
              fontSize: 11,
              color: siderTextColor,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {t('nav.portal')}
          </Text>
        ) : null}
      </div>
      <Menu
        theme={isDarkSider ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={sidebarMenuItems}
        style={{
          borderRight: 0,
          flex: 1,
          background: 'transparent',
          padding: '4px 8px',
        }}
      />
      <div style={{ flexShrink: 0, paddingTop: 8 }}>
        <div style={footerDockStyle}>
          <Space
            size={8}
            direction={siderCollapsed ? 'vertical' : 'horizontal'}
            style={{
              width: '100%',
              marginBottom: siderCollapsed ? 0 : 10,
              justifyContent: siderCollapsed ? 'center' : isRtl ? 'flex-end' : 'flex-start',
            }}
          >
            <Tooltip title={currentLangLabel}>
              <Dropdown menu={{ items: langMenuItems }} placement={isRtl ? 'bottomLeft' : 'bottomRight'} trigger={['click']}>
                <Button
                  type="text"
                  icon={<GlobalOutlined />}
                  aria-label={currentLangLabel}
                  style={dockIconBtn()}
                />
              </Dropdown>
            </Tooltip>
            <Tooltip title={theme === 'dark' ? t('theme.light') : t('theme.dark')}>
              <Button
                type="text"
                icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
                style={dockIconBtn()}
              />
            </Tooltip>
          </Space>
          {!siderCollapsed ? (
            <Text
              style={{
                color: siderTextColor,
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1.35,
              }}
              ellipsis
              title={displayName}
            >
              {displayName}
            </Text>
          ) : (
            <Tooltip title={displayName}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
                <UserOutlined style={{ color: siderTextColor, fontSize: 15, opacity: 0.9 }} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );

  const headerActions = (
    <Space size={4} align="center">
      <Tooltip title={`${t('nav.account')}${displayName ? ` — ${displayName}` : ''}`}>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Button
            type="text"
            shape="circle"
            size="large"
            icon={<UserOutlined style={{ fontSize: 18 }} />}
            aria-label={t('nav.account')}
            style={{ color: token.colorText }}
          />
        </Dropdown>
      </Tooltip>
      <NotificationBellDropdown allNotificationsPath={notificationsRoute} placement="bottomRight" />
    </Space>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isDesktop ? (
        <Sider
          collapsible
          collapsed={siderCollapsed}
          onCollapse={setSiderCollapsed}
          width={260}
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
            boxShadow: isRtl
              ? `-4px 0 24px rgba(0,0,0,${isDarkSider ? 0.35 : 0.06})`
              : `4px 0 24px rgba(0,0,0,${isDarkSider ? 0.35 : 0.06})`,
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
          <div style={{ padding: '12px 16px 20px', borderTop: `1px solid ${siderBorder}` }}>
            <div style={{ ...footerDockStyle, margin: 0 }}>
              <Space size={8} wrap style={{ width: '100%', marginBottom: 10 }}>
                <Tooltip title={currentLangLabel}>
                  <Dropdown menu={{ items: langMenuItems }} placement="top" trigger={['click']}>
                    <Button type="text" icon={<GlobalOutlined />} aria-label={currentLangLabel} style={dockIconBtn()} />
                  </Dropdown>
                </Tooltip>
                <Tooltip title={theme === 'dark' ? t('theme.light') : t('theme.dark')}>
                  <Button
                    type="text"
                    icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
                    style={dockIconBtn()}
                  />
                </Tooltip>
              </Space>
              <Text style={{ display: 'block', color: siderTextColor, fontSize: 12, fontWeight: 500 }} ellipsis title={displayName}>
                {displayName}
              </Text>
            </div>
          </div>
        </Drawer>
      )}

      <Layout
        style={{
          marginInlineStart: isDesktop ? siderWidth : 0,
        }}
      >
        <Header
          style={{
            padding: '0 20px',
            height: 60,
            lineHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: `0 1px 0 ${token.colorBorderSecondary}40`,
          }}
        >
          {!isDesktop && (
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu"
            />
          )}
          {isDesktop && (
            <Button
              type="text"
              shape="circle"
              size="large"
              icon={<MenuOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
              aria-label={siderCollapsed ? 'Expand menu' : 'Collapse menu'}
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
