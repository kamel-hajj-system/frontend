import React from 'react';
import { Card, Typography, Alert, Button, Space, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';

const { Title, Paragraph } = Typography;

export function ReceptionDashboardPage() {
  const { user, hasAccess } = useAuth();
  const { t } = useLanguage();

  if (!hasAccess('reception.dashboard')) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const displayName = user?.fullNameAr || user?.fullName || user?.email || '';
  const role = user?.role;
  const canManage = role === 'Supervisor' || role === 'EmpManage';

  const testView = () => {
    message.success(t('portal.receptionTestViewOk'));
  };

  const testManage = () => {
    if (!canManage) {
      message.error(t('portal.receptionTestManageDenied'));
      return;
    }
    message.success(t('portal.receptionTestManageOk'));
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <InboxOutlined /> {t('portal.receptionDashboardTitle')}
      </Title>
      <Card>
        <Paragraph type="secondary">
          {t('portal.welcome')}, <strong>{displayName}</strong>.
        </Paragraph>
        <Paragraph>{t('portal.receptionDashboardIntro')}</Paragraph>

        <div style={{ marginTop: 16 }}>
          <Paragraph strong style={{ marginBottom: 8 }}>
            {t('portal.receptionTestTitle')} — {t('portal.receptionYourRole')}: <strong>{role}</strong>
          </Paragraph>
          <Space wrap>
            <Button onClick={testView}>
              {t('portal.receptionTestView')}
            </Button>
            <Button type="primary" onClick={testManage}>
              {t('portal.receptionTestManage')}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}

