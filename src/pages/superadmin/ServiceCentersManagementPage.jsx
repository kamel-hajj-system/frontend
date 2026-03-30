import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Typography, message } from 'antd';
import { createServiceCenter, deleteServiceCenter, getPilgrimCompanies, getServiceCenters, updateServiceCenter } from '../../api/serviceCenters';
import { useLanguage } from '../../contexts/LanguageContext';

export function ServiceCentersManagementPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [centersRes, companiesRes] = await Promise.all([getServiceCenters(), getPilgrimCompanies()]);
      setRows(Array.isArray(centersRes) ? centersRes : []);
      setCompanies(Array.isArray(companiesRes) ? companiesRes : []);
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر تحميل مراكز الخدمة' : 'Failed to load service centers'));
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
    form.setFieldsValue({ companies: [] });
    setOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      code: record.code,
      presidentName: record.presidentName,
      vicePresidentName: record.vicePresidentName,
      maxCapacity: record.maxCapacity,
      companies: (record.pilgrimCompanyAllocations || []).map((c) => ({
        pilgrimCompanyId: c.pilgrimCompanyId,
        allocatedPilgrims: c.allocatedPilgrims,
      })),
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await updateServiceCenter(editing.id, values);
      } else {
        await createServiceCenter(values);
      }
      message.success(editing ? (isAr ? 'تم تحديث مركز الخدمة' : 'Service center updated') : (isAr ? 'تم إنشاء مركز الخدمة' : 'Service center created'));
      setOpen(false);
      load();
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر حفظ مركز الخدمة' : 'Failed to save service center'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteServiceCenter(id);
      message.success(isAr ? 'تم حذف مركز الخدمة' : 'Service center deleted');
      load();
    } catch (err) {
      message.error(err.message || (isAr ? 'تعذر حذف مركز الخدمة' : 'Failed to delete service center'));
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{isAr ? 'إدارة مراكز الخدمة' : 'Service Centers Management'}</Typography.Title>
          <Button type="primary" onClick={openCreate}>{isAr ? 'إضافة مركز خدمة' : 'Add Service Center'}</Button>
        </Space>
      </Card>

      <Alert
        type="info"
        showIcon
        message={
          isAr
            ? 'مراكز الخدمة هي جهات تشغيلية. من هذه الشاشة يمكنك توزيع البعثات على كل مركز.'
            : 'Service centers are operational entities. Allocate pilgrim companies per center from this screen.'
        }
      />

      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: isAr ? 'الرمز' : 'Code', dataIndex: 'code' },
          { title: isAr ? 'الاسم' : 'Name', dataIndex: 'name' },
          { title: isAr ? 'السعة القصوى' : 'Max Capacity', dataIndex: 'maxCapacity' },
          {
            title: isAr ? 'إجمالي الحجاج' : 'Total Pilgrims',
            render: (_, r) => (r.pilgrimCompanyAllocations || []).reduce((s, c) => s + (c.allocatedPilgrims || 0), 0),
          },
          {
            title: isAr ? 'البعثات' : 'Pilgrim Companies',
            render: (_, r) => (r.pilgrimCompanyAllocations || []).map((c) => c.pilgrimCompany?.name).filter(Boolean).join(', '),
          },
          {
            title: isAr ? 'الإجراءات' : 'Actions',
            render: (_, r) => (
              <Space>
                <Button onClick={() => openEdit(r)}>{isAr ? 'تعديل' : 'Edit'}</Button>
                <Popconfirm title={isAr ? 'حذف مركز الخدمة هذا؟' : 'Delete this service center?'} onConfirm={() => onDelete(r.id)}>
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
        title={editing ? (isAr ? 'تعديل مركز الخدمة' : 'Edit Service Center') : (isAr ? 'إضافة مركز خدمة' : 'Add Service Center')}
        width={760}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label={isAr ? 'الرمز' : 'Code'} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="presidentName" label={isAr ? 'اسم الرئيس' : 'President Name'}>
            <Input />
          </Form.Item>
          <Form.Item name="vicePresidentName" label={isAr ? 'اسم نائب الرئيس' : 'Vice President Name'}>
            <Input />
          </Form.Item>
          <Form.Item name="maxCapacity" label={isAr ? 'السعة القصوى' : 'Max Capacity'}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.List name="companies">
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text strong>{isAr ? 'توزيع البعثات على المركز' : 'Pilgrim Company Allocations'}</Typography.Text>
                {fields.map((field) => (
                  <Space key={field.key} align="start" style={{ display: 'flex' }}>
                    <Form.Item
                      name={[field.name, 'pilgrimCompanyId']}
                      rules={[{ required: true, message: isAr ? 'اختر شركة حجاج' : 'Select company' }]}
                    >
                      <Select
                        style={{ minWidth: 320 }}
                        options={companies.map((c) => ({ value: c.id, label: `${c.externalCode} - ${c.name}` }))}
                        placeholder={isAr ? 'اختر شركة الحجاج' : 'Select pilgrim company'}
                      />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'allocatedPilgrims']}
                      rules={[{ required: true, message: isAr ? 'أدخل عدد الحجاج' : 'Enter pilgrim count' }]}
                    >
                      <InputNumber min={0} placeholder={isAr ? 'عدد الحجاج' : 'Pilgrim count'} />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>{isAr ? 'إزالة' : 'Remove'}</Button>
                  </Space>
                ))}
                <Button onClick={() => add()}>{isAr ? 'إضافة توزيع' : 'Add Allocation'}</Button>
              </Space>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Space>
  );
}
