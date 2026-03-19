import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, List, Space, Typography, message } from 'antd';
import { BellOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getMyNotifications, markNotificationAsRead } from '../../../api/notifications';
import { WebPushSettings } from '../../../components/pwa/WebPushSettings';

const { Text, Paragraph } = Typography;

export function NotificationsPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyNotifications({ page: 1, limit: 100 });
      setRows(res.data || []);
      setUnread(res.unread || 0);
    } catch (err) {
      message.error(err?.message || (isAr ? 'تعذر تحميل الإشعارات' : 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, isRead: true, readAt: new Date().toISOString() } : r)));
      setUnread((n) => (n > 0 ? n - 1 : 0));
    } catch (err) {
      message.error(err?.message || (isAr ? 'تعذر تحديث الإشعار' : 'Failed to update notification'));
    }
  };

  return (
    <Card
      title={
        <Space>
          <BellOutlined />
          <span>{isAr ? 'الإشعارات' : 'Notifications'}</span>
          <Badge count={unread} />
        </Space>
      }
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          {isAr ? 'تحديث' : 'Refresh'}
        </Button>
      }
    >
      <WebPushSettings />
      <List
        loading={loading}
        locale={{ emptyText: isAr ? 'لا توجد إشعارات' : 'No notifications' }}
        dataSource={rows}
        renderItem={(item) => (
          <List.Item
            actions={
              item.isRead
                ? [<Text type="secondary">{isAr ? 'مقروء' : 'Read'}</Text>]
                : [
                    <Button size="small" icon={<CheckOutlined />} onClick={() => markRead(item.id)}>
                      {isAr ? 'تحديد كمقروء' : 'Mark as read'}
                    </Button>,
                  ]
            }
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{item.notification?.title || (isAr ? 'إشعار جديد' : 'New notification')}</Text>
                  {!item.isRead && <Badge status="processing" text={isAr ? 'جديد' : 'New'} />}
                </Space>
              }
              description={
                <div>
                  <Paragraph style={{ marginBottom: 8 }}>{item.notification?.message}</Paragraph>
                  <Text type="secondary">
                    {new Date(item.notification?.createdAt || item.createdAt).toLocaleString(
                      isAr ? 'ar-SA' : 'en-US',
                      { hour12: false }
                    )}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

