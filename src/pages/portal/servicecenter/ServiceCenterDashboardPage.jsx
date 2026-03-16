import React from 'react';
import { Card, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const { Title, Paragraph } = Typography;

export function ServiceCenterDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const displayName = user?.fullNameAr || user?.fullName || user?.email || '';

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <TeamOutlined /> {t('portal.serviceCenterDashboardTitle')}
      </Title>
      <Card>
        <Paragraph type="secondary">
          {t('portal.welcome')}, <strong>{displayName}</strong>.
        </Paragraph>
      </Card>
    </div>
  );
}
