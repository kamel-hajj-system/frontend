import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Dropdown, Drawer, Typography, Grid } from 'antd';
import {
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
  CrownOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES, USER_TYPES } from '../../utils/constants';
import { NotificationBellDropdown } from '../common/NotificationBellDropdown';

const { Text } = Typography;

const { useBreakpoint } = Grid;

export function PublicNavbar() {
  const { user, isAuthenticated, isSuperAdmin, logout } = useAuth();
  const { t, lang, setLang, LANGUAGES } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md ?? true;

  const displayName = user?.fullNameAr || user?.fullName || user?.email || '';
  const notificationsRoute = isSuperAdmin
    ? ROUTES.SUPER_ADMIN_NOTIFICATION_INBOX
    : user?.userType === USER_TYPES.SERVICE_CENTER
      ? ROUTES.PORTAL_SERVICE_CENTER_NOTIFICATIONS
      : ROUTES.PORTAL_COMPANY_NOTIFICATIONS;

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

  const getPublicMenuItems = () => {
    const items = [
      { key: 'home', icon: <HomeOutlined />, label: t('nav.home'), onClick: () => navigate(ROUTES.HOME) },
      { key: 'login', icon: <LoginOutlined />, label: t('nav.login'), onClick: () => { navigate(ROUTES.LOGIN); setDrawerOpen(false); } },
      {
        key: 'signup',
        icon: <UserAddOutlined />,
        label: t('nav.signUp'),
        children: [
          { key: ROUTES.SIGN_UP_NORMAL, label: t('nav.signUpNormal'), onClick: () => { navigate(ROUTES.SIGN_UP_NORMAL); setDrawerOpen(false); } },
          { key: ROUTES.SIGN_UP_SERVICE_CENTER, label: t('nav.signUpServiceCenter'), onClick: () => { navigate(ROUTES.SIGN_UP_SERVICE_CENTER); setDrawerOpen(false); } },
        ],
      },
    ];
    return items;
  };

  const getAuthMenuItems = () => {
    const items = [
      { key: 'home', icon: <HomeOutlined />, label: t('nav.home'), onClick: () => navigate(ROUTES.HOME) },
    ];
    if (isSuperAdmin) {
      items.push({ key: ROUTES.SUPER_ADMIN_DASHBOARD, icon: <CrownOutlined />, label: t('nav.superadmin'), onClick: () => navigate(ROUTES.SUPER_ADMIN_DASHBOARD) });
    } else {
      items.push({ key: ROUTES.PORTAL_DASHBOARD, icon: <AppstoreOutlined />, label: t('nav.portal'), onClick: () => navigate(ROUTES.PORTAL_DASHBOARD) });
    }
    items.push({
      key: notificationsRoute,
      icon: <BellOutlined />,
      label: t('nav.notifications') || 'Notifications',
      onClick: () => navigate(notificationsRoute),
    });
    return items;
  };

  const menuItems = isAuthenticated ? getAuthMenuItems() : getPublicMenuItems();

  const selectedKey = [location.pathname];
  if (location.pathname.startsWith('/sign-up')) selectedKey[0] = location.pathname;

  const desktopMenu = (
    <Menu
      mode="horizontal"
      selectedKeys={selectedKey}
      items={menuItems}
      style={{ flex: 1, minWidth: 0, borderBottom: 'none', lineHeight: '64px' }}
    />
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 16 }}>
        <Button type="link" onClick={() => navigate(ROUTES.HOME)} style={{ fontSize: 18, fontWeight: 600, color: 'inherit' }}>
          {t('app.shortName')}
        </Button>
        {isDesktop ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {desktopMenu}
            {isAuthenticated && <Text type="secondary" style={{ marginRight: 8 }}>{displayName}</Text>}
            <Dropdown menu={{ items: langMenuItems }} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />} />
            </Dropdown>
            <Button type="text" icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} />
            {isAuthenticated && (
              <NotificationBellDropdown allNotificationsPath={notificationsRoute} placement="bottomRight" />
            )}
            {isAuthenticated && (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button icon={<LogoutOutlined />}>{t('nav.logout')}</Button>
              </Dropdown>
            )}
          </div>
        ) : (
          <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} style={{ fontSize: 18 }} />
        )}
      </div>

      <Drawer
        title={t('app.shortName')}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement={lang === 'ar' ? 'left' : 'right'}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKey}
          items={menuItems}
          style={{ height: '100%', borderRight: 0 }}
          onClick={() => setDrawerOpen(false)}
        />
        <div style={{ padding: 16, borderTop: '1px solid rgba(5, 5, 5, 0.06)' }}>
          <Dropdown menu={{ items: langMenuItems }} placement="topRight" style={{ width: '100%' }}>
            <Button icon={<GlobalOutlined />} block style={{ marginBottom: 8 }}>{t('theme.light')} / {t('theme.dark')} — {LANGUAGES.find((l) => l.code === lang)?.label}</Button>
          </Dropdown>
          <Button icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} block style={{ marginBottom: 8 }}>
            {theme === 'dark' ? t('theme.light') : t('theme.dark')}
          </Button>
          {isAuthenticated && (
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout} block>{t('nav.logout')}</Button>
          )}
        </div>
      </Drawer>
    </>
  );
}
