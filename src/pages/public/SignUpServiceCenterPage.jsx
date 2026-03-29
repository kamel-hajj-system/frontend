import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Result, Typography, Select, Spin } from 'antd';
import { TeamOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { registerServiceCenter } from '../../api/users';
import { getPublicServiceCenters } from '../../api/serviceCenters';
import { ROUTES } from '../../utils/constants';
import { KamelLogo } from '../../components/common/KamelLogo';

const { Title, Text, Paragraph } = Typography;

export function SignUpServiceCenterPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCenters(true);
    getPublicServiceCenters()
      .then((rows) => {
        if (!cancelled) setCenters(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setCenters([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCenters(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        serviceCenterId: values.serviceCenterId,
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

  const shell = (children) => (
    <div
      className="min-h-[min(100%,calc(100vh-5rem))] w-full flex flex-col items-center px-4 py-8 sm:py-12"
      style={{
        background:
          'linear-gradient(165deg, var(--color-primary-muted) 0%, transparent 42%, var(--color-surface) 100%)',
      }}
    >
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );

  if (success) {
    return shell(
      <div
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <Result status="success" title={t('signUp.success')} subTitle={t('signUp.successPending')} />
      </div>,
    );
  }

  return shell(
    <>
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
              {t('nav.signUpServiceCenter')}
            </Title>
            <Paragraph
              className="!mb-0 max-w-md text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {t('signUp.serviceCenterIntro')}
            </Paragraph>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          {error && (
            <Alert type="error" message={error} showIcon className="mb-6 rounded-xl" />
          )}
          {!loadingCenters && centers.length === 0 && (
            <Alert
              type="warning"
              message={t('signUp.noCentersYet')}
              showIcon
              className="mb-6 rounded-xl"
            />
          )}
          <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off" size="large">
            <Form.Item name="fullName" label={t('signUp.fullName')} rules={[{ required: true }]}>
              <Input placeholder={t('signUp.fullName')} className="rounded-xl" />
            </Form.Item>
            <Form.Item name="fullNameAr" label={t('signUp.fullNameAr')}>
              <Input dir="rtl" placeholder={t('signUp.fullNameAr')} className="rounded-xl" />
            </Form.Item>
            <Form.Item
              name="email"
              label={t('signUp.email')}
              rules={[
                { required: true, message: t('signUp.emailRequired') },
                { type: 'email', message: t('signUp.emailInvalid') },
              ]}
            >
              <Input
                type="email"
                autoComplete="email"
                placeholder={t('signUp.emailPlaceholder')}
                prefix={<MailOutlined className="text-[var(--color-muted-foreground)]" />}
                className="rounded-xl"
              />
            </Form.Item>
            <Form.Item name="phone" label={t('signUp.phone')}>
              <Input
                inputMode="tel"
                autoComplete="tel"
                placeholder={t('signUp.phonePlaceholder')}
                prefix={<PhoneOutlined className="text-[var(--color-muted-foreground)]" />}
                className="rounded-xl"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={t('signUp.password')}
              rules={[{ required: true, min: 6, message: t('signUp.password') }]}
            >
              <Input.Password
                autoComplete="new-password"
                placeholder={t('signUp.password')}
                prefix={<LockOutlined className="text-[var(--color-muted-foreground)]" />}
                className="rounded-xl"
              />
            </Form.Item>
            <Form.Item
              name="serviceCenterId"
              label={t('signUp.selectServiceCenter')}
              rules={[{ required: true, message: t('signUp.serviceCenterRequired') }]}
              extra={
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                  {t('signUp.serviceCenterSelectHint')}
                </span>
              }
            >
              {loadingCenters ? (
                <div className="flex justify-center py-4">
                  <Spin />
                </div>
              ) : (
                <Select
                  placeholder={t('signUp.selectServiceCenter')}
                  allowClear={false}
                  showSearch
                  optionFilterProp="label"
                  size="large"
                  className="rounded-xl"
                  popupClassName="rounded-xl"
                  options={centers.map((c) => {
                    const labelName = isAr ? c.nameAr || c.name : c.name;
                    return {
                      value: c.id,
                      label: labelName ? `[${c.code}] ${labelName}` : `[${c.code}]`,
                    };
                  })}
                  notFoundContent={isAr ? 'لا توجد مراكز مسجلة بعد' : 'No centers available yet'}
                />
              )}
            </Form.Item>
            <Form.Item className="!mb-0 mt-2">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                icon={<TeamOutlined />}
                className="h-12 rounded-xl font-medium shadow-sm"
              >
                {t('signUp.submit')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Text type="secondary" className="text-sm">
          <Link to={ROUTES.LOGIN} className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
            {t('auth.login')}
          </Link>
        </Text>
      </div>
    </>,
  );
}
