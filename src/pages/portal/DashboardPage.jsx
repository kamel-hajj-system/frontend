import React from 'react';
import { Card, Typography } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { PortalTitleIcon } from '../../components/portal/PortalTitleIcon';

const { Title, Paragraph } = Typography;

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const displayName = user?.fullNameAr || user?.fullName || user?.email || '';

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <PortalTitleIcon>
          <DashboardOutlined />
        </PortalTitleIcon>
        {t('portal.dashboardTitle')}
      </Title>
      <Card>
        <Paragraph type="secondary">
          {t('portal.welcome')}, <strong>{displayName}</strong>.
        </Paragraph>
      </Card>
    </div>
  );
}
