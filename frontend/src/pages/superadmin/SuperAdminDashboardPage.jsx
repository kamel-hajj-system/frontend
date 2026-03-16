import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, Switch, Space, Descriptions, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, KeyOutlined, TeamOutlined, SafetyOutlined, CrownOutlined, UserAddOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  assignRole,
  assignPermissions,
  createUser,
} from '../../api/users';
import { getLocations } from '../../api/locations';
import { getShifts } from '../../api/shifts';
import { getPermissions } from '../../api/permissions';
import { ROLES, PERMISSION_TO_PAGE_LABEL, USER_TYPES } from '../../utils/constants';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

export function SuperAdminDashboardPage() {
  const { t } = useLanguage();
  const [users, setUsers] = useState({ data: [], total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(true);
  const [detailsUser, setDetailsUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm] = Form.useForm();
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordForm] = Form.useForm();
  const [roleUser, setRoleUser] = useState(null);
  const [roleForm] = Form.useForm();
  const [permissionsUser, setPermissionsUser] = useState(null);
  const [permissionsForm] = Form.useForm();
  const [allPermissions, setAllPermissions] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [showPermissionsUser, setShowPermissionsUser] = useState(null);
  const [showPagesUser, setShowPagesUser] = useState(null);
  const [createUserVisible, setCreateUserVisible] = useState(false);
  const [createForm] = Form.useForm();

  useEffect(() => {
    getLocations().then(setLocations).catch(() => setLocations([]));
    getShifts().then(setShifts).catch(() => setShifts([]));
    getPermissions().then(setAllPermissions).catch(() => setAllPermissions([]));
  }, []);

  const fetchUsers = useCallback((page = 1) => {
    setLoading(true);
    getUsers({ page, limit: 50 })
      .then(setUsers)
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdate = async () => {
    if (!editUser?.id) return;
    try {
      const values = await editForm.validateFields();
      setActionLoading(true);
      await updateUser(editUser.id, values);
      message.success(t('superadmin.updateSuccess'));
      setEditUser(null);
      fetchUsers(users.page);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('superadmin.updateError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('superadmin.delete'),
      content: (
        <>
          <p>{t('superadmin.confirmDelete')}</p>
          <p><strong>{record.fullName}</strong> ({record.email})</p>
        </>
      ),
      okText: t('superadmin.yes'),
      okType: 'danger',
      cancelText: t('superadmin.no'),
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success(t('superadmin.deleteSuccess'));
          fetchUsers(users.page);
        } catch (err) {
          message.error(err?.message || t('superadmin.deleteError'));
        }
      },
    });
  };

  const handleChangePassword = async () => {
    if (!passwordUser?.id) return;
    try {
      const { currentPassword, newPassword } = await passwordForm.validateFields();
      setActionLoading(true);
      await changePassword(passwordUser.id, currentPassword, newPassword);
      message.success(t('superadmin.passwordSuccess'));
      setPasswordUser(null);
      passwordForm.resetFields();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!roleUser?.id) return;
    try {
      const { role } = await roleForm.validateFields();
      setActionLoading(true);
      await assignRole(roleUser.id, role);
      message.success(t('superadmin.roleSuccess'));
      setRoleUser(null);
      fetchUsers(users.page);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const openAssignPermissions = async (record) => {
    setPermissionsUser(record);
    try {
      const userWithPerms = await getUserById(record.id);
      const currentIds = (userWithPerms?.userPermissions || []).map((up) => up.permission?.id).filter(Boolean);
      permissionsForm.setFieldsValue({ permissionIds: currentIds });
    } catch {
      permissionsForm.setFieldsValue({ permissionIds: [] });
    }
  };

  const handleAssignPermissions = async () => {
    if (!permissionsUser?.id) return;
    try {
      const { permissionIds } = await permissionsForm.validateFields();
      setActionLoading(true);
      await assignPermissions(permissionsUser.id, permissionIds || []);
      message.success(t('superadmin.permissionsAssignSuccess'));
      setPermissionsUser(null);
      fetchUsers(users.page);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const values = await createForm.validateFields();
      setActionLoading(true);
      const payload = {
        fullName: values.fullName?.trim(),
        fullNameAr: values.fullNameAr?.trim() || undefined,
        email: values.email?.trim(),
        password: values.password,
        phone: values.phone?.trim() || undefined,
        userType: values.userType || USER_TYPES.COMPANY,
        role: values.role || 'Employee',
        jobTitle: values.jobTitle?.trim() || undefined,
        shiftId: values.shiftId || undefined,
        locationId: values.locationId || undefined,
        isActive: values.isActive !== false,
      };
      const supervisorId = values.supervisorId?.trim();
      const serviceCenterId = values.serviceCenterId?.trim();
      if (supervisorId) payload.supervisorId = supervisorId;
      if (serviceCenterId) payload.serviceCenterId = serviceCenterId;
      await createUser(payload);
      message.success(t('superadmin.createUserSuccess'));
      setCreateUserVisible(false);
      createForm.resetFields();
      fetchUsers(users.page);
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (u) => {
    setEditUser(u);
    editForm.setFieldsValue({
      fullName: u.fullName || '',
      fullNameAr: u.fullNameAr || '',
      email: u.email || '',
      phone: u.phone || '',
      jobTitle: u.jobTitle || '',
      shiftId: u.shiftId || undefined,
      locationId: u.locationId || undefined,
      supervisorId: u.supervisorId || undefined,
      serviceCenterId: u.serviceCenterId || undefined,
      isActive: u.isActive ?? true,
      role: u.role || 'Employee',
      userType: u.userType || 'Company',
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100, render: (id) => id?.slice(0, 8) + '…' },
    { title: t('signUp.fullName'), dataIndex: 'fullName', key: 'fullName' },
    { title: t('signUp.fullNameAr'), dataIndex: 'fullNameAr', key: 'fullNameAr', dir: 'rtl', render: (v) => v || '—' },
    { title: t('auth.email'), dataIndex: 'email', key: 'email' },
    { title: t('signUp.phone'), dataIndex: 'phone', key: 'phone', render: (v) => v || '—' },
    { title: t('superadmin.userType'), dataIndex: 'userType', key: 'userType' },
    { title: t('superadmin.role'), dataIndex: 'role', key: 'role' },
    { title: t('superadmin.jobTitle'), dataIndex: 'jobTitle', key: 'jobTitle', render: (v) => v || '—' },
    { title: t('signUp.shift'), dataIndex: ['shift', 'name'], key: 'shift', render: (_, r) => r.shift?.name || '—' },
    { title: t('signUp.location'), dataIndex: ['location', 'name'], key: 'location', render: (_, r) => r.location?.name || '—' },
    { title: t('signUp.supervisorId'), dataIndex: 'supervisorId', key: 'supervisorId', render: (v) => v || '—' },
    { title: t('signUp.serviceCenterId'), dataIndex: 'serviceCenterId', key: 'serviceCenterId', render: (v) => v || '—' },
    { title: t('superadmin.isActive'), dataIndex: 'isActive', key: 'isActive', render: (v) => (v ? t('superadmin.yes') : t('superadmin.no')) },
    { title: t('superadmin.isSuperAdmin'), dataIndex: 'isSuperAdmin', key: 'isSuperAdmin', render: (v) => (v ? t('superadmin.yes') : t('superadmin.no')) },
    { title: t('superadmin.createdAt'), dataIndex: 'createdAt', key: 'createdAt', render: formatDate },
    { title: t('superadmin.updatedAt'), dataIndex: 'updatedAt', key: 'updatedAt', render: formatDate },
    {
      title: t('superadmin.permissionsColumn'),
      key: 'permissions',
      width: 140,
      render: (_, record) => {
        const perms = record.permissionNames ?? record.userPermissions?.map((up) => up.permission?.name).filter(Boolean) ?? [];
        if (perms.length === 0) return record.isSuperAdmin ? t('superadmin.isSuperAdmin') : '—';
        return (
          <Button type="link" size="small" onClick={() => setShowPermissionsUser(record)}>
            {t('superadmin.show')} ({perms.length})
          </Button>
        );
      },
    },
    {
      title: t('superadmin.pagesOrModules'),
      key: 'pagesOrModules',
      width: 140,
      render: (_, record) => {
        const perms = record.permissionNames ?? record.userPermissions?.map((up) => up.permission?.name).filter(Boolean) ?? [];
        if (perms.length === 0) return record.isSuperAdmin ? t('superadmin.isSuperAdmin') : '—';
        return (
          <Button type="link" size="small" onClick={() => setShowPagesUser(record)}>
            {t('superadmin.show')}
          </Button>
        );
      },
    },
    {
      title: t('superadmin.actions'),
      key: 'actions',
      fixed: 'right',
      width: 300,
      render: (_, record) => (
        <Space wrap size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailsUser(record)}>
            {t('superadmin.view')}
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            {t('superadmin.edit')}
          </Button>
          {!record.isSuperAdmin && (
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              {t('superadmin.delete')}
            </Button>
          )}
          <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => { setPasswordUser(record); passwordForm.resetFields(); }}>
            {t('superadmin.changePassword')}
          </Button>
          {!record.isSuperAdmin && (
            <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => { setRoleUser(record); roleForm.setFieldsValue({ role: record.role || 'Employee' }); }}>
              {t('superadmin.assignRole')}
            </Button>
          )}
          {!record.isSuperAdmin && (
            <Button type="link" size="small" icon={<SafetyOutlined />} onClick={() => openAssignPermissions(record)}>
              {t('superadmin.assignPermissions')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const detailItems = detailsUser ? [
    { label: 'ID', children: <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{detailsUser.id}</span> },
    { label: t('signUp.fullName'), children: detailsUser.fullName },
    { label: t('signUp.fullNameAr'), children: detailsUser.fullNameAr || '—' },
    { label: t('auth.email'), children: detailsUser.email },
    { label: t('signUp.phone'), children: detailsUser.phone || '—' },
    { label: t('superadmin.userType'), children: detailsUser.userType },
    { label: t('superadmin.role'), children: detailsUser.role },
    { label: t('superadmin.jobTitle'), children: detailsUser.jobTitle || '—' },
    { label: t('signUp.shift'), children: detailsUser.shift?.name || '—' },
    { label: t('signUp.location'), children: detailsUser.location?.name || '—' },
    { label: t('signUp.supervisorId'), children: detailsUser.supervisorId || '—' },
    { label: t('signUp.serviceCenterId'), children: detailsUser.serviceCenterId || '—' },
    { label: t('superadmin.isActive'), children: detailsUser.isActive ? t('superadmin.yes') : t('superadmin.no') },
    { label: t('superadmin.isSuperAdmin'), children: detailsUser.isSuperAdmin ? t('superadmin.yes') : t('superadmin.no') },
    { label: t('superadmin.createdAt'), children: formatDate(detailsUser.createdAt) },
    { label: t('superadmin.updatedAt'), children: formatDate(detailsUser.updatedAt) },
  ] : [];

  return (
    <div>
      <Card
        title={
          <Space>
            <CrownOutlined /> {t('superadmin.dashboardTitle')}
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => { setCreateUserVisible(true); createForm.resetFields(); }}>
              {t('superadmin.createUser')}
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <p style={{ marginBottom: 16 }}>{t('superadmin.users')} — {t('superadmin.total')}: {users.total}</p>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users.data}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={false}
          locale={{ emptyText: t('superadmin.noUsers') }}
        />
      </Card>

      <Modal
        title={t('superadmin.details')}
        open={!!detailsUser}
        onCancel={() => setDetailsUser(null)}
        footer={[<Button key="close" onClick={() => setDetailsUser(null)}>{t('superadmin.close')}</Button>]}
        width={600}
      >
        {detailsUser && <Descriptions column={1} items={detailItems} bordered size="small" />}
      </Modal>

      <Modal
        title={t('superadmin.createUser')}
        open={createUserVisible}
        onCancel={() => { setCreateUserVisible(false); createForm.resetFields(); }}
        onOk={handleCreateUser}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={520}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="fullName" label={t('signUp.fullName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullNameAr" label={t('signUp.fullNameAr')}>
            <Input dir="rtl" />
          </Form.Item>
          <Form.Item name="email" label={t('auth.email')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={t('signUp.password')} rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="phone" label={t('signUp.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="userType" label={t('superadmin.userType')} initialValue={USER_TYPES.COMPANY} rules={[{ required: true }]}>
            <Select options={Object.entries(USER_TYPES).map(([k, v]) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="role" label={t('superadmin.role')} initialValue="Employee" rules={[{ required: true }]}>
            <Select options={ROLES.map((r) => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item name="jobTitle" label={t('superadmin.jobTitle')}>
            <Input />
          </Form.Item>
          <Form.Item name="locationId" label={t('signUp.location')}>
            <Select
              allowClear
              placeholder={t('signUp.selectLocation')}
              showSearch
              optionFilterProp="label"
              options={locations.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>
          <Form.Item name="shiftId" label={t('signUp.shift')}>
            <Select
              allowClear
              placeholder={t('signUp.selectShift')}
              showSearch
              optionFilterProp="label"
              options={shifts.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="supervisorId" label={t('signUp.supervisorId')}>
            <Input placeholder="UUID" />
          </Form.Item>
          <Form.Item name="serviceCenterId" label={t('signUp.serviceCenterId')}>
            <Input placeholder="UUID" />
          </Form.Item>
          <Form.Item name="isActive" label={t('superadmin.isActive')} valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('superadmin.userPermissionsList') + (showPermissionsUser ? ` — ${showPermissionsUser.fullName}` : '')}
        open={!!showPermissionsUser}
        onCancel={() => setShowPermissionsUser(null)}
        footer={[<Button key="close" onClick={() => setShowPermissionsUser(null)}>{t('superadmin.close')}</Button>]}
        width={480}
      >
        {showPermissionsUser && (() => {
          const perms = showPermissionsUser.permissionNames ?? (showPermissionsUser.userPermissions || []).map((up) => up.permission?.name).filter(Boolean);
          return (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {perms.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          );
        })()}
      </Modal>

      <Modal
        title={t('superadmin.userPagesList') + (showPagesUser ? ` — ${showPagesUser.fullName}` : '')}
        open={!!showPagesUser}
        onCancel={() => setShowPagesUser(null)}
        footer={[<Button key="close" onClick={() => setShowPagesUser(null)}>{t('superadmin.close')}</Button>]}
        width={480}
      >
        {showPagesUser && (() => {
          const perms = showPagesUser.permissionNames ?? (showPagesUser.userPermissions || []).map((up) => up.permission?.name).filter(Boolean);
          const pageLabels = [...new Set(perms.map((name) => PERMISSION_TO_PAGE_LABEL[name] || name))].sort();
          return (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {pageLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          );
        })()}
      </Modal>

      <Modal
        title={t('superadmin.edit')}
        open={!!editUser}
        onCancel={() => setEditUser(null)}
        onOk={handleUpdate}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={520}
      >
        {editUser && (
          <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item name="fullName" label={t('signUp.fullName')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="fullNameAr" label={t('signUp.fullNameAr')}>
              <Input dir="rtl" />
            </Form.Item>
            <Form.Item name="email" label={t('auth.email')} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label={t('signUp.phone')}>
              <Input />
            </Form.Item>
            <Form.Item name="jobTitle" label={t('superadmin.jobTitle')}>
              <Input />
            </Form.Item>
            <Form.Item name="userType" label={t('superadmin.userType')}>
              <Select options={[{ value: 'Company', label: 'Company' }, { value: 'ServiceCenter', label: 'ServiceCenter' }]} />
            </Form.Item>
            <Form.Item name="role" label={t('superadmin.role')}>
              <Select options={ROLES.map((r) => ({ value: r, label: r }))} />
            </Form.Item>
            <Form.Item name="locationId" label={t('signUp.location')}>
              <Select
                allowClear
                placeholder={t('signUp.selectLocation')}
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
            </Form.Item>
            <Form.Item name="shiftId" label={t('signUp.shift')}>
              <Select
                allowClear
                placeholder={t('signUp.selectShift')}
                options={shifts.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>
            <Form.Item name="supervisorId" label={t('signUp.supervisorId')}>
              <Input />
            </Form.Item>
            <Form.Item name="serviceCenterId" label={t('signUp.serviceCenterId')}>
              <Input />
            </Form.Item>
            <Form.Item name="isActive" label={t('superadmin.isActive')} valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title={t('superadmin.changePassword')}
        open={!!passwordUser}
        onCancel={() => setPasswordUser(null)}
        onOk={handleChangePassword}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        {passwordUser && (
          <>
            <p style={{ marginBottom: 16 }}>{passwordUser.email}</p>
            <Form form={passwordForm} layout="vertical">
              <Form.Item name="currentPassword" label={t('superadmin.currentPassword')} rules={[{ required: true }]}>
                <Input.Password />
              </Form.Item>
              <Form.Item name="newPassword" label={t('superadmin.newPassword')} rules={[{ required: true, min: 6 }]}>
                <Input.Password />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      <Modal
        title={t('superadmin.assignRole')}
        open={!!roleUser}
        onCancel={() => setRoleUser(null)}
        onOk={handleAssignRole}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        {roleUser && (
          <>
            <p style={{ marginBottom: 16 }}>{roleUser.fullName} ({roleUser.email})</p>
            <Form form={roleForm} layout="vertical">
              <Form.Item name="role" label={t('superadmin.role')} rules={[{ required: true }]}>
                <Select options={ROLES.map((r) => ({ value: r, label: r }))} />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      <Modal
        title={t('superadmin.assignPermissions')}
        open={!!permissionsUser}
        onCancel={() => setPermissionsUser(null)}
        onOk={handleAssignPermissions}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={520}
      >
        {permissionsUser && (
          <>
            <p style={{ marginBottom: 16 }}><strong>{permissionsUser.fullName}</strong> ({permissionsUser.email})</p>
            <Form form={permissionsForm} layout="vertical">
              <Form.Item name="permissionIds" label={t('superadmin.selectPermissions')}>
                <Select
                  mode="multiple"
                  placeholder={t('superadmin.selectPermissions')}
                  options={allPermissions.map((p) => ({ value: p.id, label: p.module ? `${p.name} (${p.module})` : p.name }))}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, opt) => (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
