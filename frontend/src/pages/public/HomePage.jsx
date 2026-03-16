import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Space, Typography } from 'antd';
import { LoginOutlined, UserAddOutlined, TeamOutlined, HomeOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROUTES } from '../../utils/constants';

const { Title, Paragraph } = Typography;

export function HomePage() {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: 896, margin: '0 auto', padding: '48px 16px' }}>
      <Card>
        <div style={{ textAlign: 'center' }}>
          <HomeOutlined style={{ fontSize: 48, color: 'var(--color-primary)', marginBottom: 16 }} />
          <Title level={2}>{t('app.name')}</Title>
          <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 32 }}>
            {t('nav.home')}
          </Paragraph>
          <Space size="middle" wrap style={{ justifyContent: 'center' }}>
            <Link to={ROUTES.LOGIN}>
              <Button size="large" type="primary" icon={<LoginOutlined />}>
                {t('nav.login')}
              </Button>
            </Link>
            <Link to={ROUTES.SIGN_UP_NORMAL}>
              <Button size="large" icon={<UserAddOutlined />}>{t('nav.signUpNormal')}</Button>
            </Link>
            <Link to={ROUTES.SIGN_UP_SERVICE_CENTER}>
              <Button size="large" type="primary" icon={<TeamOutlined />}>{t('nav.signUpServiceCenter')}</Button>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}
