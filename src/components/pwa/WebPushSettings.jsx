import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Space, Typography } from 'antd';
import { BellOutlined, CloseOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getVapidPublicKey, pushSubscribe, pushUnsubscribe } from '../../api/push';
import { isWebPushSupported, urlBase64ToUint8Array } from '../../utils/webPush';

const { Text, Paragraph } = Typography;

export function WebPushSettings() {
  const { t } = useLanguage();
  const [serverEnabled, setServerEnabled] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const supported = isWebPushSupported();

  const syncLocalSubscription = useCallback(async () => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(Boolean(sub));
    } catch {
      setSubscribed(false);
    }
  }, [supported]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCheckingServer(true);
      try {
        const res = await getVapidPublicKey();
        if (!cancelled) setServerEnabled(Boolean(res?.enabled && res?.publicKey));
      } catch {
        if (!cancelled) setServerEnabled(false);
      } finally {
        if (!cancelled) setCheckingServer(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    syncLocalSubscription();
  }, [syncLocalSubscription, serverEnabled]);

  const enablePush = async () => {
    setError('');
    if (!supported || !serverEnabled) return;
    setBusy(true);
    try {
      const { publicKey, enabled } = await getVapidPublicKey();
      if (!enabled || !publicKey) {
        setError(t('notifications.webPushServerOff'));
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError(t('notifications.webPushDenied'));
        return;
      }
      const key = urlBase64ToUint8Array(publicKey);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
      const json = sub.toJSON();
      await pushSubscribe({
        endpoint: json.endpoint,
        keys: json.keys,
      });
      setSubscribed(true);
    } catch (e) {
      setError(e?.message || t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  const disablePush = async () => {
    setError('');
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        try {
          await pushUnsubscribe({ endpoint });
        } catch {
          /* still try to unsubscribe locally */
        }
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (e) {
      setError(e?.message || t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  if (checkingServer) {
    return null;
  }

  if (!supported) {
    return (
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message={t('notifications.webPushNotSupported')}
      />
    );
  }

  if (!serverEnabled) {
    return (
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={t('notifications.webPushServerOff')}
      />
    );
  }

  return (
    <Alert
      type="success"
      showIcon
      icon={<BellOutlined />}
      style={{ marginBottom: 16 }}
      message={t('notifications.webPushTitle')}
      description={
        <div>
          <Paragraph style={{ marginBottom: 12 }}>{t('notifications.webPushHint')}</Paragraph>
          {error ? (
            <Text type="danger" style={{ display: 'block', marginBottom: 8 }}>
              {error}
            </Text>
          ) : null}
          <Space wrap>
            {!subscribed ? (
              <Button type="primary" icon={<BellOutlined />} loading={busy} onClick={enablePush}>
                {t('notifications.webPushEnable')}
              </Button>
            ) : (
              <Button icon={<CloseOutlined />} loading={busy} onClick={disablePush}>
                {t('notifications.webPushDisable')}
              </Button>
            )}
          </Space>
        </div>
      }
    />
  );
}
