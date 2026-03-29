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
import {
  CheckCircleOutlined,
  TeamOutlined,
  UserOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getHrPendingRegistrations, approveHrPendingUser } from '../../../../api/users';
import { USER_TYPES, ROLES } from '../../../../utils/constants';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';

const { Paragraph, Text } = Typography;

export function HrPendingApprovalsPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [roleById, setRoleById] = useState({});
  const [approvingId, setApprovingId] = useState(null);

  const canApprove = user?.isHr && (user.role === 'Supervisor' || user.role === 'EmpManage');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHrPendingRegistrations();
      const list = res.data || [];
      setRows(list);
      const initial = {};
      list.forEach((r) => {
        initial[r.id] = r.role || 'EmpRead';
      });
      setRoleById(initial);
    } catch (err) {
      message.error(err?.message || (isAr ? 'تعذر تحميل الطلبات' : 'Failed to load pending users'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    if (user?.isHr) fetchList();
  }, [user?.isHr, fetchList]);

  const setRole = (id, role) => {
    setRoleById((prev) => ({ ...prev, [id]: role }));
  };

  const approve = async (record) => {
    const role = roleById[record.id] || 'EmpRead';
    setApprovingId(record.id);
    try {
      await approveHrPendingUser(record.id, role);
      message.success(t('hrPending.approvedOk'));
      fetchList();
    } catch (err) {
      message.error(err?.message || (isAr ? 'فشل القبول' : 'Approval failed'));
    } finally {
      setApprovingId(null);
    }
  };

  if (!user?.isHr) {
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
      title: t('hrPending.colType'),
      key: 'userType',
      width: 140,
      render: (_, r) =>
        r.userType === USER_TYPES.SERVICE_CENTER ? (
          <Tag icon={<BankOutlined />} color="blue">
            {t('hrPending.typeServiceCenter')}
          </Tag>
        ) : (
          <Tag icon={<TeamOutlined />} color="cyan">
            {t('hrPending.typeCompany')}
          </Tag>
        ),
    },
    {
      title: t('hrPending.colLocation'),
      key: 'loc',
      ellipsis: true,
      render: (_, r) => {
        if (r.userType === USER_TYPES.SERVICE_CENTER && r.serviceCenter) {
          const c = r.serviceCenter;
          const label = isAr ? c.nameAr || c.name || c.code : c.name || c.code || c.id;
          return (
            <Text type="secondary">
              [{c.code}] {label}
            </Text>
          );
        }
        if (r.shiftLocation?.name) {
          return <Text type="secondary">{r.shiftLocation.name}</Text>;
        }
        return '—';
      },
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
      render: (_, record) =>
        canApprove ? (
          <Select
            size="middle"
            style={{ minWidth: 140 }}
            value={roleById[record.id] || 'EmpRead'}
            onChange={(v) => setRole(record.id, v)}
            options={ROLES.map((r) => ({
              value: r,
              label: t(`roles.${r}`),
            }))}
          />
        ) : (
          <Tag>{t(`roles.${record.role || 'EmpRead'}`)}</Tag>
        ),
    },
    {
      title: t('hrPending.colAction'),
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) =>
        canApprove ? (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            size="small"
            loading={approvingId === record.id}
            onClick={() => approve(record)}
          >
            {t('hrPending.approve')}
          </Button>
        ) : (
          <Text type="secondary">{t('hrPending.viewOnly')}</Text>
        ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          {t('hrPending.title')}
        </Space>
      }
      extra={
        canApprove ? (
          <Tag color="processing">{t('hrPending.badgeCanApprove')}</Tag>
        ) : (
          <Tag>{t('hrPending.badgeViewOnly')}</Tag>
        )
      }
    >
      <Paragraph type="secondary" style={{ marginBottom: 16, marginTop: 0 }}>
        {t('hrPending.intro')}
      </Paragraph>
      <ResponsiveTable
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        locale={{ emptyText: t('hrPending.empty') }}
        scroll={{ x: 960 }}
      />
    </Card>
  );
}
