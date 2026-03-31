import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Form, Input, Select, Space, Tag, Typography, message } from 'antd';
import { TeamOutlined, ReloadOutlined, SearchOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getMyEmployees, updateMyEmployeeRole } from '../../../../api/users';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';
import { USER_TYPES, SUPERVISOR_ASSIGNABLE_ROLES, PORTAL_TEAM_ACCESS } from '../../../../utils/constants';
import { PortalTitleIcon } from '../../../../components/portal/PortalTitleIcon';

const { Title, Text } = Typography;
const { Option } = Select;

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
  const { user, hasAccess } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [form] = Form.useForm();

  const canView =
    user?.userType === USER_TYPES.COMPANY &&
    (user?.role === 'Supervisor' || hasAccess(PORTAL_TEAM_ACCESS.EMPLOYEES));
  const canEditRoles = user?.role === 'Supervisor';

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

  const startEdit = (record) => {
    setEditingId(record.id);
    const r = record.role || 'EmpRead';
    form.setFieldsValue({
      role: SUPERVISOR_ASSIGNABLE_ROLES.includes(r) ? r : 'EmpRead',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  const submitEdit = async () => {
    if (!editingId) return;
    try {
      const values = await form.validateFields();
      setSavingId(editingId);
      await updateMyEmployeeRole(editingId, values.role);
      message.success(isAr ? 'تم تحديث الدور' : 'Role updated');
      setEditingId(null);
      form.resetFields();
      fetchEmployees();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || (isAr ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setSavingId(null);
    }
  };

  if (!canView) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const columns = useMemo(() => {
    const base = [
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
        width: 220,
        render: (v, record) =>
          canEditRoles && editingId === record.id ? (
            <Form.Item name="role" style={{ margin: 0 }} rules={[{ required: true }]}>
              <Select style={{ minWidth: 160 }}>
                {SUPERVISOR_ASSIGNABLE_ROLES.map((role) => (
                  <Option key={role} value={role}>
                    {t(`roles.${role}`)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Tag>{t(`roles.${v || 'EmpRead'}`)}</Tag>
          ),
      },
      {
        title: isAr ? 'نشط' : 'Active',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 100,
        render: (v) => (v ? <Tag color="success">{isAr ? 'نعم' : 'Yes'}</Tag> : <Tag color="error">{isAr ? 'لا' : 'No'}</Tag>),
      },
    ];
    if (!canEditRoles) return base;
    return [
      ...base,
      {
        title: isAr ? 'إجراءات' : 'Actions',
        key: 'actions',
        width: 200,
        fixed: 'right',
        render: (_, record) =>
          editingId === record.id ? (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                loading={savingId === record.id}
                onClick={submitEdit}
              >
                {isAr ? 'حفظ' : 'Save'}
              </Button>
              <Button size="small" icon={<CloseOutlined />} onClick={cancelEdit}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          ) : (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => startEdit(record)}>
              {isAr ? 'تعديل الدور' : 'Edit role'}
            </Button>
          ),
      },
    ];
  }, [isAr, editingId, savingId, t, canEditRoles]);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <PortalTitleIcon>
          <TeamOutlined />
        </PortalTitleIcon>
        {t('portal.employeesTitle')}
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
            {canEditRoles
              ? isAr
                ? 'موظف تحتك'
                : 'employee(s) under you'
              : isAr
                ? 'الموظفون المعيّنون لك'
                : 'employee(s) assigned to you'}
          </Text>
        </Space>
      </Card>

      <Card>
        <Form form={form} component={false}>
          <ResponsiveTable
            rowKey="id"
            columns={columns}
            dataSource={rows}
            loading={loading}
            pagination={false}
            scroll={{ x: 720 }}
          />
        </Form>
      </Card>
    </div>
  );
}
