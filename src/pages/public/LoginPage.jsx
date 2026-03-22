import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROUTES } from '../../utils/constants';
import { getAuthenticatedLandingRoute } from '../../utils/authRedirect';

const { Title, Text } = Typography;

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [error, setError] = React.useState('');

  const from = location.state?.from?.pathname;

  const onFinish = async (values) => {
    setError('');
    try {
      const loggedInUser = await login(values.email, values.password);
      const defaultDest = getAuthenticatedLandingRoute(loggedInUser);
      const guestOnlyPaths =
        !from ||
        from === ROUTES.HOME ||
        from === ROUTES.LOGIN ||
        from.startsWith('/sign-up');
      const target = guestOnlyPaths ? defaultDest : from;
      setTimeout(() => navigate(target, { replace: true }), 0);
    } catch (err) {
      setError(err?.details || err?.message || t('auth.loginError'));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '48px 16px' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          <LoginOutlined /> {t('auth.login')}
        </Title>
        {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            label={t('auth.email')}
            rules={[{ required: true, message: t('auth.email') }]}
          >
            <Input placeholder={t('auth.email')} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[{ required: true, message: t('auth.password') }]}
          >
            <Input.Password placeholder={t('auth.password')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block icon={<LoginOutlined />}>
              {t('auth.login')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            <Link to={ROUTES.SIGN_UP_NORMAL}>{t('nav.signUpNormal')}</Link>
            {' · '}
            <Link to={ROUTES.SIGN_UP_SERVICE_CENTER}>{t('nav.signUpServiceCenter')}</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
