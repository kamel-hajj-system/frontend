import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Input, Space, Tag, Typography, message } from 'antd';
import { TeamOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getMyEmployees } from '../../../../api/users';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';
import { USER_TYPES } from '../../../../utils/constants';

const { Title, Text } = Typography;

function renderPersonName(isAr, u) {
  const primary = (isAr ? u.fullNameAr : u.fullName) || u.fullName || u.fullNameAr || u.email || '';
  const secondary = (isAr ? u.fullName : u.fullNameAr) || null;
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{primary}</div>
      {secondary ? <div style={{ fontSize: 12, opacity: 0.7 }}>{secondary}</div> : null}
    </div>
  );
}

export function EmployeesPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);

  const canView = user?.userType === USER_TYPES.COMPANY && user?.role === 'Supervisor';

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyEmployees({ q, includeInactive: true });
      setRows(res.data || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [q, isAr]);

  useEffect(() => {
    if (canView) fetchEmployees();
  }, [canView, fetchEmployees]);

  if (!canView) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const columns = useMemo(
    () => [
      {
        title: isAr ? 'الموظف' : 'Employee',
        key: 'name',
        render: (_, r) => renderPersonName(isAr, r),
      },
      { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
      {
        title: isAr ? 'الدور' : 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (v) => <Tag>{v}</Tag>,
      },
      {
        title: isAr ? 'نشط' : 'Active',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (v) => (v ? <Tag color="success">{isAr ? 'نعم' : 'Yes'}</Tag> : <Tag color="error">{isAr ? 'لا' : 'No'}</Tag>),
      },
    ],
    [isAr]
  );

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <TeamOutlined /> {t('portal.employeesTitle')}
      </Title>

      <Card
        style={{ marginBottom: 16 }}
        bodyStyle={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={fetchEmployees}
          allowClear
          style={{ width: 320, maxWidth: '100%' }}
          prefix={<SearchOutlined />}
          placeholder={isAr ? 'بحث: اسم/إيميل/جوال' : 'Search: name/email/phone'}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchEmployees} loading={loading}>
          {isAr ? 'تحديث' : 'Refresh'}
        </Button>
        <Space>
          <Badge count={rows.length} showZero color="#1677ff" />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isAr ? 'موظف تحتك' : 'employee(s) under you'}
          </Text>
        </Space>
      </Card>

      <Card>
        <ResponsiveTable rowKey="id" columns={columns} dataSource={rows} loading={loading} pagination={false} />
      </Card>
    </div>
  );
}

