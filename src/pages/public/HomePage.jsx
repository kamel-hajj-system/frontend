import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, Col, Row, Space, Typography, theme as antTheme } from 'antd';
import {
  LoginOutlined,
  UserAddOutlined,
  TeamOutlined,
  RocketOutlined,
  CloudOutlined,
  MobileOutlined,
  CompassOutlined,
  ScheduleOutlined,
  IdcardOutlined,
  BellOutlined,
  BarChartOutlined,
  ArrowRightOutlined,
  MailOutlined,
} from '@ant-design/icons';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROUTES } from '../../utils/constants';
import { KamelLogo } from '../../components/common/KamelLogo';
import '../../styles/homePage.css';

const { Title, Paragraph, Text } = Typography;

const SERVICE_ICONS = [ScheduleOutlined, IdcardOutlined, BellOutlined, BarChartOutlined];

export function HomePage() {
  const { token } = antTheme.useToken();
  const location = useLocation();
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  /** Public home uses dedicated light/dark marketing artwork (not portal LightMode/DarkMood). */
  const homeLogoVariant = theme === 'dark' ? 'darkPublic' : 'lightPublic';
  const isAr = lang === 'ar';
  const year = new Date().getFullYear();

  useEffect(() => {
    const id = (location.hash || '').replace(/^#/, '');
    if (!id) return;
    const frame = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  const services = [
    { titleKey: 'home.service1Title', descKey: 'home.service1Desc' },
    { titleKey: 'home.service2Title', descKey: 'home.service2Desc' },
    { titleKey: 'home.service3Title', descKey: 'home.service3Desc' },
    { titleKey: 'home.service4Title', descKey: 'home.service4Desc' },
  ];

  const clients = ['WAZN', 'Ekram Aldyf','UTrust'];

  const muted = { color: token.colorTextSecondary };

  const homeCssVars = {
    '--ant-color-primary': token.colorPrimary,
    '--ant-color-primary-bg': token.colorPrimaryBg,
    '--ant-color-warning': token.colorWarning,
  };

  return (
    <div className="kamel-home" data-theme={theme} style={homeCssVars}>
      {/* Hero */}
      <section
        id="home-top"
        className="kamel-home-hero"
        style={{
          background: `linear-gradient(180deg, ${token.colorBgLayout} 0%, ${token.colorBgContainer} 38%, ${token.colorBgLayout} 100%)`,
        }}
      >
        <div className="kamel-home-hero__mesh" aria-hidden />
        <div className="kamel-home-hero__orbs" aria-hidden>
          <div className="kamel-home-hero__orb kamel-home-hero__orb--a" />
          <div className="kamel-home-hero__orb kamel-home-hero__orb--b" />
        </div>
        <div className="kamel-home-hero-grid">
          <div className="kamel-home-hero-copy" style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div className="kamel-home-pill" style={{ color: token.colorPrimary }}>
              <RocketOutlined />
              {t('home.heroBadge')}
            </div>
            <Title
              level={1}
              style={{
                fontSize: 'clamp(2.125rem, 5vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.08,
                marginBottom: 22,
                marginTop: 0,
              }}
            >
              {t('home.heroTitle')}
            </Title>
            <Paragraph
              style={{
                fontSize: 'clamp(16px, 2.1vw, 18px)',
                ...muted,
                marginBottom: 36,
                lineHeight: 1.7,
                maxWidth: 540,
              }}
            >
              {t('home.heroSubtitle')}
            </Paragraph>
            <Space size="middle" wrap>
              <Link to={ROUTES.SIGN_UP_NORMAL}>
                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  icon={<UserAddOutlined />}
                  style={{ height: 50, paddingInline: 28, fontWeight: 600, boxShadow: `0 8px 24px ${token.colorPrimary}40` }}
                >
                  {t('home.ctaStart')}
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button size="large" shape="round" icon={<LoginOutlined />} style={{ height: 50, paddingInline: 24, fontWeight: 600 }}>
                  {t('home.ctaSignIn')}
                </Button>
              </Link>
              <Link to={ROUTES.SIGN_UP_SERVICE_CENTER}>
                <Button size="large" type="link" icon={<TeamOutlined />} style={{ height: 50, fontWeight: 600 }}>
                  {t('nav.signUpServiceCenter')}
                </Button>
              </Link>
            </Space>
          </div>
          <div className="kamel-home-hero-preview" aria-hidden>
            <div className="kamel-home-hero-preview__inner">
              <div className="kamel-home-hero-preview__chrome">
                <span className="kamel-home-hero-preview__dot" />
                <span className="kamel-home-hero-preview__dot" />
                <span className="kamel-home-hero-preview__dot" />
              </div>
              <div className="kamel-home-hero-preview__rows">
                <div className="kamel-home-hero-preview__row" />
                <div className="kamel-home-hero-preview__row" />
                <div className="kamel-home-hero-preview__row" />
                <div className="kamel-home-hero-preview__row" />
              </div>
              <div className="kamel-home-hero-preview__cards">
                <div className="kamel-home-hero-preview__mini">
                  <div className="kamel-home-hero-preview__mini-bar" />
                  <div className="kamel-home-hero-preview__mini-line" style={{ width: '100%' }} />
                  <div className="kamel-home-hero-preview__mini-line" style={{ width: '70%' }} />
                </div>
                <div className="kamel-home-hero-preview__mini">
                  <div className="kamel-home-hero-preview__mini-bar" style={{ width: '40%' }} />
                  <div className="kamel-home-hero-preview__mini-line" style={{ width: '100%' }} />
                  <div className="kamel-home-hero-preview__mini-line" style={{ width: '55%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="kamel-home-section" style={{ background: token.colorBgContainer }}>
        <div className="kamel-home-container">
          <div
            className="kamel-home-section-head"
            style={{ textAlign: isAr ? 'right' : 'left' }}
          >
            <div className="kamel-home-kicker" style={{ color: token.colorPrimary }}>
              {t('home.servicesKicker')}
            </div>
            <Title level={2} className="kamel-home-title-h2">
              {t('home.servicesTitle')}
            </Title>
            <Paragraph style={{ ...muted, fontSize: 17, maxWidth: 580, marginTop: 14, marginBottom: 0, lineHeight: 1.65 }}>
              {t('home.servicesLead')}
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            {services.map((s, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <Col xs={24} sm={12} lg={6} key={s.titleKey}>
                  <Card
                    className="kamel-home-card-lift"
                    bordered={false}
                    style={{
                      height: '100%',
                      background: token.colorFillAlter,
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <div className="kamel-home-service-icon-wrap">
                      <Icon style={{ fontSize: 24 }} />
                    </div>
                    <Title level={5} style={{ marginTop: 0, marginBottom: 10, fontWeight: 700 }}>
                      {t(s.titleKey)}
                    </Title>
                    <Paragraph style={{ ...muted, marginBottom: 0, lineHeight: 1.6 }}>{t(s.descKey)}</Paragraph>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="kamel-home-section" style={{ background: token.colorBgLayout }}>
        <div className="kamel-home-container">
          <div
            className="kamel-home-section-head"
            style={{ textAlign: isAr ? 'right' : 'left' }}
          >
            <div className="kamel-home-kicker" style={{ color: token.colorPrimary }}>
              {t('home.productsKicker')}
            </div>
            <Title level={2} className="kamel-home-title-h2">
              {t('home.productsTitle')}
            </Title>
            <Paragraph style={{ ...muted, fontSize: 17, maxWidth: 640, marginTop: 14, marginBottom: 0, lineHeight: 1.65 }}>
              {t('home.productsLead')}
            </Paragraph>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="kamel-home-product-ring" style={{ height: '100%' }}>
                <div className="kamel-home-product-inner" style={{ padding: 28 }}>
                  <CloudOutlined style={{ fontSize: 38, color: token.colorPrimary, marginBottom: 14 }} />
                  <span className="kamel-home-product-badge">{t('home.badgeWeb')}</span>
                  <Title level={4} style={{ marginTop: 12, marginBottom: 12, fontWeight: 700 }}>
                    {t('home.productWebTitle')}
                  </Title>
                  <Paragraph style={{ ...muted, marginBottom: 22, lineHeight: 1.65 }}>{t('home.productWebDesc')}</Paragraph>
                  <Link to={ROUTES.LOGIN}>
                    <Button type="link" icon={<ArrowRightOutlined />} iconPosition="end" style={{ padding: 0, fontWeight: 600, height: 'auto' }}>
                      {t('home.ctaSignIn')}
                    </Button>
                  </Link>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="kamel-home-product-ring" style={{ height: '100%' }}>
                <div className="kamel-home-product-inner" style={{ padding: 28 }}>
                  <MobileOutlined style={{ fontSize: 38, color: token.colorPrimary, marginBottom: 14 }} />
                  <span className="kamel-home-product-badge">{t('home.badgeMobile')}</span>
                  <Title level={4} style={{ marginTop: 12, marginBottom: 12, fontWeight: 700 }}>
                    {t('home.productEmployeeTitle')}
                  </Title>
                  <Paragraph style={{ ...muted, marginBottom: 14, lineHeight: 1.65 }}>{t('home.productEmployeeDesc')}</Paragraph>
                  {/* <span className="kamel-home-coming-badge">{t('home.comingSoon')}</span> */}
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="kamel-home-product-ring" style={{ height: '100%' }}>
                <div className="kamel-home-product-inner" style={{ padding: 28 }}>
                  <CompassOutlined style={{ fontSize: 38, color: token.colorPrimary, marginBottom: 14 }} />
                  <span className="kamel-home-product-badge">{t('home.badgeMobile')}</span>
                  <Title level={4} style={{ marginTop: 12, marginBottom: 12, fontWeight: 700 }}>
                    {t('home.productPilgrimTitle')}
                  </Title>
                  <Paragraph style={{ ...muted, marginBottom: 14, lineHeight: 1.65 }}>{t('home.productPilgrimDesc')}</Paragraph>
                  {/* <span className="kamel-home-coming-badge">{t('home.comingSoon')}</span> */}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* About */}
      <section id="about" className="kamel-home-section" style={{ background: token.colorBgContainer }}>
        <div className="kamel-home-container">
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div className="kamel-home-kicker" style={{ color: token.colorPrimary }}>
                {t('home.aboutKicker')}
              </div>
              <Title level={2} className="kamel-home-title-h2" style={{ marginTop: 0 }}>
                {t('home.aboutTitle')}
              </Title>
              <Paragraph style={{ fontSize: 17, fontWeight: 500 }}>{t('home.aboutLead')}</Paragraph>
              <Paragraph style={{ ...muted, fontSize: 16, lineHeight: 1.75 }}>{t('home.aboutBody')}</Paragraph>
            </Col>
            <Col xs={24} lg={12}>
              <div className="kamel-home-about-panel">
                <div className="kamel-home-about-panel__bg" aria-hidden />
                <div className="kamel-home-about-panel__grid" aria-hidden />
                <div className="kamel-home-about-panel__content">
                  <div className="kamel-home-about-panel__logo-ring">
                    <KamelLogo
                      variant={homeLogoVariant}
                      fullWidth
                      alt={t('app.shortName')}
                      style={{
                        maxHeight: 'clamp(80px, 16vw, 120px)',
                        width: '100%',
                        height: 'auto',
                      }}
                    />
                  </div>
                  <Text style={{ fontSize: 15, ...muted, lineHeight: 1.65 }}>
                    {t('app.name')} — {t('home.footerTagline')}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="kamel-home-section" style={{ background: token.colorBgLayout }}>
        <div className="kamel-home-container">
          <div
            className="kamel-home-vision"
            style={{
              background: token.colorBgContainer,
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="kamel-home-kicker" style={{ color: token.colorPrimary }}>
                {t('home.visionKicker')}
              </div>
              <Title level={2} className="kamel-home-title-h2" style={{ marginTop: 0, marginBottom: 20 }}>
                {t('home.visionTitle')}
              </Title>
              <div className="kamel-home-vision__quote-mark" aria-hidden>
                “
              </div>
              <blockquote
                style={{
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  fontSize: 'clamp(1.2rem, 2.6vw, 1.75rem)',
                  fontWeight: 600,
                  lineHeight: 1.55,
                  fontStyle: 'italic',
                  color: token.colorText,
                  maxWidth: 920,
                }}
              >
                {t('home.visionQuote')}
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section id="clients" className="kamel-home-section" style={{ background: token.colorBgContainer }}>
        <div className="kamel-home-container">
          <div className="kamel-home-section-head--center">
            <div className="kamel-home-kicker" style={{ color: token.colorPrimary }}>
              {t('home.clientsKicker')}
            </div>
            <Title level={2} className="kamel-home-title-h2">
              {t('home.clientsTitle')}
            </Title>
            {/* <Paragraph style={{ ...muted, fontSize: 16, maxWidth: 540, margin: '14px auto 0', lineHeight: 1.65 }}>
              {t('home.clientsLead')}
            </Paragraph> */}
          </div>
          <Row gutter={[16, 16]} justify="center">
            {clients.map((name) => (
              <Col xs={12} sm={8} md={4} key={name}>
                <div
                  className="kamel-home-client-logo"
                  style={{
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    color: token.colorTextSecondary,
                  }}
                >
                  {name}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="kamel-home-footer"
        style={{
          background:
            theme === 'dark'
              ? 'linear-gradient(180deg, #0c1219 0%, #06080c 100%)'
              : 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
          color: 'rgba(255,255,255,0.88)',
        }}
      >
        <div className="kamel-home-container">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 16 }}>
                <span className="kamel-home-footer__brand-pill">
                  <KamelLogo
                    variant={homeLogoVariant}
                    height={64}
                    alt={t('app.shortName')}
                    style={{
                      height: 'clamp(48px, 11vw, 72px)',
                      width: 'auto',
                      maxWidth: 'min(360px, 100%)',
                    }}
                  />
                </span>
              </div>
              <Paragraph style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 0, lineHeight: 1.65 }}>{t('home.footerTagline')}</Paragraph>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Text strong style={{ color: 'rgba(255,255,255,0.95)', display: 'block', marginBottom: 16 }}>
                {t('home.footerExplore')}
              </Text>
              <Space direction="vertical" size={10}>
                <a href="#services">{t('home.servicesTitle')}</a>
                <a href="#products">{t('home.productsTitle')}</a>
                <a href="#about">{t('home.aboutTitle')}</a>
                <a href="#vision">{t('home.visionTitle')}</a>
                <a href="#clients">{t('home.clientsTitle')}</a>
              </Space>
            </Col>
            <Col xs={24} sm={8} md={5}>
              <Text strong style={{ color: 'rgba(255,255,255,0.95)', display: 'block', marginBottom: 16 }}>
                {t('home.footerProducts')}
              </Text>
              <Space direction="vertical" size={10}>
                {t('home.badgeWeb')}
                {t('home.productEmployeeTitle')}
                {t('home.productPilgrimTitle')}
              </Space>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Text strong style={{ color: 'rgba(255,255,255,0.95)', display: 'block', marginBottom: 16 }}>
                {t('home.footerContactUs')}
              </Text>
              <Space direction="vertical" size={12}>
                <a
                  href="https://wa.me/966567387950"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kamel-home-footer__contact-link"
                  aria-label="WhatsApp +966567387950"
                >
                  <WhatsAppIcon sx={{ fontSize: 22, color: '#25D366', flexShrink: 0 }} aria-hidden />
                  <span dir="ltr">+966567387950</span>
                </a>
                <a
                  href="mailto:info@kamel-app.com"
                  className="kamel-home-footer__contact-link"
                  aria-label="Email info@kamel-app.com"
                >
                  <MailOutlined style={{ fontSize: 22, opacity: 0.95, flexShrink: 0 }} aria-hidden />
                  <span dir="ltr">info@kamel-app.com</span>
                </a>
              </Space>
            </Col>
          </Row>
          <div
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {t('home.footerCopyright', { year: String(year), name: t('app.name') })}
          </div>
        </div>
      </footer>
    </div>
  );
}
