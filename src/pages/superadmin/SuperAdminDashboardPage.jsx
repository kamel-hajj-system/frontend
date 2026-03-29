import React, { useCallback, useEffect, useState } from 'react';
import {
  Table, Button, Card, Modal, Form, Input, Select, Switch,
  Space, Tag, message, Popconfirm, Typography,
} from 'antd';
import {
  UserAddOutlined, DeleteOutlined, EditOutlined,
  CrownOutlined, ReloadOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getUsers, createUser, deleteUser, updateUser } from '../../api/users';
import { getLocations } from '../../api/locations';
import { getServiceCenters } from '../../api/serviceCenters';
import { getShifts } from '../../api/shifts';
import { ROLES, USER_TYPES } from '../../utils/constants';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';

export function SuperAdminDashboardPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [users, setUsers] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);

  const [createVisible, setCreateVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [editForm] = Form.useForm();
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations).catch(() => setLocations([]));
    getShifts().then(setShifts).catch(() => setShifts([]));
    getServiceCenters().then(setServiceCenters).catch(() => setServiceCenters([]));
  }, []);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers({ limit: 200 })
      .then(setUsers)
      .catch(() => message.error(isAr ? 'حدث خطأ' : 'Error loading users'))
      .finally(() => setLoading(false));
  }, [isAr]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      await createUser({
        fullName: values.fullName?.trim(),
        fullNameAr: values.fullNameAr?.trim() || undefined,
        email: values.email?.trim(),
        password: values.password,
        phone: values.phone?.trim() || undefined,
        userType: values.userType,
        role: values.role,
        jobTitle: values.jobTitle?.trim() || undefined,
        shiftId: values.shiftId || undefined,
        locationId: values.locationId || undefined,
        supervisorId: values.supervisorId?.trim() || undefined,
        serviceCenterId: values.serviceCenterId || undefined,
        isActive: values.isActive !== false,
        isHr: values.isHr === true,
      });
      message.success(isAr ? 'تم إنشاء المستخدم' : 'User created');
      setCreateVisible(false);
      createForm.resetFields();
      fetchUsers();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success(isAr ? 'تم حذف المستخدم' : 'User deleted');
      fetchUsers();
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    }
  };

  const openEdit = (record) => {
    setEditUser(record);
    editForm.setFieldsValue({
      fullName: record.fullName || '',
      fullNameAr: record.fullNameAr || '',
      email: record.email || '',
      phone: record.phone || '',
      userType: record.userType || 'Company',
      role: record.role || 'EmpRead',
      jobTitle: record.jobTitle || '',
      locationId: record.locationId || undefined,
      shiftId: record.shiftId || undefined,
      supervisorId: record.supervisorId || '',
      serviceCenterId: record.serviceCenterId || undefined,
      isActive: record.isActive ?? true,
      isHr: record.isHr ?? false,
    });
  };

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields();
      setEditLoading(true);
      await updateUser(editUser.id, {
        fullName: values.fullName?.trim(),
        fullNameAr: values.fullNameAr?.trim() || null,
        email: values.email?.trim(),
        phone: values.phone?.trim() || null,
        userType: values.userType,
        role: values.role,
        jobTitle: values.jobTitle?.trim() || null,
        locationId: values.locationId || null,
        shiftId: values.shiftId || null,
        supervisorId: values.supervisorId?.trim() || null,
        serviceCenterId: values.serviceCenterId || null,
        isActive: values.isActive,
        isHr: values.isHr,
      });
      message.success(isAr ? 'تم تحديث المستخدم' : 'User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    {
      title: isAr ? 'الاسم' : 'Name',
      key: 'name',
      render: (_, r) => (
        <div>
          <div>{r.fullName}</div>
          {r.fullNameAr && <div style={{ fontSize: 12, color: '#888' }} dir="rtl">{r.fullNameAr}</div>}
        </div>
      ),
    },
    { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
    {
      title: isAr ? 'النوع' : 'Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (v) => <Tag color={v === 'SuperAdmin' ? 'gold' : v === 'Company' ? 'blue' : 'green'}>{v}</Tag>,
    },
    {
      title: isAr ? 'الدور' : 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: isAr ? 'الموقع' : 'Location',
      key: 'location',
      render: (_, r) => {
        const loc = r.shiftLocation || r.location;
        if (!loc) return '—';
        return isAr ? (loc.locationAr || loc.name) : loc.name;
      },
    },
    {
      title: isAr ? 'الوردية' : 'Shift',
      key: 'shift',
      render: (_, r) => {
        if (!r.shift) return '—';
        return isAr ? (r.shift.shiftAr || r.shift.name) : r.shift.name;
      },
    },
    {
      title: t('superadmin.scCenterCode'),
      key: 'sc',
      render: (_, r) => {
        const c = serviceCenters.find((x) => x.id === r.serviceCenterId);
        if (c) return <Tag color="blue">{c.code}</Tag>;
        return r.serviceCenterId ? <Typography.Text copyable={{ text: r.serviceCenterId }} type="secondary">{`${r.serviceCenterId.slice(0, 8)}…`}</Typography.Text> : '—';
      },
    },
    {
      title: 'HR',
      dataIndex: 'isHr',
      key: 'isHr',
      render: (v) => v ? <Tag color="purple">HR</Tag> : '—',
    },
    {
      title: isAr ? 'نشط' : 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => v ? <Tag color="success">{isAr ? 'نعم' : 'Yes'}</Tag> : <Tag color="error">{isAr ? 'لا' : 'No'}</Tag>,
    },
    {
      title: isAr ? 'إجراءات' : 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            {isAr ? 'تعديل' : 'Edit'}
          </Button>
          {!record.isSuperAdmin && (
            <Popconfirm
              title={isAr ? 'هل أنت متأكد؟' : 'Are you sure?'}
              onConfirm={() => handleDelete(record.id)}
              okText={isAr ? 'نعم' : 'Yes'}
              cancelText={isAr ? 'لا' : 'No'}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                {isAr ? 'حذف' : 'Delete'}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const userForm = (form, isEdit = false) => (
    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
      <Form.Item name="fullName" label={isAr ? 'الاسم بالإنجليزية' : 'Name In English'} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="fullNameAr" label={isAr ? 'الاسم بالعربي' : 'Full Name (Arabic)'}>
        <Input dir="rtl" />
      </Form.Item>
      <Form.Item name="email" label={isAr ? 'البريد الإلكتروني' : 'Email'} rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      {!isEdit && (
        <Form.Item name="password" label={isAr ? 'كلمة المرور' : 'Password'} rules={[{ required: true, min: 6 }]}>
          <Input.Password />
        </Form.Item>
      )}
      <Form.Item name="phone" label={isAr ? 'الهاتف' : 'Phone'}>
        <Input />
      </Form.Item>
      <Form.Item name="userType" label={isAr ? 'نوع المستخدم' : 'User Type'} initialValue="Company" rules={[{ required: true }]}>
        <Select options={Object.values(USER_TYPES).map((v) => ({ value: v, label: v }))} />
      </Form.Item>
      <Form.Item name="role" label={isAr ? 'الدور' : 'Role'} initialValue="EmpRead" rules={[{ required: true }]}>
        <Select options={ROLES.map((r) => ({ value: r, label: r }))} />
      </Form.Item>
      <Form.Item name="jobTitle" label={isAr ? 'المسمى الوظيفي' : 'Job Title'}>
        <Input />
      </Form.Item>
      <Form.Item name="locationId" label={isAr ? 'الموقع' : 'Location'}>
        <Select
          allowClear
          placeholder={isAr ? 'اختر الموقع' : 'Select location'}
          showSearch
          optionFilterProp="label"
          options={locations.map((l) => ({ value: l.id, label: isAr ? (l.locationAr || l.name) : l.name }))}
        />
      </Form.Item>
      <Form.Item name="shiftId" label={isAr ? 'الوردية' : 'Shift'}>
        <Select
          allowClear
          placeholder={isAr ? 'اختر الوردية' : 'Select shift'}
          showSearch
          optionFilterProp="label"
          options={shifts.map((s) => ({ value: s.id, label: isAr ? (s.shiftAr || s.name) : s.name }))}
        />
      </Form.Item>
      <Form.Item name="supervisorId" label={isAr ? 'معرف المشرف' : 'Supervisor ID'}>
        <Input placeholder="UUID" />
      </Form.Item>
      <Form.Item name="serviceCenterId" label={t('signUp.serviceCenterId')}>
        <Select
          allowClear
          placeholder={isAr ? 'اختر مركز الخدمة' : 'Select service center'}
          showSearch
          optionFilterProp="label"
          options={serviceCenters.map((c) => {
            const labelName = isAr ? c.nameAr || c.name : c.name;
            return {
              value: c.id,
              label: labelName ? `[${c.code}] ${labelName}` : `[${c.code}]`,
            };
          })}
        />
      </Form.Item>
      <Form.Item name="isHr" label="HR" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>
      <Form.Item name="isActive" label={isAr ? 'نشط' : 'Active'} valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <Card
        title={
          <Space>
            <CrownOutlined />
            <span>{isAr ? 'إدارة المستخدمين' : 'Users Management'}</span>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => { setCreateVisible(true); createForm.resetFields(); }}>
              {isAr ? 'إضافة مستخدم' : 'Add User'}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              {isAr ? 'تحديث' : 'Refresh'}
            </Button>
          </Space>
        }
      >
        <p style={{ marginBottom: 16 }}>
          {isAr ? 'إجمالي المستخدمين' : 'Total users'}: <strong>{users.total}</strong>
        </p>
        <ResponsiveTable
          rowKey="id"
          columns={columns}
          dataSource={users.data}
          loading={loading}
          pagination={false}
          locale={{ emptyText: isAr ? 'لا يوجد مستخدمين' : 'No users' }}
        />
      </Card>

      <Modal
        title={isAr ? 'إضافة مستخدم جديد' : 'Add New User'}
        open={createVisible}
        onCancel={() => { setCreateVisible(false); createForm.resetFields(); }}
        onOk={handleCreate}
        confirmLoading={createLoading}
        okText={isAr ? 'إنشاء' : 'Create'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        width={520}
      >
        {userForm(createForm)}
      </Modal>

      <Modal
        title={isAr ? 'تعديل المستخدم' : 'Edit User'}
        open={!!editUser}
        onCancel={() => setEditUser(null)}
        onOk={handleEdit}
        confirmLoading={editLoading}
        okText={isAr ? 'حفظ' : 'Save'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        width={520}
      >
        {editUser && userForm(editForm, true)}
      </Modal>
    </div>
  );
}
