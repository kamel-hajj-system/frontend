import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Result, Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { registerServiceCenter } from '../../api/users';
import { ROUTES } from '../../utils/constants';

const { Title, Text } = Typography;

export function SignUpServiceCenterPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setError('');
    setLoading(true);
    try {
      await registerServiceCenter({
        fullName: values.fullName?.trim(),
        fullNameAr: values.fullNameAr?.trim() || undefined,
        email: values.email?.trim(),
        phone: values.phone?.trim() || undefined,
        password: values.password,
        serviceCenterId: values.serviceCenterId?.trim() || undefined,
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
        <Result status="success" title={t('signUp.success')} subTitle={t('auth.login')} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 16px' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          <TeamOutlined /> {t('nav.signUpServiceCenter')}
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
          <Form.Item name="serviceCenterId" label={t('signUp.serviceCenterId')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} icon={<TeamOutlined />}>
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
