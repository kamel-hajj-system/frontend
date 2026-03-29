import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { LoginOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROUTES } from '../../utils/constants';
import { KamelLogo } from '../../components/common/KamelLogo';
import { getAuthenticatedLandingRoute } from '../../utils/authRedirect';

const { Title, Text, Paragraph } = Typography;

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
    <div
      className="min-h-[min(100%,calc(100vh-5rem))] w-full flex flex-col items-center px-4 py-8 sm:py-12"
      style={{
        background:
          'linear-gradient(165deg, var(--color-primary-muted) 0%, transparent 42%, var(--color-surface) 100%)',
      }}
    >
      <div className="w-full max-w-lg">
        <div
          className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 pb-6 pt-8 sm:px-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex items-center justify-center">
                <KamelLogo height={48} alt={t('app.shortName')} />
              </div>
              <Title level={3} className="!mb-2 !mt-0" style={{ color: 'var(--color-text)' }}>
                {t('auth.login')}
              </Title>
              <Paragraph
                className="!mb-0 max-w-md text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {t('auth.loginIntro')}
              </Paragraph>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            {error && (
              <Alert type="error" message={error} showIcon className="mb-6 rounded-xl" />
            )}
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
              <Form.Item
                name="email"
                label={t('auth.email')}
                rules={[{ required: true, message: t('auth.email') }]}
              >
                <Input
                  autoComplete="username"
                  placeholder={t('auth.email')}
                  prefix={<MailOutlined className="text-[var(--color-muted-foreground)]" />}
                  className="rounded-xl"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label={t('auth.password')}
                rules={[{ required: true, message: t('auth.password') }]}
              >
                <Input.Password
                  autoComplete="current-password"
                  placeholder={t('auth.password')}
                  prefix={<LockOutlined className="text-[var(--color-muted-foreground)]" />}
                  className="rounded-xl"
                />
              </Form.Item>
              <Form.Item className="!mb-0 mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  icon={<LoginOutlined />}
                  className="h-12 rounded-xl font-medium shadow-sm"
                >
                  {t('auth.login')}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Text type="secondary" className="text-sm">
            <Link
              to={ROUTES.SIGN_UP_NORMAL}
              className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              {t('nav.signUpNormal')}
            </Link>
            <span className="mx-2 text-[var(--color-muted-foreground)]" aria-hidden>
              ·
            </span>
            <Link
              to={ROUTES.SIGN_UP_SERVICE_CENTER}
              className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              {t('nav.signUpServiceCenter')}
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
