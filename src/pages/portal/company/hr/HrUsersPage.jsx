import React, { useEffect, useState, useCallback } from 'react';
import { Card, Select, Tag, Button, Form, Input, Switch, message, Alert, Space, Modal } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, KeyOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getHrUsers, updateHrUser, hrResetPassword } from '../../../../api/users';
import { USER_TYPES, ROLES } from '../../../../utils/constants';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';
import { PortalTitleIcon } from '../../../../components/portal/PortalTitleIcon';

const { Option } = Select;

export function HrUsersPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [resetUser, setResetUser] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetForm] = Form.useForm();

  const canEdit = user?.isHr && (user.role === 'Supervisor' || user.role === 'EmpManage');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHrUsers({ limit: 500 });
      setUsers(res.data || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error loading users'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    if (user?.isHr) {
      fetchUsers();
    }
  }, [user?.isHr, fetchUsers]);

  if (!user?.isHr) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const filteredUsers = users.filter((u) => {
    if (u.isSuperAdmin) return false;
    if (filterType === 'company') return u.userType === USER_TYPES.COMPANY;
    if (filterType === 'serviceCenter') return u.userType === USER_TYPES.SERVICE_CENTER;
    return true;
  });

  const startEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      fullName: record.fullName || '',
      fullNameAr: record.fullNameAr || '',
      email: record.email || '',
      phone: record.phone || '',
      role: record.role || ROLES[1],
      isActive: record.isActive ?? true,
      isHr: record.isHr ?? false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.resetFields();
  };

  const submitEdit = async () => {
    try {
      const values = await form.validateFields();
      await updateHrUser(editingId, {
        fullName: values.fullName?.trim(),
        fullNameAr: values.fullNameAr?.trim() || null,
        email: values.email?.trim(),
        phone: values.phone?.trim() || null,
        role: values.role,
        isActive: values.isActive,
        isHr: values.isHr,
      });
      message.success(isAr ? 'تم التحديث' : 'Updated');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Update failed'));
    }
  };

  const openReset = (record) => {
    setResetUser(record);
    resetForm.resetFields();
  };

  const submitReset = async () => {
    if (!resetUser?.id) return;
    try {
      const values = await resetForm.validateFields();
      setResetLoading(true);
      await hrResetPassword(resetUser.id, values.newPassword);
      message.success(isAr ? 'تم إعادة تعيين كلمة المرور' : 'Password reset');
      setResetUser(null);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setResetLoading(false);
    }
  };

  const columns = [
    {
      title: isAr ? 'الاسم' : 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (v, record) =>
        editingId === record.id ? (
          <Form.Item name="fullName" style={{ margin: 0 }} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        ) : (
          v
        ),
    },
    {
      title: isAr ? 'الاسم بالعربي' : 'Name (AR)',
      dataIndex: 'fullNameAr',
      key: 'fullNameAr',
      render: (v, record) =>
        editingId === record.id ? (
          <Form.Item name="fullNameAr" style={{ margin: 0 }}>
            <Input dir="rtl" />
          </Form.Item>
        ) : (
          v || '—'
        ),
    },
    {
      title: isAr ? 'البريد' : 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (v, record) =>
        editingId === record.id ? (
          <Form.Item name="email" style={{ margin: 0 }} rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
        ) : (
          v
        ),
    },
    {
      title: isAr ? 'الهاتف' : 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (v, record) =>
        editingId === record.id ? (
          <Form.Item name="phone" style={{ margin: 0 }}>
            <Input />
          </Form.Item>
        ) : (
          v || '—'
        ),
    },
    {
      title: isAr ? 'النوع' : 'Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (v) => <Tag color={v === USER_TYPES.SERVICE_CENTER ? 'green' : 'blue'}>{v}</Tag>,
    },
    {
      title: isAr ? 'الدور' : 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (v, record) =>
        editingId === record.id ? (
          <Form.Item name="role" style={{ margin: 0 }} rules={[{ required: true }]}>
            <Select style={{ width: 120 }}>
              {ROLES.map((r) => (
                <Option key={r} value={r}>
                  {r}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Tag>{v}</Tag>
        ),
    },
    {
      title: 'HR',
      dataIndex: 'isHr',
      key: 'isHr',
      render: (v, record) =>
        editingId === record.id ? (
          <Form.Item name="isHr" valuePropName="checked" style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
        ) : v ? (
          <Tag color="purple">HR</Tag>
        ) : (
          '—'
        ),
    },
    {
      title: isAr ? 'نشط' : 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v, record) =>
        editingId === record.id ? (
          <Form.Item name="isActive" valuePropName="checked" style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
        ) : v ? (
          <Tag color="success">{isAr ? 'نعم' : 'Yes'}</Tag>
        ) : (
          <Tag color="error">{isAr ? 'لا' : 'No'}</Tag>
        ),
    },
    {
      title: isAr ? 'إجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) =>
        !canEdit ? null : editingId === record.id ? (
          <Space>
            <Button type="primary" icon={<SaveOutlined />} size="small" onClick={submitEdit}>
              {isAr ? 'حفظ' : 'Save'}
            </Button>
            <Button icon={<CloseOutlined />} size="small" onClick={cancelEdit}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => startEdit(record)}>
              {isAr ? 'تعديل' : 'Edit'}
            </Button>
            <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => openReset(record)}>
              {isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password'}
            </Button>
          </Space>
        ),
    },
  ];

  return (
    <Card
      title={
        <Space align="center" size={10}>
          <PortalTitleIcon>
            <UserOutlined />
          </PortalTitleIcon>
          <span>{t('portal.hrUsersTitle')}</span>
        </Space>
      }
      extra={
        <Select value={filterType} onChange={setFilterType} style={{ width: 200 }}>
          <Option value="all">{isAr ? 'الكل' : 'All users'}</Option>
          <Option value="company">{isAr ? 'مستخدمي الشركة' : 'Company users'}</Option>
          <Option value="serviceCenter">{isAr ? 'مستخدمي مراكز الخدمة' : 'Service Center users'}</Option>
        </Select>
      }
    >
      <Form form={form} component={false}>
        <ResponsiveTable rowKey="id" columns={columns} dataSource={filteredUsers} loading={loading} pagination={false} />
      </Form>

      <Modal
        title={isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password'}
        open={!!resetUser}
        onCancel={() => setResetUser(null)}
        onOk={submitReset}
        okText={isAr ? 'حفظ' : 'Save'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        confirmLoading={resetLoading}
      >
        {resetUser && (
          <>
            <p style={{ marginBottom: 12 }}>
              <strong>{resetUser.fullName}</strong> ({resetUser.email})
            </p>
            <Form form={resetForm} layout="vertical">
              <Form.Item name="newPassword" label={isAr ? 'كلمة المرور الجديدة' : 'New password'} rules={[{ required: true, min: 6 }]}>
                <Input.Password />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </Card>
  );
}

