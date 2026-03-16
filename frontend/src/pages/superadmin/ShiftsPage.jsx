import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Card, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getShifts, createShift, updateShift } from '../../api/shifts';

function formatTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return dateStr;
  }
}

export function ShiftsPage() {
  const { t } = useLanguage();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewShift, setViewShift] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShifts = useCallback(() => {
    setLoading(true);
    getShifts()
      .then(setList)
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const openCreate = () => {
    setEditingId(null);
    form.setFieldsValue({
      name: '',
      shiftAr: '',
      startTime: '06:00',
      endTime: '14:00',
      isForEmployee: true,
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      shiftAr: record.shiftAr || '',
      startTime: formatTime(record.startTime),
      endTime: formatTime(record.endTime),
      isForEmployee: record.isForEmployee ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      const payload = {
        name: values.name.trim(),
        shiftAr: values.shiftAr ? values.shiftAr.trim() : null,
        startTime: values.startTime || '00:00',
        endTime: values.endTime || '00:00',
        isForEmployee: values.isForEmployee !== false,
      };
      if (editingId) {
        await updateShift(editingId, payload);
        message.success(t('superadmin.updateSuccess'));
      } else {
        await createShift(payload);
        message.success(t('superadmin.createSuccess'));
      }
      setModalOpen(false);
      fetchShifts();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { title: t('superadmin.nameEn'), dataIndex: 'name', key: 'name' },
    { title: t('superadmin.nameAr'), dataIndex: 'shiftAr', key: 'shiftAr' },
    {
      title: t('superadmin.startTime'),
      dataIndex: 'startTime',
      key: 'startTime',
      render: formatTime,
    },
    {
      title: t('superadmin.endTime'),
      dataIndex: 'endTime',
      key: 'endTime',
      render: formatTime,
    },
    {
      title: t('superadmin.isForEmployee'),
      dataIndex: 'isForEmployee',
      key: 'isForEmployee',
      render: (v) => (v ? t('superadmin.yes') : t('superadmin.no')),
    },
    {
      title: t('superadmin.actions'),
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setViewShift(record)}>
            {t('superadmin.view')}
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            {t('superadmin.edit')}
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('superadmin.shifts')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('superadmin.addShift')}
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t('superadmin.noShifts') }}
        />
      </Card>
      <Modal
        title={editingId ? t('superadmin.editShift') : t('superadmin.addShift')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={actionLoading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('superadmin.nameEn')} rules={[{ required: true }]}>
            <Input placeholder="Shift 1" />
          </Form.Item>
          <Form.Item name="shiftAr" label={t('superadmin.nameAr')} rules={[{ required: true }]}>
            <Input placeholder="الشفت 1" />
          </Form.Item>
          <Form.Item name="startTime" label={t('superadmin.startTime')} rules={[{ required: true }]}>
            <Input placeholder="06:00" />
          </Form.Item>
          <Form.Item name="endTime" label={t('superadmin.endTime')} rules={[{ required: true }]}>
            <Input placeholder="14:00" />
          </Form.Item>
          <Form.Item name="isForEmployee" label={t('superadmin.isForEmployee')} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t('superadmin.details')}
        open={!!viewShift}
        onCancel={() => setViewShift(null)}
        footer={[<Button key="close" onClick={() => setViewShift(null)}>{t('superadmin.close')}</Button>]}
      >
        {viewShift && (
          <dl style={{ margin: 0 }}>
            <dt><strong>{t('superadmin.nameEn')}</strong></dt><dd>{viewShift.name}</dd>
            <dt><strong>{t('superadmin.nameAr')}</strong></dt><dd>{viewShift.shiftAr || '—'}</dd>
            <dt><strong>{t('superadmin.startTime')}</strong></dt><dd>{formatTime(viewShift.startTime)}</dd>
            <dt><strong>{t('superadmin.endTime')}</strong></dt><dd>{formatTime(viewShift.endTime)}</dd>
            <dt><strong>{t('superadmin.isForEmployee')}</strong></dt><dd>{viewShift.isForEmployee ? t('superadmin.yes') : t('superadmin.no')}</dd>
          </dl>
        )}
      </Modal>
    </div>
  );
}
