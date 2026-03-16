import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Table, Button, Card, Modal, Form, Input, Tabs, Select, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPermissions, getDefaultPermissions, setDefaultPermissions, createPermission, updatePermission, deletePermission } from '../../api/permissions';
import { PERMISSION_MODULE_OPTIONS } from '../../utils/constants';

const { TabPane } = Tabs;
const { Text } = Typography;

export function PermissionsPage() {
  const { t } = useLanguage();
  const [permissions, setPermissions] = useState([]);
  const [defaultsByType, setDefaultsByType] = useState({ Company: [], ServiceCenter: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [defaultsForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);
  const [activeDefaultType, setActiveDefaultType] = useState('Company');

  const userTypeOptions = [{ value: 'Company', label: 'Company' }, { value: 'ServiceCenter', label: 'Service Center' }];

  const fetchPermissions = useCallback(() => {
    getPermissions()
      .then(setPermissions)
      .catch(() => message.error(t('common.error')));
  }, [t]);

  const fetchDefaults = useCallback(() => {
    getDefaultPermissions()
      .then((res) => setDefaultsByType(res || { Company: [], ServiceCenter: [] }))
      .catch(() => setDefaultsByType({ Company: [], ServiceCenter: [] }));
  }, []);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([getPermissions(), getDefaultPermissions()])
      .then(([perms, defaults]) => {
        setPermissions(perms);
        setDefaultsByType(defaults || { Company: [], ServiceCenter: [] });
      })
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const list = (defaultsByType[activeDefaultType] || []).map((p) => p.id);
    defaultsForm.setFieldsValue({ permissionIds: list });
  }, [activeDefaultType, defaultsByType]);

  const openCreate = () => {
    setEditingId(null);
    form.setFieldsValue({ name: '', module: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      module: record.module || undefined,
      description: record.description || '',
    });
    setModalOpen(true);
  };

  const moduleOptions = useMemo(() => {
    const all = [...PERMISSION_MODULE_OPTIONS];
    permissions.forEach((p) => {
      if (p.module && !all.some((o) => o.value === p.module)) all.push({ value: p.module, label: p.module });
    });
    return all;
  }, [permissions]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      if (editingId) {
        await updatePermission(editingId, { name: values.name.trim(), module: values.module?.trim() || null, description: values.description?.trim() || null });
        message.success(t('superadmin.updateSuccess'));
      } else {
        await createPermission({ name: values.name.trim(), module: values.module?.trim() || null, description: values.description?.trim() || null });
        message.success(t('superadmin.createSuccess'));
      }
      setModalOpen(false);
      fetchPermissions();
      fetchDefaults();
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
      content: `${t('superadmin.permissions')}: ${record.name}`,
      okText: t('superadmin.yes'),
      okType: 'danger',
      cancelText: t('superadmin.no'),
      onOk: async () => {
        try {
          await deletePermission(record.id);
          message.success(t('superadmin.deleteSuccess'));
          loadAll();
        } catch (e) {
          message.error(e?.message || t('common.error'));
        }
      },
    });
  };

  const handleSaveDefaults = async () => {
    try {
      const userType = defaultsForm.getFieldValue('userType');
      const permissionIds = defaultsForm.getFieldValue('permissionIds') || [];
      setActionLoading(true);
      await setDefaultPermissions(userType, permissionIds);
      message.success(t('superadmin.updateSuccess'));
      fetchDefaults();
    } catch (err) {
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const isDefaultFor = (permissionId, userType) => {
    const list = defaultsByType[userType] || [];
    return list.some((p) => p.id === permissionId);
  };

  const columns = [
    { title: t('superadmin.name'), dataIndex: 'name', key: 'name', render: (v) => <Text code>{v}</Text> },
    { title: t('superadmin.permissionModule'), dataIndex: 'module', key: 'module', render: (v) => v || '—' },
    { title: t('superadmin.description'), dataIndex: 'description', key: 'description', ellipsis: true, render: (v) => v || '—' },
    {
      title: t('superadmin.actions'),
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </>
      ),
    },
  ];

  const referenceData = permissions.map((p) => ({
    name: p.name,
    module: p.module || '—',
    description: p.description || '—',
    defaultFor: [
      isDefaultFor(p.id, 'Company') && 'Company',
      isDefaultFor(p.id, 'ServiceCenter') && 'ServiceCenter',
    ].filter(Boolean).join(', ') || '—',
  }));

  return (
    <div>
      <Card style={{ marginBottom: 16 }} type="inner" title={t('superadmin.permissionsStepsTitle')}>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>{t('superadmin.permissionsStep1')}</li>
          <li>{t('superadmin.permissionsStep2')}</li>
          <li>{t('superadmin.permissionsStep3')}</li>
        </ol>
      </Card>
      <Card title={<><SafetyOutlined /> {t('superadmin.permissions')}</>}>
        <Tabs defaultActiveKey="list">
          <TabPane tab={t('superadmin.permissionsList')} key="list">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} style={{ marginBottom: 16 }}>
              {t('superadmin.addPermission')}
            </Button>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={permissions}
              loading={loading}
              pagination={false}
              size="small"
            />
          </TabPane>
          <TabPane tab={t('superadmin.defaultPermissions')} key="defaults">
            <Form
              form={defaultsForm}
              layout="vertical"
              onFinish={handleSaveDefaults}
              initialValues={{ userType: 'Company', permissionIds: [] }}
            >
              <Form.Item name="userType" label={t('superadmin.userType')}>
                <Select
                  options={userTypeOptions}
                  onChange={(v) => {
                    setActiveDefaultType(v);
                    const list = (defaultsByType[v] || []).map((p) => p.id);
                    defaultsForm.setFieldsValue({ permissionIds: list });
                  }}
                />
              </Form.Item>
              <Form.Item
                name="permissionIds"
                label={t('superadmin.defaultPermissionsForType')}
              >
                <Select
                  mode="multiple"
                  placeholder={t('superadmin.selectPermissions')}
                  options={permissions.map((p) => ({ value: p.id, label: `${p.name}${p.module ? ` (${p.module})` : ''}` }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={actionLoading}>
                  {t('common.save')}
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab={t('superadmin.permissionsReference')} key="reference">
            <Table
              size="small"
              rowKey="name"
              dataSource={referenceData}
              columns={[
                { title: t('superadmin.permissionName'), dataIndex: 'name', render: (v) => <Text code>{v}</Text> },
                { title: t('superadmin.permissionModule'), dataIndex: 'module' },
                { title: t('superadmin.whatUserCanSee'), dataIndex: 'description' },
                { title: t('superadmin.defaultOrCustom'), dataIndex: 'defaultFor' },
              ]}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingId ? t('superadmin.editPermission') : t('superadmin.addPermission')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('superadmin.name')} rules={[{ required: true }]}>
            <Input placeholder="e.g. users.view" />
          </Form.Item>
          <Form.Item name="module" label={t('superadmin.permissionModule')}>
            <Select
              placeholder={t('superadmin.selectModule')}
              showSearch
              optionFilterProp="label"
              options={moduleOptions}
              allowClear
            />
          </Form.Item>
          <Form.Item name="description" label={t('superadmin.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
