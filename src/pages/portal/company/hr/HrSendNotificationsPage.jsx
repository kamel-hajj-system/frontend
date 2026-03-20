import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Divider,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { BellOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getHrUsers } from '../../../../api/users';
import { getLocations } from '../../../../api/locations';
import {
  hrSendNotifications,
  hrScheduleNotification,
  getMyScheduledNotifications,
  cancelScheduledNotification,
} from '../../../../api/notifications';
import { USER_TYPES } from '../../../../utils/constants';
import { NotificationSchedulePanel } from '../../../../components/notifications/NotificationSchedulePanel';

const { TextArea } = Input;
const { Title, Text } = Typography;

export function HrSendNotificationsPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const canHr = user?.isHr;
  const canEdit = canHr && (user?.role === 'Supervisor' || user?.role === 'EmpManage');

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [q, setQ] = useState('');
  const [userType, setUserType] = useState(undefined);
  const [locationId, setLocationId] = useState(undefined);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledRows, setScheduledRows] = useState([]);
  const [loadingSched, setLoadingSched] = useState(false);

  const loadScheduled = useCallback(async () => {
    if (!canEdit) return;
    setLoadingSched(true);
    try {
      const res = await getMyScheduledNotifications();
      const all = res?.data || [];
      setScheduledRows(all.filter((r) => r.scope === 'hr'));
    } catch {
      setScheduledRows([]);
    } finally {
      setLoadingSched(false);
    }
  }, [canEdit]);

  const fetchData = useCallback(async () => {
    if (!canEdit) return;
    setLoading(true);
    try {
      const [u, l] = await Promise.all([
        getHrUsers({
          limit: 500,
          q: q || undefined,
          userType: userType || undefined,
          locationId: locationId || undefined,
          isDeleted: false,
          isActive: true,
        }),
        getLocations(),
      ]);
      setUsers(u.data || []);
      setLocations(l || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'تعذر تحميل البيانات' : 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [canEdit, isAr, locationId, q, userType]);

  useEffect(() => {
    if (canEdit) {
      fetchData();
      loadScheduled();
    }
  }, [canEdit, fetchData, loadScheduled]);

  const sendNow = async () => {
    if (!body.trim()) {
      message.warning(isAr ? 'اكتب نص الإشعار' : 'Enter notification message');
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.warning(isAr ? 'اختر مستخدمين' : 'Select users');
      return;
    }
    setSending(true);
    try {
      const res = await hrSendNotifications({
        title: title.trim() || undefined,
        message: body.trim(),
        userIds: selectedRowKeys,
      });
      message.success(isAr ? `تم الإرسال إلى ${res.sent || 0}` : `Sent to ${res.sent || 0} user(s)`);
      setTitle('');
      setBody('');
      setSelectedRowKeys([]);
    } catch (err) {
      message.error(err?.message || (isAr ? 'فشل الإرسال' : 'Send failed'));
    } finally {
      setSending(false);
    }
  };

  const schedule = async (schedulePayload) => {
    if (!body.trim()) {
      message.warning(isAr ? 'اكتب نص الإشعار' : 'Enter notification message');
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.warning(isAr ? 'اختر مستخدمين' : 'Select users');
      return;
    }
    setScheduling(true);
    try {
      await hrScheduleNotification({
        title: title.trim() || undefined,
        message: body.trim(),
        userIds: selectedRowKeys,
        ...schedulePayload,
      });
      message.success(isAr ? 'تمت الجدولة' : 'Scheduled');
      await loadScheduled();
    } catch (err) {
      message.error(err?.message || (isAr ? 'فشلت الجدولة' : 'Schedule failed'));
    } finally {
      setScheduling(false);
    }
  };

  const cancelJob = useCallback(
    async (id) => {
      try {
        await cancelScheduledNotification(id);
        message.success(isAr ? 'أُلغيت الجدولة' : 'Cancelled');
        await loadScheduled();
      } catch (err) {
        message.error(err?.message || (isAr ? 'تعذر الإلغاء' : 'Cancel failed'));
      }
    },
    [isAr, loadScheduled]
  );

  const columns = useMemo(
    () => [
      {
        title: isAr ? 'الاسم' : 'Name',
        key: 'name',
        render: (_, row) => (isAr ? row.fullNameAr || row.fullName : row.fullName || row.fullNameAr) || '',
      },
      { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
      {
        title: isAr ? 'النوع' : 'User type',
        dataIndex: 'userType',
        key: 'userType',
        render: (v) => <Tag>{v}</Tag>,
      },
      {
        title: isAr ? 'الموقع' : 'Location',
        key: 'loc',
        render: (_, row) =>
          row.shiftLocation ? (isAr ? row.shiftLocation.locationAr || row.shiftLocation.name : row.shiftLocation.name) : '—',
      },
    ],
    [isAr]
  );

  const schedColumns = useMemo(
    () => [
      {
        title: isAr ? 'النوع' : 'Kind',
        dataIndex: 'scheduleKind',
        key: 'scheduleKind',
        width: 110,
        render: (k) => (k === 'ONCE' ? (isAr ? 'مرة' : 'Once') : isAr ? 'يومي' : 'Daily'),
      },
      {
        title: isAr ? 'متى' : 'When',
        key: 'when',
        render: (_, row) => {
          if (row.scheduleKind === 'ONCE' && row.scheduledAt) {
            return new Date(row.scheduledAt).toLocaleString(isAr ? 'ar-SA' : 'en-US', { hour12: false });
          }
          if (row.scheduleKind === 'DAILY_RANGE') {
            const a = row.rangeStartDate ? new Date(row.rangeStartDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : '';
            const b = row.rangeEndDate ? new Date(row.rangeEndDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : '';
            return `${a} → ${b} @ ${row.dailyTimeLocal || ''}`;
          }
          return '—';
        },
      },
      {
        title: isAr ? 'العنوان' : 'Title',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
        render: (v) => v || '—',
      },
      {
        title: '',
        key: 'actions',
        width: 100,
        render: (_, row) => (
          <Button type="link" danger size="small" onClick={() => cancelJob(row.id)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
        ),
      },
    ],
    [isAr, cancelJob]
  );

  if (!canHr) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  if (!canEdit) {
    return <Alert type="warning" message={isAr ? 'للمشرف أو EmpManage فقط' : 'Supervisor or EmpManage only'} showIcon />;
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <BellOutlined /> {isAr ? 'إرسال إشعارات (الموارد البشرية)' : 'HR: send notifications'}
      </Title>

      <Card
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => { fetchData(); loadScheduled(); }}>
            {isAr ? 'تحديث' : 'Refresh'}
          </Button>
        }
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            style={{ width: 220 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onPressEnter={fetchData}
            allowClear
            placeholder={isAr ? 'بحث' : 'Search'}
          />
          <Select
            allowClear
            style={{ width: 200 }}
            value={userType}
            onChange={setUserType}
            placeholder={isAr ? 'نوع المستخدم' : 'User type'}
            options={[
              { value: USER_TYPES.COMPANY, label: USER_TYPES.COMPANY },
              { value: USER_TYPES.SERVICE_CENTER, label: USER_TYPES.SERVICE_CENTER },
            ]}
          />
          <Select
            allowClear
            style={{ width: 260 }}
            value={locationId}
            onChange={setLocationId}
            placeholder={isAr ? 'الموقع' : 'Location'}
            options={locations.map((loc) => ({
              value: loc.id,
              label: isAr ? loc.locationAr || loc.name : loc.name,
            }))}
          />
          <Button onClick={fetchData}>{isAr ? 'تطبيق الفلاتر' : 'Apply filters'}</Button>
        </Space>

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? 'عنوان (اختياري)' : 'Title (optional)'}
              maxLength={200}
            />
            <TextArea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder={isAr ? 'نص الإشعار' : 'Message'}
            />
            <Space wrap>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={sending}
                onClick={sendNow}
                disabled={selectedRowKeys.length === 0}
              >
                {isAr ? 'إرسال الآن' : 'Send now'}
              </Button>
              <Text type="secondary">
                {isAr ? `المحددون: ${selectedRowKeys.length}` : `Selected: ${selectedRowKeys.length}`}
              </Text>
            </Space>
          </Space>

          <Divider>{isAr ? 'جدولة' : 'Schedule'}</Divider>
          <NotificationSchedulePanel
            isAr={isAr}
            submitting={scheduling}
            disabled={selectedRowKeys.length === 0}
            onSchedule={schedule}
            timeZoneHint={
              isAr
                ? 'الوقت يُفسَّر حسب المنطقة الزمنية الرياض (Asia/Riyadh) على الخادم.'
                : 'Times are interpreted in Asia/Riyadh on the server.'
            }
          />

          <Table
            rowKey="id"
            loading={loading}
            size="small"
            columns={columns}
            dataSource={users}
            pagination={{ pageSize: 15 }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              preserveSelectedRowKeys: true,
            }}
          />

          <Title level={5}>{isAr ? 'مجدول (معلق)' : 'Pending scheduled'}</Title>
          <Table
            rowKey="id"
            loading={loadingSched}
            size="small"
            columns={schedColumns}
            dataSource={scheduledRows}
            pagination={false}
            locale={{ emptyText: isAr ? 'لا شيء' : 'Nothing scheduled' }}
          />
        </Space>
      </Card>
    </div>
  );
}
