import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Dropdown, Drawer, Typography, Grid, Space, theme as antTheme } from 'antd';
import {
  HomeOutlined,
  LoginOutlined,
  UserAddOutlined,
  UserOutlined,
  CrownOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  GlobalOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
  BellOutlined,
  RocketOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES, USER_TYPES } from '../../utils/constants';
import { getAuthenticatedLandingRoute } from '../../utils/authRedirect';
import { NotificationBellDropdown } from '../common/NotificationBellDropdown';
import { KamelLogo } from '../common/KamelLogo';
import { usePublicContentScrollRoot } from '../../contexts/PublicContentScrollContext';
import { usePublicHomeScrollSpy } from '../../hooks/usePublicHomeScrollSpy';

const { Text } = Typography;

const { useBreakpoint } = Grid;

function navTextButtonStyle(active, token) {
  return {
    fontWeight: active ? 600 : 500,
    color: active ? token.colorPrimary : token.colorText,
    borderRadius: token.borderRadiusLG,
    height: 40,
    paddingInline: 16,
    border: `1px solid ${active ? token.colorPrimary : 'transparent'}`,
    background: active ? `${token.colorPrimary}12` : 'transparent',
  };
}

export function PublicNavbar() {
  const { token } = antTheme.useToken();
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

  const portalEntryRoute = ROUTES.PORTAL;

  const landingPath = isAuthenticated && user ? getAuthenticatedLandingRoute(user) : ROUTES.HOME;

  const isHome = location.pathname === ROUTES.HOME;
  /** Larger wordmark on marketing home; dark mode uses public dark artwork. */
  const navLogoVariant = isHome ? (theme === 'dark' ? 'darkPublic' : 'lightPublic') : 'auto';
  const navLogoHeightDesktop = isHome ? 52 : 34;
  const navLogoHeightMobile = isHome ? 44 : 30;
  const navLogoDrawerHeight = isHome ? 34 : 24;
  const contentScrollRoot = usePublicContentScrollRoot();
  const homeScrollSpyId = usePublicHomeScrollSpy(
    !isAuthenticated && isHome,
    contentScrollRoot,
    location.pathname,
    location.hash
  );

  const goBrandOrAppHome = () => {
    navigate(landingPath);
    setDrawerOpen(false);
  };

  /** Marketing sections on home: navigate with hash so HomePage can smooth-scroll (stays in sync with React Router). */
  const goToHomeSection = (sectionId) => {
    setDrawerOpen(false);
    const h = sectionId.startsWith('#') ? sectionId : `#${sectionId}`;
    if (location.pathname !== ROUTES.HOME) {
      navigate({ pathname: ROUTES.HOME, hash: h });
      return;
    }
    navigate({ hash: h }, { replace: true });
  };

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

  const joinUsMenuItems = [
    {
      key: 'login',
      icon: <LoginOutlined />,
      label: t('nav.login'),
      onClick: () => navigate(ROUTES.LOGIN),
    },
    { type: 'divider' },
    {
      key: ROUTES.SIGN_UP_NORMAL,
      icon: <UserAddOutlined />,
      label: t('nav.signUpNormal'),
      onClick: () => navigate(ROUTES.SIGN_UP_NORMAL),
    },
    {
      key: ROUTES.SIGN_UP_SERVICE_CENTER,
      icon: <UserAddOutlined />,
      label: t('nav.signUpServiceCenter'),
      onClick: () => navigate(ROUTES.SIGN_UP_SERVICE_CENTER),
    },
  ];

  const getPublicMenuItems = () => [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: t('nav.home'),
      onClick: () => {
        navigate({ pathname: ROUTES.HOME, hash: '' });
        setDrawerOpen(false);
      },
    },
    {
      key: 'sec-services',
      label: t('nav.sectionServices'),
      onClick: () => goToHomeSection('services'),
    },
    {
      key: 'sec-products',
      label: t('nav.sectionProducts'),
      onClick: () => goToHomeSection('products'),
    },
    {
      key: 'sec-about',
      label: t('nav.sectionAbout'),
      onClick: () => goToHomeSection('about'),
    },
    {
      key: 'join',
      icon: <RocketOutlined />,
      label: t('nav.joinUs'),
      children: [
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: t('nav.login'),
          onClick: () => {
            navigate(ROUTES.LOGIN);
            setDrawerOpen(false);
          },
        },
        {
          key: ROUTES.SIGN_UP_NORMAL,
          label: t('nav.signUpNormal'),
          onClick: () => {
            navigate(ROUTES.SIGN_UP_NORMAL);
            setDrawerOpen(false);
          },
        },
        {
          key: ROUTES.SIGN_UP_SERVICE_CENTER,
          label: t('nav.signUpServiceCenter'),
          onClick: () => {
            navigate(ROUTES.SIGN_UP_SERVICE_CENTER);
            setDrawerOpen(false);
          },
        },
      ],
    },
  ];

  const getAuthMenuItems = () => {
    const items = [
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: t('nav.home'),
        onClick: goBrandOrAppHome,
      },
    ];
    if (isSuperAdmin) {
      items.push({
        key: ROUTES.SUPER_ADMIN_DASHBOARD,
        icon: <CrownOutlined />,
        label: t('nav.superadmin'),
        onClick: () => {
          navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
          setDrawerOpen(false);
        },
      });
    } else {
      items.push({
        key: portalEntryRoute,
        icon: <AppstoreOutlined />,
        label: t('nav.portal'),
        onClick: () => {
          navigate(portalEntryRoute);
          setDrawerOpen(false);
        },
      });
    }
    items.push({
      key: notificationsRoute,
      icon: <BellOutlined />,
      label: t('nav.notifications') || 'Notifications',
      onClick: () => {
        navigate(notificationsRoute);
        setDrawerOpen(false);
      },
    });
    return items;
  };

  const menuItems = isAuthenticated ? getAuthMenuItems() : getPublicMenuItems();

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/sign-up')) return [location.pathname];
    if (!isAuthenticated && isHome) {
      if (homeScrollSpyId === 'services') return ['sec-services'];
      if (homeScrollSpyId === 'products') return ['sec-products'];
      if (homeScrollSpyId === 'about') return ['sec-about'];
      return ['home'];
    }
    return [location.pathname];
  }, [isAuthenticated, isHome, homeScrollSpyId, location.pathname]);

  const isAppEntryActive = location.pathname === landingPath;

  const desktopPublicCenter = (
    <Space size={4} align="center" wrap>
      <Button
        type="text"
        icon={<HomeOutlined />}
        onClick={() => navigate({ pathname: ROUTES.HOME, hash: '' })}
        style={navTextButtonStyle(isHome && homeScrollSpyId === 'home-top', token)}
      >
        {t('nav.home')}
      </Button>
      <Button
        type="text"
        onClick={() => goToHomeSection('services')}
        style={navTextButtonStyle(isHome && homeScrollSpyId === 'services', token)}
      >
        {t('nav.sectionServices')}
      </Button>
      <Button
        type="text"
        onClick={() => goToHomeSection('products')}
        style={navTextButtonStyle(isHome && homeScrollSpyId === 'products', token)}
      >
        {t('nav.sectionProducts')}
      </Button>
      <Button
        type="text"
        onClick={() => goToHomeSection('about')}
        style={navTextButtonStyle(isHome && homeScrollSpyId === 'about', token)}
      >
        {t('nav.sectionAbout')}
      </Button>
      <Dropdown menu={{ items: joinUsMenuItems }} placement="bottom" trigger={['click']}>
        <Button
          type="primary"
          shape="round"
          icon={<RocketOutlined />}
          style={{
            fontWeight: 600,
            height: 40,
            paddingInline: 18,
            boxShadow: `0 4px 14px ${token.colorPrimary}40`,
          }}
        >
          {t('nav.joinUs')} <DownOutlined style={{ fontSize: 12, opacity: 0.85 }} />
        </Button>
      </Dropdown>
    </Space>
  );

  const desktopAuthCenter = (
    <Space size={4} wrap align="center">
      <Button
        type="text"
        icon={<HomeOutlined />}
        onClick={goBrandOrAppHome}
        style={navTextButtonStyle(isAppEntryActive, token)}
      >
        {t('nav.home')}
      </Button>
      {isSuperAdmin ? (
        <Button
          type="text"
          icon={<CrownOutlined />}
          onClick={() => navigate(ROUTES.SUPER_ADMIN_DASHBOARD)}
          style={navTextButtonStyle(location.pathname.startsWith('/superadmin'), token)}
        >
          {t('nav.superadmin')}
        </Button>
      ) : (
        <Button
          type="text"
          icon={<AppstoreOutlined />}
          onClick={() => navigate(portalEntryRoute)}
          style={navTextButtonStyle(location.pathname.startsWith('/portal'), token)}
        >
          {t('nav.portal')}
        </Button>
      )}
      <Button
        type="text"
        icon={<BellOutlined />}
        onClick={() => navigate(notificationsRoute)}
        style={navTextButtonStyle(location.pathname.includes('notification'), token)}
      >
        {t('nav.notifications')}
      </Button>
    </Space>
  );

  const desktopRightTools = (
    <Space size={4} align="center">
      {isAuthenticated && (
        <Text type="secondary" style={{ maxWidth: 140, fontSize: 13 }} ellipsis title={displayName}>
          {displayName}
        </Text>
      )}
      <Dropdown menu={{ items: langMenuItems }} placement="bottomRight" trigger={['click']}>
        <Button type="text" shape="circle" size="large" icon={<GlobalOutlined />} aria-label={LANGUAGES.find((l) => l.code === lang)?.label} />
      </Dropdown>
      <Button
        type="text"
        shape="circle"
        size="large"
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
      />
      {isAuthenticated && <NotificationBellDropdown allNotificationsPath={notificationsRoute} placement="bottomRight" />}
      {isAuthenticated && (
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <Button type="text" shape="circle" size="large" icon={<UserOutlined />} aria-label={t('nav.account')} />
        </Dropdown>
      )}
    </Space>
  );

  const barBg =
    theme === 'dark' ? 'rgba(11, 18, 32, 0.78)' : 'rgba(255, 255, 255, 0.82)';
  const barBorder = theme === 'dark' ? 'rgba(255,255,255,0.08)' : token.colorBorderSecondary;

  return (
    <>
      <div
        style={{
          position: 'relative',
          zIndex: 100,
          width: '100%',
          borderBottom: `1px solid ${barBorder}`,
          background: barBg,
          backdropFilter: 'saturate(1.2) blur(14px)',
          WebkitBackdropFilter: 'saturate(1.2) blur(14px)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: isHome ? '12px 20px' : '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {isDesktop ? (
            <>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  type="text"
                  onClick={goBrandOrAppHome}
                  style={{
                    height: isHome ? 56 : 44,
                    paddingInline: isHome ? 4 : 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                  aria-label={t('app.shortName')}
                >
                  <KamelLogo
                    variant={navLogoVariant}
                    height={navLogoHeightDesktop}
                    alt=""
                    style={
                      isHome
                        ? {
                            height: 'clamp(44px, 5.5vw, 60px)',
                            width: 'auto',
                            maxWidth: 'min(360px, 42vw)',
                          }
                        : undefined
                    }
                  />
                </Button>
              </div>
              <div
                style={{
                  flex: '0 1 auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {isAuthenticated ? desktopAuthCenter : desktopPublicCenter}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {desktopRightTools}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 16 }}>
              <Button
                type="link"
                onClick={goBrandOrAppHome}
                style={{ height: isHome ? 48 : 40, padding: 0, display: 'inline-flex', alignItems: 'center' }}
                aria-label={t('app.shortName')}
              >
                <KamelLogo
                  variant={navLogoVariant}
                  height={navLogoHeightMobile}
                  alt=""
                  style={
                    isHome
                      ? {
                          height: 'clamp(38px, 11vw, 52px)',
                          width: 'auto',
                          maxWidth: 'min(300px, 62vw)',
                        }
                      : undefined
                  }
                />
              </Button>
              <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} style={{ fontSize: 18 }} aria-label="Menu" />
            </div>
          )}
        </div>
      </div>

      <Drawer
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <KamelLogo variant={navLogoVariant} height={navLogoDrawerHeight} alt="" />
            <span style={{ fontWeight: 600 }}>{t('app.shortName')}</span>
          </span>
        }
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
          <Dropdown menu={{ items: langMenuItems }} placement="topRight" trigger={['click']}>
            <Button icon={<GlobalOutlined />} block style={{ marginBottom: 8 }}>
              {LANGUAGES.find((l) => l.code === lang)?.label}
            </Button>
          </Dropdown>
          <Button icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} block style={{ marginBottom: 8 }}>
            {theme === 'dark' ? t('theme.light') : t('theme.dark')}
          </Button>
          {isAuthenticated && (
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout} block>
              {t('nav.logout')}
            </Button>
          )}
        </div>
      </Drawer>
    </>
  );
}
