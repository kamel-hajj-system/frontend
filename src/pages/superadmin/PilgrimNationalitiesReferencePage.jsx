import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  createPilgrimNationality,
  deletePilgrimNationality,
  getPilgrimNationalities,
  updatePilgrimNationality,
} from '../../api/serviceCenters';

export function PilgrimNationalitiesReferencePage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPilgrimNationalities();
      setRows(Array.isArray(res) ? res : []);
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر تحميل الجنسيات' : 'Failed to load nationalities'));
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
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      code: record.code,
      flagCode: record.flagCode,
      name: record.name,
      nameAr: record.nameAr,
      notes: record.notes,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updatePilgrimNationality(editing.id, values);
      } else {
        await createPilgrimNationality(values);
      }
      message.success(editing ? (isAr ? 'تم تحديث الجنسية' : 'Nationality updated') : (isAr ? 'تم إنشاء الجنسية' : 'Nationality created'));
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر حفظ الجنسية' : 'Failed to save nationality'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await deletePilgrimNationality(id);
      message.success(isAr ? 'تم حذف الجنسية' : 'Nationality deleted');
      load();
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر حذف الجنسية' : 'Failed to delete nationality'));
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{isAr ? 'مرجع جنسيات الحجاج' : 'Pilgrim Nationalities Reference'}</Typography.Title>
          <Button type="primary" onClick={openCreate}>{isAr ? 'إضافة جنسية' : 'Add Nationality'}</Button>
        </Space>
      </Card>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: isAr ? 'الرمز' : 'Code', dataIndex: 'code' },
          { title: isAr ? 'رمز العلم' : 'Flag Code', dataIndex: 'flagCode' },
          { title: isAr ? 'الاسم' : 'Name', dataIndex: 'name' },
          { title: isAr ? 'الاسم بالعربية' : 'Arabic Name', dataIndex: 'nameAr' },
          {
            title: isAr ? 'الإجراءات' : 'Actions',
            render: (_, r) => (
              <Space>
                <Button onClick={() => openEdit(r)}>{isAr ? 'تعديل' : 'Edit'}</Button>
                <Popconfirm title={isAr ? 'حذف هذه الجنسية؟' : 'Delete this nationality?'} onConfirm={() => onDelete(r.id)}>
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
        title={editing ? (isAr ? 'تعديل الجنسية' : 'Edit Nationality') : (isAr ? 'إضافة جنسية' : 'Add Nationality')}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label={isAr ? 'الرمز' : 'Code'}>
            <Input />
          </Form.Item>
          <Form.Item name="flagCode" label={isAr ? 'رمز العلم' : 'Flag Code'}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label={isAr ? 'الاسم' : 'Name'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nameAr" label={isAr ? 'الاسم بالعربية' : 'Arabic Name'}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={isAr ? 'ملاحظات' : 'Notes'}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
