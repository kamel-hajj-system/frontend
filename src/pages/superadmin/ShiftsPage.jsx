import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Modal, Form, Input, Switch, message, TimePicker, Select, Typography } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getShifts, createShift, updateShift, deleteShift } from '../../api/shifts';
import { getLocations } from '../../api/locations';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import dayjs from 'dayjs';

const { Text } = Typography;

function formatTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return dateStr;
  }
}

function toDayjsTime(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const [h, m] = hhmm.split(':').map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return dayjs().hour(h).minute(m).second(0);
}

export function ShiftsPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const [list, setList] = useState([]);
  const [locations, setLocations] = useState([]);
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

  useEffect(() => {
    getLocations({ isActive: 'true' }).then(setLocations).catch(() => setLocations([]));
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.setFieldsValue({
      name: '',
      shiftAr: '',
      startTime: toDayjsTime('06:00'),
      endTime: toDayjsTime('14:00'),
      isForEmployee: true,
      locationId: undefined,
    });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    const start = toDayjsTime(formatTime(record.startTime));
    const end = toDayjsTime(formatTime(record.endTime));
    form.setFieldsValue({
      name: record.name,
      shiftAr: record.shiftAr || '',
      startTime: start,
      endTime: end,
      isForEmployee: record.isForEmployee ?? true,
      locationId: record.locationId || undefined,
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
        startTime: values.startTime?.format ? values.startTime.format('HH:mm') : '00:00',
        endTime: values.endTime?.format ? values.endTime.format('HH:mm') : '00:00',
        isForEmployee: values.isForEmployee !== false,
        locationId: values.locationId ?? null,
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

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('superadmin.delete'),
      content: t('superadmin.shifts') + ': ' + record.name,
      okText: t('superadmin.yes'),
      okType: 'danger',
      cancelText: t('superadmin.no'),
      onOk: async () => {
        try {
          await deleteShift(record.id);
          message.success(t('superadmin.deleteSuccess'));
          fetchShifts();
        } catch (e) {
          message.error(e?.message || t('common.error'));
        }
      },
    });
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
      title: t('superadmin.shiftWorkLocation'),
      key: 'workLoc',
      ellipsis: true,
      render: (_, r) => {
        const loc = r.shiftLocation;
        if (!loc) return '—';
        return isAr ? loc.locationAr || loc.name : loc.name;
      },
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
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            {t('superadmin.delete')}
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
        <ResponsiveTable
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
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm"
              minuteStep={5}
              inputReadOnly
              placeholder="06:00"
            />
          </Form.Item>
          <Form.Item name="endTime" label={t('superadmin.endTime')} rules={[{ required: true }]}>
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm"
              minuteStep={5}
              inputReadOnly
              placeholder="14:00"
            />
          </Form.Item>
          <Form.Item name="isForEmployee" label={t('superadmin.isForEmployee')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="locationId"
            label={t('superadmin.shiftWorkLocation')}
            extra={<Text type="secondary">{t('superadmin.shiftWorkLocationHint')}</Text>}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={t('superadmin.shiftWorkLocation')}
              options={locations.map((l) => ({
                value: l.id,
                label: isAr ? l.locationAr || l.name : l.name,
              }))}
            />
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
            <dt><strong>{t('superadmin.shiftWorkLocation')}</strong></dt>
            <dd>
              {viewShift.shiftLocation
                ? isAr
                  ? viewShift.shiftLocation.locationAr || viewShift.shiftLocation.name
                  : viewShift.shiftLocation.name
                : '—'}
            </dd>
          </dl>
        )}
      </Modal>
    </div>
  );
}
