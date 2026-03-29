import React, { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Tooltip, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';

function isStandalonePWA() {
  if (typeof window === 'undefined') return true;
  try {
    if (window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.navigator.standalone === true) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Android/Chrome: uses beforeinstallprompt. iOS Safari: opens steps for “Add to Home Screen”.
 * Hidden when the app is already running as an installed PWA.
 */
export function PWAInstallButton({ size = 'large', compact = false, block = false }) {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [iosModalOpen, setIosModalOpen] = useState(false);

  useEffect(() => {
    if (isStandalonePWA()) {
      setShowButton(false);
      return undefined;
    }

    const onBip = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', onBip);

    const onInstalled = () => {
      setDeferredPrompt(null);
      setShowButton(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    if (isIOSDevice()) {
      setShowButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
      } catch {
        /* ignore */
      }
      setDeferredPrompt(null);
      setShowButton(false);
      return;
    }
    if (isIOSDevice()) {
      setIosModalOpen(true);
    }
  }, [deferredPrompt]);

  if (!showButton) return null;

  const btnSize = compact ? 'small' : size;

  const trigger = (
    <Button
      type={block ? 'default' : 'text'}
      shape={block ? 'default' : 'circle'}
      size={btnSize}
      block={block}
      icon={<DownloadOutlined />}
      onClick={handleInstallClick}
      aria-label={t('pwa.installAria')}
      style={block ? { marginBottom: 8 } : undefined}
    >
      {block ? t('pwa.install') : null}
    </Button>
  );

  return (
    <>
      {block ? (
        trigger
      ) : (
        <Tooltip title={t('pwa.install')} placement="bottom">
          {trigger}
        </Tooltip>
      )}
      <Modal
        title={t('pwa.iosInstallTitle')}
        open={iosModalOpen}
        onCancel={() => setIosModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
          {t('pwa.iosInstallIntro')}
        </Typography.Paragraph>
        <ol style={{ margin: 0, paddingInlineStart: 20, lineHeight: 1.75 }}>
          <li>{t('pwa.iosStep1')}</li>
          <li>{t('pwa.iosStep2')}</li>
          <li>{t('pwa.iosStep3')}</li>
        </ol>
      </Modal>
    </>
  );
}
