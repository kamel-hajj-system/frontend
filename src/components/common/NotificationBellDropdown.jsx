import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown, Empty, Grid, Spin, Typography, theme } from 'antd';
import { useLanguage } from '../../contexts/LanguageContext';
import { getMyNotifications, getUnreadNotificationsCount, markNotificationAsRead } from '../../api/notifications';

const PREVIEW_LIMIT = 3;

const { useBreakpoint } = Grid;

/**
 * Bell icon with hover + click dropdown: latest notifications + "Show all".
 */
export function NotificationBellDropdown({ allNotificationsPath, placement = 'bottomRight' }) {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { token } = theme.useToken();
  const isAr = lang === 'ar';
  const screens = useBreakpoint();
  const isMdUp = screens.md ?? true;
  const dropdownTrigger = isMdUp ? ['click', 'hover'] : ['click'];

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState([]);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await getUnreadNotificationsCount();
      setUnreadCount(res?.unread ?? 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    try {
      const res = await getMyNotifications({ page: 1, limit: PREVIEW_LIMIT });
      setPreview(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setPreview([]);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
  }, [fetchUnread]);

  useEffect(() => {
    if (open) {
      loadPreview();
      fetchUnread();
    }
  }, [open, loadPreview, fetchUnread]);

  const formatTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
        hour12: false,
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const truncate = (text, max = 72) => {
    if (!text || typeof text !== 'string') return '';
    const s = text.trim();
    return s.length <= max ? s : `${s.slice(0, max)}…`;
  };

  const onItemClick = async (recipient) => {
    if (!recipient?.isRead && recipient?.id) {
      try {
        await markNotificationAsRead(recipient.id);
        setPreview((prev) => prev.map((r) => (r.id === recipient.id ? { ...r, isRead: true } : r)));
        setUnreadCount((n) => (n > 0 ? n - 1 : 0));
      } catch {
        // still navigate
      }
    }
    setOpen(false);
    navigate(allNotificationsPath);
  };

  const dropdownRender = () => (
    <div
      className="kamel-notif-dropdown-panel"
      style={{
        width: 'min(calc(100vw - 32px), 380px)',
        maxHeight: 420,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
        background: token.colorBgElevated,
        border: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: token.colorText,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          background: token.colorBgElevated,
        }}
      >
        <Typography.Text strong style={{ fontSize: 15, color: token.colorText }}>
          {t('notifications.dropdownTitle')}
        </Typography.Text>
        {unreadCount > 0 && (
          <Badge count={unreadCount} style={{ backgroundColor: token.colorPrimary }} />
        )}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 120,
          maxHeight: 280,
          overflowY: 'auto',
          padding: 8,
          background: token.colorBgElevated,
        }}
      >
        {loadingPreview ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spin />
          </div>
        ) : preview.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('notifications.emptyPreview')}
            style={{ margin: '16px 0' }}
            styles={{ description: { color: token.colorTextSecondary } }}
          />
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {preview.map((item) => {
              const title = item.notification?.title || (isAr ? 'إشعار' : 'Notice');
              const msg = item.notification?.message || '';
              const time = formatTime(item.notification?.createdAt || item.createdAt);
              const unread = !item.isRead;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(item)}
                    style={{
                      width: '100%',
                      textAlign: isAr ? 'right' : 'left',
                      direction: isAr ? 'rtl' : 'ltr',
                      border: 'none',
                      background: unread ? token.colorPrimaryBg : 'transparent',
                      borderRadius: token.borderRadius,
                      padding: '10px 12px',
                      marginBottom: 6,
                      cursor: 'pointer',
                      display: 'block',
                      transition: 'background 0.2s',
                      color: token.colorText,
                    }}
                    className="kamel-notif-dropdown-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between' }}>
                      <Typography.Text strong ellipsis style={{ flex: 1, fontSize: 13, color: token.colorText }}>
                        {title}
                      </Typography.Text>
                      {unread && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: token.colorPrimary,
                            flexShrink: 0,
                            marginTop: 5,
                          }}
                          aria-hidden
                        />
                      )}
                    </div>
                    <Typography.Text
                      style={{
                        display: 'block',
                        fontSize: 12,
                        marginTop: 4,
                        lineHeight: 1.35,
                        color: token.colorTextSecondary,
                      }}
                    >
                      {truncate(msg)}
                    </Typography.Text>
                    <Typography.Text
                      style={{ fontSize: 11, marginTop: 6, display: 'block', color: token.colorTextTertiary }}
                    >
                      {time}
                    </Typography.Text>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div
        style={{
          padding: '10px 12px',
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgElevated,
        }}
      >
        <Button type="primary" block onClick={() => { setOpen(false); navigate(allNotificationsPath); }}>
          {t('notifications.showAll')}
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={dropdownTrigger}
      placement={placement}
      dropdownRender={dropdownRender}
    >
      <Button
        type="text"
        aria-label={t('nav.notifications')}
        icon={
          <Badge count={unreadCount} size="small">
            <BellOutlined style={{ fontSize: 18 }} />
          </Badge>
        }
      />
    </Dropdown>
  );
}
