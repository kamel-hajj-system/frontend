import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Drawer, Typography, Grid } from 'antd';
import {
  CrownOutlined,
  SafetyOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROUTES } from '../utils/constants';
import { NotificationBellDropdown } from '../components/common/NotificationBellDropdown';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

export function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang, LANGUAGES } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md ?? true;
  const isRtl = lang === 'ar';
  const isAr = lang === 'ar';
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
    onClick: () => setLang(l.code),
  }));

  const userMenuItems = [
    { key: 'name', label: displayName, disabled: true },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: isAr ? 'تسجيل خروج' : 'Logout', danger: true, onClick: handleLogout },
  ];

  const sidebarMenuItems = [
    {
      key: ROUTES.SUPER_ADMIN_DASHBOARD,
      icon: <CrownOutlined />,
      label: isAr ? 'إدارة المستخدمين' : 'Users Management',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_DASHBOARD); setDrawerOpen(false); },
    },
    {
      key: ROUTES.SUPER_ADMIN_ACCESS,
      icon: <SafetyOutlined />,
      label: isAr ? 'التحكم في الوصول' : 'Access Control',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_ACCESS); setDrawerOpen(false); },
    },
    {
      key: ROUTES.SUPER_ADMIN_ASSIGN_SUPERVISOR,
      icon: <TeamOutlined />,
      label: isAr ? 'تعيين مشرف للمستخدمين' : 'Assign Supervisor',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_ASSIGN_SUPERVISOR); setDrawerOpen(false); },
    },
    {
      key: ROUTES.SUPER_ADMIN_SUPERVISORS,
      icon: <TeamOutlined />,
      label: isAr ? 'المشرفون والموظفون' : 'Supervisors & Employees',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_SUPERVISORS); setDrawerOpen(false); },
    },
    {
      key: ROUTES.SUPER_ADMIN_LOCATIONS,
      icon: <EnvironmentOutlined />,
      label: isAr ? 'المواقع' : 'Locations',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_LOCATIONS); setDrawerOpen(false); },
    },
    {
      key: ROUTES.SUPER_ADMIN_SERVICE_CENTERS,
      icon: <ShopOutlined />,
      label: isAr ? 'مراكز الخدمة' : 'Service Centers',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_SERVICE_CENTERS); setDrawerOpen(false); },
    },
    {
      key: ROUTES.SUPER_ADMIN_SHIFTS,
      icon: <ClockCircleOutlined />,
      label: isAr ? 'الورديات' : 'Shifts',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_SHIFTS); setDrawerOpen(false); },
    },
    {
      key: ROUTES.SUPER_ADMIN_NOTIFICATIONS,
      icon: <BellOutlined />,
      label: isAr ? 'إرسال إشعارات' : 'Send Notifications',
      onClick: () => { navigate(ROUTES.SUPER_ADMIN_NOTIFICATIONS); setDrawerOpen(false); },
    },
  ];

  const isDarkSider = theme === 'dark';
  const siderBg = isDarkSider ? '#001529' : 'var(--color-bg-container)';
  const siderBorder = isDarkSider ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const siderTextColor = isDarkSider ? 'rgba(255,255,255,0.65)' : 'var(--color-text-secondary)';

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: siderBg }}>
      <div style={{ height: 32, margin: 16, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Text strong style={{ color: isDarkSider ? 'rgba(255,255,255,0.85)' : 'var(--color-text)' }}>
          <CrownOutlined /> {isAr ? 'المشرف العام' : 'Super Admin'}
        </Text>
      </div>
      <Menu
        theme={isDarkSider ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={sidebarMenuItems}
        style={{ borderRight: 0, flex: 1, background: 'transparent' }}
      />
      <div style={{ padding: 12, borderTop: `1px solid ${siderBorder}`, flexShrink: 0 }}>
        <Text type="secondary" style={{ color: siderTextColor, display: 'block', fontSize: 12 }} ellipsis title={displayName}>
          {displayName}
        </Text>
      </div>
    </div>
  );

  const headerActions = (
    <>
      <Dropdown menu={{ items: langMenuItems }} placement="bottomEnd">
        <Button type="text" icon={<GlobalOutlined />} />
      </Dropdown>
      <Button type="text" icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} />
      <Dropdown menu={{ items: userMenuItems }} placement="bottomEnd">
        <Button icon={<UserOutlined />}>{isAr ? 'خروج' : 'Logout'}</Button>
      </Dropdown>
      <NotificationBellDropdown allNotificationsPath={ROUTES.SUPER_ADMIN_NOTIFICATION_INBOX} placement="bottomRight" />
    </>
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
            ...(isRtl ? { right: 0 } : { left: 0 }),
          }}
        >
          {sidebar}
        </Sider>
      ) : (
        <Drawer
          title={<><CrownOutlined /> {isAr ? 'المشرف العام' : 'Super Admin'}</>}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement={isRtl ? 'right' : 'left'}
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
        </Drawer>
      )}

      <Layout style={{ marginInlineStart: isDesktop ? siderWidth : 0 }}>
        <Header style={{ padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isDesktop && <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />}
          {isDesktop && <Button type="text" icon={<MenuOutlined />} onClick={() => setSiderCollapsed(!siderCollapsed)} />}
          <Typography.Text strong style={{ flex: 1 }}>
            <CrownOutlined /> {isAr ? 'لوحة المشرف العام' : 'Super Admin Panel'}
          </Typography.Text>
          {headerActions}
        </Header>
        <Content style={{ margin: 24, padding: 24, minHeight: 280, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
