import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Collapse, Input, Space, Tag, Typography, Empty, Button, Badge } from 'antd';
import { TeamOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getHrSupervisorsTree } from '../../../../api/users';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';
import { PortalTitleIcon } from '../../../../components/portal/PortalTitleIcon';

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

export function HrSupervisorsPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [data, setData] = useState([]);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHrSupervisorsTree({ q, includeInactive: true });
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    if (user?.isHr) fetchTree();
  }, [user?.isHr, fetchTree]);

  if (!user?.isHr) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const items = useMemo(() => {
    return (data || []).map((s) => {
      const employees = Array.isArray(s.employees) ? s.employees : [];
      const loc = s.shiftLocation;
      const locLabel = loc ? (isAr ? (loc.locationAr || loc.name) : loc.name) : '—';

      const columns = [
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
      ];

      const header = (
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <UserOutlined />
            {renderPersonName(isAr, s)}
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isAr ? 'الموقع' : 'Location'}: {locLabel}
            </Text>
          </Space>
          <Space>
            <Badge count={employees.length} showZero color="#1677ff" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isAr ? 'موظف' : 'employee(s)'}
            </Text>
          </Space>
        </Space>
      );

      return {
        key: s.id,
        label: header,
        children: employees.length === 0 ? (
          <Empty description={isAr ? 'لا يوجد موظفون تحت هذا المشرف' : 'No employees under this supervisor'} />
        ) : (
          <ResponsiveTable rowKey="id" columns={columns} dataSource={employees} pagination={false} />
        ),
      };
    });
  }, [data, isAr]);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <PortalTitleIcon>
          <TeamOutlined />
        </PortalTitleIcon>
        {t('portal.hrSupervisorsTitle')}
      </Title>

      <Card
        style={{ marginBottom: 16 }}
        bodyStyle={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={fetchTree}
          allowClear
          style={{ width: 320, maxWidth: '100%' }}
          placeholder={isAr ? 'بحث: اسم/إيميل/جوال' : 'Search: name/email/phone'}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchTree} loading={loading}>
          {isAr ? 'تحديث' : 'Refresh'}
        </Button>
        <Tag color="blue">
          {isAr ? 'المشرفون' : 'Supervisors'}: {(data || []).length}
        </Tag>
      </Card>

      <Card>
        <Collapse items={items} accordion bordered={false} />
      </Card>
    </div>
  );
}

