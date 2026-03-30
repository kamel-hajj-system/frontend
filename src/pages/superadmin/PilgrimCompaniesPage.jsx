import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  createPilgrimCompany,
  deletePilgrimCompany,
  getPilgrimCompanies,
  getPilgrimNationalities,
  updatePilgrimCompany,
} from '../../api/serviceCenters';

export function PilgrimCompaniesPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [companiesRes, natRes] = await Promise.all([getPilgrimCompanies(), getPilgrimNationalities()]);
      setRows(Array.isArray(companiesRes) ? companiesRes : []);
      setNationalities(Array.isArray(natRes) ? natRes : []);
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر تحميل البعثات' : 'Failed to load pilgrim companies'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ nationalityIds: [] });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      externalCode: record.externalCode,
      name: record.name,
      nameAr: record.nameAr,
      expectedPilgrimsCount: record.expectedPilgrimsCount,
      mergedActualPilgrimsCount: record.mergedActualPilgrimsCount,
      notes: record.notes,
      nationalityIds: (record.nationalities || []).map((n) => n.pilgrimNationalityId),
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updatePilgrimCompany(editing.id, values);
      } else {
        await createPilgrimCompany(values);
      }
      message.success(editing ? (isAr ? 'تم تحديث شركة الحجاج' : 'Pilgrim company updated') : (isAr ? 'تم إنشاء شركة الحجاج' : 'Pilgrim company created'));
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر حفظ شركة الحجاج' : 'Failed to save pilgrim company'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await deletePilgrimCompany(id);
      message.success(isAr ? 'تم حذف شركة الحجاج' : 'Pilgrim company deleted');
      load();
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر حذف شركة الحجاج' : 'Failed to delete pilgrim company'));
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{isAr ? 'البعثات' : 'Pilgrim Companies'}</Typography.Title>
          <Button type="primary" onClick={openCreate}>{isAr ? 'إضافة شركة حجاج' : 'Add Pilgrim Company'}</Button>
        </Space>
      </Card>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: isAr ? 'الرمز الخارجي' : 'External Code', dataIndex: 'externalCode' },
          { title: isAr ? 'الاسم' : 'Name', dataIndex: 'name' },
          { title: isAr ? 'العدد المتوقع' : 'Expected', dataIndex: 'expectedPilgrimsCount' },
          { title: isAr ? 'العدد بعد المطابقة' : 'Matched Count', dataIndex: 'mergedActualPilgrimsCount' },
          {
            title: isAr ? 'الجنسيات' : 'Nationalities',
            render: (_, r) => (r.nationalities || []).map((n) => n.nationality?.name).filter(Boolean).join(', '),
          },
          {
            title: isAr ? 'الإجراءات' : 'Actions',
            render: (_, r) => (
              <Space>
                <Button onClick={() => openEdit(r)}>{isAr ? 'تعديل' : 'Edit'}</Button>
                <Popconfirm title={isAr ? 'حذف شركة الحجاج هذه؟' : 'Delete this pilgrim company?'} onConfirm={() => onDelete(r.id)}>
                  <Button danger>{isAr ? 'حذف' : 'Delete'}</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={saving}
        title={editing ? (isAr ? 'تعديل شركة الحجاج' : 'Edit Pilgrim Company') : (isAr ? 'إضافة شركة حجاج' : 'Add Pilgrim Company')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="externalCode" label={isAr ? 'الرمز الخارجي' : 'External Code'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label={isAr ? 'الاسم' : 'Name'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nameAr" label={isAr ? 'الاسم بالعربية' : 'Arabic Name'}>
            <Input />
          </Form.Item>
          <Form.Item name="expectedPilgrimsCount" label={isAr ? 'العدد المتوقع للحجاج' : 'Expected Pilgrims'} rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label={isAr ? 'العدد بعد المطابقة' : 'Matched Count'}>
            <InputNumber disabled style={{ width: '100%' }} placeholder={isAr ? 'يُحسب بعد التكامل' : 'Calculated after integration'} value={editing?.mergedActualPilgrimsCount ?? undefined} />
          </Form.Item>
          <Form.Item name="notes" label={isAr ? 'ملاحظات' : 'Notes'}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="nationalityIds" label={isAr ? 'الجنسيات المدعومة' : 'Supported Nationalities'}>
            <Select
              mode="multiple"
              options={nationalities.map((n) => ({ value: n.id, label: n.name }))}
              placeholder={isAr ? 'اختر الجنسيات' : 'Select nationalities'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
