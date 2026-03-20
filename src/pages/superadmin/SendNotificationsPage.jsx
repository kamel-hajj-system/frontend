import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Divider, Input, message, Select, Space, Table, Tag, Typography } from 'antd';
import { BellOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { USER_TYPES } from '../../utils/constants';
import { getLocations } from '../../api/locations';
import { getUsers } from '../../api/users';
import {
  sendNotifications,
  superadminScheduleNotification,
  getMyScheduledNotifications,
  cancelScheduledNotification,
} from '../../api/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import { NotificationSchedulePanel } from '../../components/notifications/NotificationSchedulePanel';

const { TextArea } = Input;
const { Title } = Typography;

export function SendNotificationsPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [q, setQ] = useState('');
  const [userType, setUserType] = useState(undefined);
  const [locationId, setLocationId] = useState(undefined);
  const [sendToAllFiltered, setSendToAllFiltered] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduledRows, setScheduledRows] = useState([]);
  const [loadingSched, setLoadingSched] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, l] = await Promise.all([
        getUsers({
          limit: 500,
          q: q || undefined,
          userType: userType || undefined,
          locationId: locationId || undefined,
          isDeleted: false,
          isActive: true,
        }),
        getLocations(),
      ]);
      const filteredUsers = (u.data || []).filter(
        (x) => x.userType === USER_TYPES.COMPANY || x.userType === USER_TYPES.SERVICE_CENTER
      );
      setUsers(filteredUsers);
      setLocations(l || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'تعذر تحميل البيانات' : 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [isAr, locationId, q, userType]);

  const loadScheduled = useCallback(async () => {
    setLoadingSched(true);
    try {
      const res = await getMyScheduledNotifications();
      const all = res?.data || [];
      setScheduledRows(all.filter((r) => r.scope === 'superadmin'));
    } catch {
      setScheduledRows([]);
    } finally {
      setLoadingSched(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    loadScheduled();
  }, [loadScheduled]);

  const recipientIdsForSchedule = useMemo(() => {
    if (sendToAllFiltered) return users.map((u) => u.id);
    return selectedRowKeys;
  }, [sendToAllFiltered, selectedRowKeys, users]);

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
      { title: isAr ? 'الاسم' : 'Name', dataIndex: 'fullName', key: 'fullName' },
      { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
      {
        title: isAr ? 'نوع المستخدم' : 'User type',
        dataIndex: 'userType',
        key: 'userType',
        render: (v) => <Tag>{v}</Tag>,
      },
      {
        title: isAr ? 'الموقع' : 'Location',
        key: 'location',
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

  const send = async () => {
    if (!body.trim()) {
      message.warning(isAr ? 'اكتب نص الإشعار' : 'Please enter notification text');
      return;
    }
    if (!sendToAllFiltered && selectedRowKeys.length === 0) {
      message.warning(isAr ? 'اختر مستخدمين أو فعل الإرسال للجميع' : 'Select users or enable send to all');
      return;
    }
    setSending(true);
    try {
      const res = await sendNotifications({
        title: title || undefined,
        message: body.trim(),
        sendToAll: sendToAllFiltered,
        userIds: sendToAllFiltered ? [] : selectedRowKeys,
        userType: userType || undefined,
        locationId: locationId || undefined,
      });
      message.success(
        isAr ? `تم إرسال الإشعار إلى ${res.sent || 0} مستخدم` : `Notification sent to ${res.sent || 0} users`
      );
      setSelectedRowKeys([]);
      setTitle('');
      setBody('');
    } catch (err) {
      message.error(err?.message || (isAr ? 'فشل إرسال الإشعار' : 'Failed to send notification'));
    } finally {
      setSending(false);
    }
  };

  const schedule = async (schedulePayload) => {
    if (!body.trim()) {
      message.warning(isAr ? 'اكتب نص الإشعار' : 'Please enter notification text');
      return;
    }
    if (recipientIdsForSchedule.length === 0) {
      message.warning(
        isAr
          ? 'لا مستلمين: حدد صفوفًا أو فعّل الإرسال لكل المستخدمين المصفّاة'
          : 'No recipients: select rows or enable send-to-all filtered'
      );
      return;
    }
    setScheduling(true);
    try {
      await superadminScheduleNotification({
        title: title.trim() || undefined,
        message: body.trim(),
        userIds: recipientIdsForSchedule,
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

  return (
    <Card
      title={
        <Space>
          <BellOutlined />
          <span>{isAr ? 'إرسال إشعارات للمستخدمين' : 'Send Notifications to Users'}</span>
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            fetchData();
            loadScheduled();
          }}
        >
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
          placeholder={isAr ? 'بحث بالاسم/الإيميل' : 'Search name/email'}
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
          options={locations.map((l) => ({ value: l.id, label: isAr ? l.locationAr || l.name : l.name }))}
        />
        <Button onClick={fetchData}>{isAr ? 'تطبيق الفلاتر' : 'Apply filters'}</Button>
      </Space>

      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isAr ? 'عنوان الإشعار (اختياري)' : 'Notification title (optional)'}
          maxLength={200}
        />
        <TextArea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={5000}
          placeholder={isAr ? 'اكتب نص الإشعار' : 'Write notification message'}
        />
        <Space wrap>
          <Button type={sendToAllFiltered ? 'primary' : 'default'} onClick={() => setSendToAllFiltered((v) => !v)}>
            {sendToAllFiltered
              ? isAr
                ? 'الإرسال إلى كل المستخدمين (حسب الفلاتر): مفعل'
                : 'Send to all filtered users: ON'
              : isAr
                ? 'الإرسال إلى كل المستخدمين (حسب الفلاتر): غير مفعل'
                : 'Send to all filtered users: OFF'}
          </Button>
          <Button type="primary" icon={<SendOutlined />} loading={sending} onClick={send}>
            {isAr ? 'إرسال الإشعار' : 'Send notification'}
          </Button>
          <Tag color="blue">
            {sendToAllFiltered
              ? isAr
                ? `المستَلَمون (تقديري): ${recipientIdsForSchedule.length}`
                : `Recipients (estimate): ${recipientIdsForSchedule.length}`
              : isAr
                ? `المحددون: ${selectedRowKeys.length}`
                : `Selected: ${selectedRowKeys.length}`}
          </Tag>
        </Space>
      </Space>

      <Divider>{isAr ? 'جدولة (نفس المستلمين أعلاه)' : 'Schedule (same recipients as above)'}</Divider>
      <NotificationSchedulePanel
        isAr={isAr}
        submitting={scheduling}
        disabled={recipientIdsForSchedule.length === 0}
        onSchedule={schedule}
        timeZoneHint={
          isAr
            ? 'الجدولة تستخدم نفس المحددين، أو كل المستخدمين المصفّاة إذا كان خيار «الإرسال للجميع» مفعّلاً. الوقت: الرياض.'
            : 'Scheduling uses current row selection, or all filtered users when «send to all filtered» is ON. Time zone: Riyadh.'
        }
      />

      <ResponsiveTable
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={users}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          preserveSelectedRowKeys: true,
        }}
      />

      <Title level={5} style={{ marginTop: 24 }}>
        {isAr ? 'مجدول (معلق)' : 'Pending scheduled'}
      </Title>
      <Table
        rowKey="id"
        loading={loadingSched}
        size="small"
        columns={schedColumns}
        dataSource={scheduledRows}
        pagination={false}
        locale={{ emptyText: isAr ? 'لا شيء' : 'Nothing scheduled' }}
      />
    </Card>
  );
}
