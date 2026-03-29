import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { CheckCircleOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getSupervisorPendingRegistrations, approveSupervisorPendingUser } from '../../../../api/users';
import { USER_TYPES, SUPERVISOR_ASSIGNABLE_ROLES } from '../../../../utils/constants';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';

const { Paragraph, Text } = Typography;

export function SupervisorPendingApprovalsPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [roleById, setRoleById] = useState({});
  const [approvingId, setApprovingId] = useState(null);

  const isCompanySupervisor =
    user?.userType === USER_TYPES.COMPANY && user?.role === 'Supervisor';

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSupervisorPendingRegistrations();
      const list = res.data || [];
      setRows(list);
      const initial = {};
      list.forEach((r) => {
        const role = r.role || 'EmpRead';
        initial[r.id] = SUPERVISOR_ASSIGNABLE_ROLES.includes(role) ? role : 'EmpRead';
      });
      setRoleById(initial);
    } catch (err) {
      message.error(err?.message || (isAr ? 'تعذر تحميل الطلبات' : 'Failed to load pending users'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    if (isCompanySupervisor) fetchList();
  }, [isCompanySupervisor, fetchList]);

  const setRole = (id, role) => {
    setRoleById((prev) => ({ ...prev, [id]: role }));
  };

  const approve = async (record) => {
    const role = roleById[record.id] || 'EmpRead';
    setApprovingId(record.id);
    try {
      await approveSupervisorPendingUser(record.id, role);
      message.success(t('supervisorPending.approvedOk'));
      fetchList();
    } catch (err) {
      message.error(err?.message || (isAr ? 'فشل القبول' : 'Approval failed'));
    } finally {
      setApprovingId(null);
    }
  };

  if (!isCompanySupervisor) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const columns = [
    {
      title: t('hrPending.colName'),
      key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.fullName || '—'}</div>
          {r.fullNameAr ? (
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }} dir="rtl">
              {r.fullNameAr}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: t('hrPending.colEmail'),
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: t('supervisorPending.colLocation'),
      key: 'loc',
      ellipsis: true,
      render: (_, r) =>
        r.shiftLocation?.name ? <Text type="secondary">{r.shiftLocation.name}</Text> : '—',
    },
    {
      title: t('hrPending.colRequested'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v) =>
        v ? new Date(v).toLocaleString(isAr ? 'ar-SA' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '—',
    },
    {
      title: t('hrPending.colRole'),
      key: 'role',
      width: 200,
      render: (_, record) => (
        <Select
          size="middle"
          style={{ minWidth: 140 }}
          value={roleById[record.id] || 'EmpRead'}
          onChange={(v) => setRole(record.id, v)}
          options={SUPERVISOR_ASSIGNABLE_ROLES.map((r) => ({
            value: r,
            label: t(`roles.${r}`),
          }))}
        />
      ),
    },
    {
      title: t('hrPending.colAction'),
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          size="small"
          loading={approvingId === record.id}
          onClick={() => approve(record)}
        >
          {t('hrPending.approve')}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <TeamOutlined />
          {t('supervisorPending.title')}
        </Space>
      }
      extra={<Tag color="processing">{t('supervisorPending.badge')}</Tag>}
    >
      <Paragraph type="secondary" style={{ marginBottom: 16, marginTop: 0 }}>
        {t('supervisorPending.intro')}
      </Paragraph>
      <ResponsiveTable
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: t('supervisorPending.empty') }}
        scroll={{ x: 800 }}
      />
    </Card>
  );
}
