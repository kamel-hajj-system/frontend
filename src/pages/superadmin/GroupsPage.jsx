import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Table, Button, Card, Modal, Form, Input, Select, message, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined, TeamOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getGroups, createGroup, updateGroup, deleteGroup, setGroupPermissions, setGroupUsers, getGroupById } from '../../api/groups';
import { getLocations } from '../../api/locations';
import { getPermissions } from '../../api/permissions';
import { getUsers } from '../../api/users';

const { Text } = Typography;

export function GroupsPage() {
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [locations, setLocations] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [permsModalGroup, setPermsModalGroup] = useState(null);
  const [usersModalGroup, setUsersModalGroup] = useState(null);
  const [usersModalLocationFilter, setUsersModalLocationFilter] = useState(undefined);
  const [form] = Form.useForm();
  const [permsForm] = Form.useForm();
  const [usersForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!usersModalLocationFilter) return allUsers;
    return allUsers.filter((u) => u.locationId === usersModalLocationFilter);
  }, [allUsers, usersModalLocationFilter]);

  const userSelectOptions = useMemo(
    () =>
      filteredUsers.map((u) => ({
        value: u.id,
        label: `${u.fullName} (${u.email})${u.location?.name ? ` — ${u.location.name}` : ''}`,
      })),
    [filteredUsers]
  );

  const fetchGroups = useCallback(() => {
    setLoading(true);
    getGroups()
      .then(setGroups)
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchGroups();
    getLocations().then(setLocations).catch(() => setLocations([]));
    getPermissions().then(setAllPermissions).catch(() => setAllPermissions([]));
    getUsers({ limit: 500 }).then((r) => setAllUsers(r.data || [])).catch(() => setAllUsers([]));
  }, [fetchGroups]);

  const openCreate = () => {
    setEditingId(null);
    form.setFieldsValue({ name: '', locationId: undefined, description: '' });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      locationId: record.locationId || undefined,
      description: record.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      const payload = { name: values.name?.trim(), description: values.description?.trim() || undefined };
      if (values.locationId) payload.locationId = values.locationId;
      if (editingId) {
        await updateGroup(editingId, payload);
        message.success(t('superadmin.updateSuccess'));
      } else {
        await createGroup(payload);
        message.success(t('superadmin.createSuccess'));
      }
      setModalOpen(false);
      fetchGroups();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('superadmin.delete'),
      content: t('superadmin.groups') + ': ' + record.name,
      okText: t('superadmin.yes'),
      okType: 'danger',
      cancelText: t('superadmin.no'),
      onOk: async () => {
        try {
          await deleteGroup(record.id);
          message.success(t('superadmin.deleteSuccess'));
          fetchGroups();
        } catch (e) {
          message.error(e?.message || t('common.error'));
        }
      },
    });
  };

  const openPerms = async (record) => {
    try {
      const full = await getGroupById(record.id);
      setPermsModalGroup(full);
      permsForm.setFieldsValue({
        permissionIds: (full.permissions || []).map((gp) => gp.permissionId),
      });
    } catch {
      message.error(t('common.error'));
    }
  };

  const openUsers = async (record) => {
    try {
      const full = await getGroupById(record.id);
      setUsersModalGroup(full);
      setUsersModalLocationFilter(undefined);
      usersForm.setFieldsValue({
        userIds: (full.userGroups || []).map((ug) => ug.userId),
      });
    } catch {
      message.error(t('common.error'));
    }
  };

  const handleSelectAllUsers = () => {
    usersForm.setFieldsValue({ userIds: filteredUsers.map((u) => u.id) });
    message.info(t('superadmin.usersSelected', { count: filteredUsers.length }));
  };

  const handleClearUserSelection = () => {
    usersForm.setFieldsValue({ userIds: [] });
  };

  const handleSavePerms = async () => {
    if (!permsModalGroup?.id) return;
    try {
      const { permissionIds } = await permsForm.validateFields();
      setActionLoading(true);
      await setGroupPermissions(permsModalGroup.id, permissionIds || []);
      message.success(t('superadmin.permissionsAssignSuccess'));
      setPermsModalGroup(null);
      fetchGroups();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUsers = async () => {
    if (!usersModalGroup?.id) return;
    try {
      const { userIds } = await usersForm.validateFields();
      setActionLoading(true);
      await setGroupUsers(usersModalGroup.id, userIds || []);
      message.success(t('superadmin.updateSuccess'));
      setUsersModalGroup(null);
      fetchGroups();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { title: t('superadmin.name'), dataIndex: 'name', key: 'name' },
    { title: t('superadmin.groupLocation'), dataIndex: ['location', 'name'], key: 'location', render: (_, r) => r.location?.name || '—' },
    {
      title: t('superadmin.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space wrap>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            {t('superadmin.edit')}
          </Button>
          <Button type="link" size="small" icon={<SafetyOutlined />} onClick={() => openPerms(record)}>
            {t('superadmin.assignPermissionsToGroup')}
          </Button>
          <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => openUsers(record)}>
            {t('superadmin.assignUsersToGroup')}
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            {t('superadmin.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('superadmin.groupsTitle')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('superadmin.addGroup')}
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={groups}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t('superadmin.noGroups') }}
        />
      </Card>

      <Modal
        title={editingId ? t('superadmin.editGroup') : t('superadmin.addGroup')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('superadmin.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="locationId" label={t('superadmin.groupLocation')}>
            <Select
              allowClear
              placeholder={t('signUp.selectLocation')}
              showSearch
              optionFilterProp="label"
              options={locations.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>
          <Form.Item name="description" label={t('superadmin.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('superadmin.assignPermissionsToGroup') + (permsModalGroup ? ` — ${permsModalGroup.name}` : '')}
        open={!!permsModalGroup}
        onCancel={() => setPermsModalGroup(null)}
        onOk={handleSavePerms}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={520}
      >
        <Form form={permsForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="permissionIds" label={t('superadmin.selectPermissions')}>
            <Select
              mode="multiple"
              placeholder={t('superadmin.selectPermissions')}
              options={allPermissions.map((p) => ({ value: p.id, label: p.module ? `${p.name} (${p.module})` : p.name }))}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('superadmin.assignUsersToGroup') + (usersModalGroup ? ` — ${usersModalGroup.name}` : '')}
        open={!!usersModalGroup}
        onCancel={() => { setUsersModalGroup(null); setUsersModalLocationFilter(undefined); }}
        onOk={handleSaveUsers}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={640}
      >
        <Form form={usersForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label={t('superadmin.filterByLocation')}>
            <Select
              allowClear
              placeholder={t('superadmin.allLocations')}
              showSearch
              optionFilterProp="label"
              options={locations.map((l) => ({ value: l.id, label: l.name }))}
              value={usersModalLocationFilter}
              onChange={setUsersModalLocationFilter}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text type="secondary">{t('superadmin.usersShown', { count: filteredUsers.length })}</Text>
            <Button type="link" size="small" icon={<CheckSquareOutlined />} onClick={handleSelectAllUsers}>
              {t('superadmin.selectAll')}
            </Button>
            <Button type="link" size="small" icon={<BorderOutlined />} onClick={handleClearUserSelection}>
              {t('superadmin.clearSelection')}
            </Button>
          </div>
          <Form.Item name="userIds" label={t('superadmin.users')}>
            <Select
              mode="multiple"
              placeholder={t('superadmin.selectUsers')}
              options={userSelectOptions}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="label"
              maxTagCount="responsive"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
