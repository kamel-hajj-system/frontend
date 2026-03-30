import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { PortalTitleIcon } from '../../../../components/portal/PortalTitleIcon';

const { Title, Paragraph } = Typography;

export function HrDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user?.isHr) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const displayName = user.fullNameAr || user.fullName || user.email || '';

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <PortalTitleIcon>
          <TeamOutlined />
        </PortalTitleIcon>
        {t('portal.hrDashboardTitle')}
      </Title>
      <Card>
        <Paragraph type="secondary">
          {t('portal.welcome')}, <strong>{displayName}</strong>.
        </Paragraph>
        <Paragraph>{t('portal.hrDashboardIntro') || ''}</Paragraph>
      </Card>
    </div>
  );
}

