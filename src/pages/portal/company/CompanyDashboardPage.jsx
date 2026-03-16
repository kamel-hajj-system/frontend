import React from 'react';
import { Card, Typography } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const { Title, Paragraph } = Typography;

export function CompanyDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const displayName = user?.fullNameAr || user?.fullName || user?.email || '';

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <BankOutlined /> {t('portal.companyDashboardTitle')}
      </Title>
      <Card>
        <Paragraph type="secondary">
          {t('portal.welcome')}, <strong>{displayName}</strong>.
        </Paragraph>
      </Card>
    </div>
  );
}
