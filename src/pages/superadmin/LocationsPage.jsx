import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Switch, Space, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocations, createLocation, updateLocation } from '../../api/locations';

export function LocationsPage() {
  const { t } = useLanguage();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLocations = useCallback(() => {
    setLoading(true);
    getLocations()
      .then(setList)
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const openCreate = () => {
    setEditingId(null);
    form.setFieldsValue({ name: '', locationAr: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      locationAr: record.locationAr || '',
      isActive: record.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      const payload = {
        name: values.name.trim(),
        locationAr: values.locationAr ? values.locationAr.trim() : null,
        isActive: values.isActive !== false,
      };
      if (editingId) {
        await updateLocation(editingId, payload);
        message.success(t('superadmin.updateSuccess'));
      } else {
        await createLocation(payload);
        message.success(t('superadmin.createSuccess'));
      }
      setModalOpen(false);
      fetchLocations();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { title: t('superadmin.nameEn'), dataIndex: 'name', key: 'name' },
    { title: t('superadmin.nameAr'), dataIndex: 'locationAr', key: 'locationAr' },
    {
      title: t('superadmin.isActive'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => (v ? t('superadmin.yes') : t('superadmin.no')),
    },
    {
      title: t('superadmin.actions'),
      key: 'actions',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
          {t('superadmin.edit')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('superadmin.locations')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('superadmin.addLocation')}
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t('superadmin.noLocations') }}
        />
      </Card>
      <Modal
        title={editingId ? t('superadmin.editLocation') : t('superadmin.addLocation')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('superadmin.nameEn')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="locationAr" label={t('superadmin.nameAr')}>
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label={t('superadmin.isActive')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
