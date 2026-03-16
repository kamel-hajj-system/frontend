import React from 'react';
import { Card, Typography, Button, Space, Tag, message } from 'antd';
import { SafetyOutlined, TeamOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { USER_TYPES } from '../../utils/constants';

const { Title, Paragraph, Text } = Typography;

export function TestPermissionRolePage() {
  const { user, hasPermission, permissionNames } = useAuth();
  const { t } = useLanguage();

  const isAdmin = user?.role === 'Admin';
  const isSupervisor = user?.role === 'Supervisor';
  const isEmployee = user?.role === 'Employee';

  const handleAdminAction = () => {
    if (isAdmin) {
      message.success(t('portal.test.adminSuccess'));
    } else {
      message.warning(t('portal.test.adminDenied'));
    }
  };

  const handleSupervisorAction = () => {
    if (isSupervisor || isAdmin) {
      message.success(t('portal.test.supervisorSuccess'));
    } else {
      message.warning(t('portal.test.supervisorDenied'));
    }
  };

  const handleEmployeeAction = () => {
    if (isEmployee || isSupervisor || isAdmin) {
      message.success(t('portal.test.employeeSuccess'));
    } else {
      message.warning(t('portal.test.employeeDenied'));
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        <SafetyOutlined /> {t('portal.test.title')}
      </Title>

      <Card title={t('portal.test.yourInfo')} style={{ marginBottom: 16 }}>
        <Paragraph>
          <Text strong>{t('signUp.fullName')}:</Text> {user?.fullName || user?.fullNameAr || '—'}
        </Paragraph>
        <Paragraph>
          <Text strong>{t('auth.email')}:</Text> {user?.email || '—'}
        </Paragraph>
        <Paragraph>
          <Text strong>{t('superadmin.userType')}:</Text>{' '}
          <Tag color={user?.userType === USER_TYPES.COMPANY ? 'blue' : 'green'}>
            {user?.userType || '—'}
          </Tag>
        </Paragraph>
        <Paragraph>
          <Text strong>{t('superadmin.role')}:</Text>{' '}
          <Tag color={user?.role === 'Admin' ? 'red' : user?.role === 'Supervisor' ? 'orange' : 'default'}>
            {user?.role || '—'}
          </Tag>
        </Paragraph>
      </Card>

      <Card title={t('portal.test.yourPermissions')} style={{ marginBottom: 16 }}>
        {permissionNames?.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {permissionNames.map((name) => (
              <Tag key={name}>{name}</Tag>
            ))}
          </div>
        ) : (
          <Text type="secondary">{t('portal.test.noPermissions')}</Text>
        )}
      </Card>

      <Card title={t('portal.test.testRoles')}>
        <Paragraph type="secondary">{t('portal.test.testRolesHint')}</Paragraph>
        <Space wrap size="middle">
          <Button
            type="primary"
            icon={isAdmin ? <CheckCircleOutlined /> : <StopOutlined />}
            onClick={handleAdminAction}
          >
            {t('portal.test.adminOnly')}
          </Button>
          <Button
            type="default"
            icon={isSupervisor || isAdmin ? <CheckCircleOutlined /> : <StopOutlined />}
            onClick={handleSupervisorAction}
          >
            {t('portal.test.supervisorOnly')}
          </Button>
          <Button
            type="default"
            icon={<TeamOutlined />}
            onClick={handleEmployeeAction}
          >
            {t('portal.test.employeeOrAbove')}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
