import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Result, Typography, Select } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { registerEmployee } from '../../api/users';
import { getLocations } from '../../api/locations';
import { getShifts } from '../../api/shifts';
import { ROUTES } from '../../utils/constants';

const { Title, Text } = Typography;

export function SignUpNormalPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [shiftsForEmployee, setShiftsForEmployee] = useState([]);

  useEffect(() => {
    getLocations({ isActive: 'true' }).then(setLocations).catch(() => setLocations([]));
    getShifts({ isForEmployee: 'true' }).then(setShiftsForEmployee).catch(() => setShiftsForEmployee([]));
  }, []);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      await registerEmployee({
        fullName: values.fullName?.trim(),
        fullNameAr: values.fullNameAr?.trim() || undefined,
        email: values.email?.trim(),
        phone: values.phone?.trim() || undefined,
        password: values.password,
        locationId: values.locationId,
        shiftId: values.shiftId,
        supervisorId: values.supervisorId || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      const d = err?.details;
      const msg =
        typeof d === 'string'
          ? d
          : Array.isArray(d) && d.every((x) => x && typeof x.msg === 'string')
            ? d.map((x) => x.msg).join('. ')
            : err?.message || t('signUp.error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '48px 16px' }}>
        <Result
          status="success"
          title={t('signUp.success')}
          subTitle={t('auth.login')}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 16px' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          <UserAddOutlined /> {t('nav.signUpNormal')}
        </Title>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item name="fullName" label={t('signUp.fullName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullNameAr" label={t('signUp.fullNameAr')}>
            <Input dir="rtl" />
          </Form.Item>
          <Form.Item name="email" label={t('signUp.email')} rules={[{ required: true }]}>
            <Input placeholder="0567387950" />
          </Form.Item>
          <Form.Item name="phone" label={t('signUp.phone')}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={t('signUp.password')} rules={[{ required: true, min: 6, message: t('signUp.password') }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="locationId" label={t('signUp.location')} rules={[{ required: true, message: t('signUp.locationRequired') }]}>
            <Select
              placeholder={t('signUp.selectLocation')}
              allowClear
              showSearch
              optionFilterProp="label"
              options={locations.filter((l) => l.isActive).map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>
          <Form.Item name="shiftId" label={t('signUp.shift')} rules={[{ required: true, message: t('signUp.shiftRequired') }]}>
            <Select
              placeholder={t('signUp.selectShift')}
              allowClear
              showSearch
              optionFilterProp="label"
              options={shiftsForEmployee.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="supervisorId" label={t('signUp.supervisorId')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} icon={<UserAddOutlined />}>
              {t('signUp.submit')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary"><Link to={ROUTES.LOGIN}>{t('auth.login')}</Link></Text>
        </div>
      </Card>
    </div>
  );
}
