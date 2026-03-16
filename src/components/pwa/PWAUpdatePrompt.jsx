import React from 'react';
import { Modal, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * PWA: shows a modal when a new service worker is available so the user can refresh.
 */
export function PWAUpdatePrompt() {
  const { t } = useLanguage();
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      if (r) r.update();
    },
  });

  const handleReload = () => {
    updateServiceWorker?.(true);
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <Modal
      open
      title={t('pwa.updateTitle')}
      onCancel={() => setNeedRefresh(false)}
      footer={[
        <Button key="later" onClick={() => setNeedRefresh(false)}>{t('common.later')}</Button>,
        <Button key="reload" type="primary" icon={<ReloadOutlined />} onClick={handleReload}>{t('pwa.refresh')}</Button>,
      ]}
    >
      <p>{t('pwa.updateMessage')}</p>
    </Modal>
  );
}
