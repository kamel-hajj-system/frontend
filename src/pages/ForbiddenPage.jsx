import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ROUTES } from '../utils/constants';

export function ForbiddenPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: 24 }}>
      <Result
        status="403"
        title="403"
        subTitle={t('forbidden.message')}
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
            {t('forbidden.backHome')}
          </Button>
        }
      />
    </div>
  );
}
