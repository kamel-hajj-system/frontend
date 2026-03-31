import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Divider, Input, Space, Table, Tag, Typography, theme, message } from 'antd';
import { BellOutlined, ReloadOutlined, SendOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getMyEmployees } from '../../../api/users';
import {
  supervisorSendNotifications,
  supervisorScheduleNotification,
  getMyScheduledNotifications,
  cancelScheduledNotification,
} from '../../../api/notifications';
import { USER_TYPES, PORTAL_TEAM_ACCESS } from '../../../utils/constants';
import { NotificationSchedulePanel } from '../../../components/notifications/NotificationSchedulePanel';
import { PortalTitleIcon } from '../../../components/portal/PortalTitleIcon';

const { TextArea } = Input;
const { Title, Text } = Typography;

function renderPersonName(isAr, u) {
  const primary = (isAr ? u.fullNameAr : u.fullName) || u.fullName || u.fullNameAr || u.email || '';
  const secondary = (isAr ? u.fullName : u.fullNameAr) || null;
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{primary}</div>
      {secondary ? <div style={{ fontSize: 12, opacity: 0.7 }}>{secondary}</div> : null}
    </div>
  );
}

export function SupervisorSendNotificationsPage() {
  const { token } = theme.useToken();
  const { user, hasAccess } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledRows, setScheduledRows] = useState([]);
  const [loadingSched, setLoadingSched] = useState(false);

  const canView =
    user?.userType === USER_TYPES.COMPANY &&
    (user?.role === 'Supervisor' || hasAccess(PORTAL_TEAM_ACCESS.SEND_NOTIFICATIONS));

  const loadScheduled = useCallback(async () => {
    setLoadingSched(true);
    try {
      const res = await getMyScheduledNotifications();
      const all = res?.data || [];
      setScheduledRows(all.filter((r) => r.scope === 'supervisor'));
    } catch {
      setScheduledRows([]);
    } finally {
      setLoadingSched(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyEmployees({ includeInactive: true });
      setEmployees((res.data || []).filter((r) => r.isActive));
    } catch (err) {
      message.error(err?.message || (isAr ? 'تعذر تحميل الموظفين' : 'Failed to load employees'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    if (canView) {
      fetchEmployees();
      loadScheduled();
    }
  }, [canView, fetchEmployees, loadScheduled]);

  const sendNow = async () => {
    if (!body.trim()) {
      message.warning(isAr ? 'اكتب نص الإشعار' : 'Enter notification message');
      return;
    }
    if (selectedRowKeys.length === 0) {
      message.warning(isAr ? 'اختر موظفين' : 'Select employees');
      return;
    }
    setSending(true);
    try {
      const res = await supervisorSendNotifications({
        title: title.trim() || undefined,
        message: body.trim(),
        userIds: selectedRowKeys,
      });
      message.success(
        isAr ? `تم الإرسال إلى ${res.sent || 0} موظف` : `Sent to ${res.sent || 0} employee(s)`
      );
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
      message.warning(isAr ? 'اختر موظفين' : 'Select employees');
      return;
    }
    setScheduling(true);
    try {
      await supervisorScheduleNotification({
        title: title.trim() || undefined,
        message: body.trim(),
        userIds: selectedRowKeys,
        ...schedulePayload,
      });
      message.success(isAr ? 'تمت جدولة الإشعار' : 'Notification scheduled');
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
        message.success(isAr ? 'أُلغيت الجدولة' : 'Schedule cancelled');
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
        title: isAr ? 'الموظف' : 'Employee',
        key: 'name',
        render: (_, r) => renderPersonName(isAr, r),
      },
      { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
      {
        title: isAr ? 'الدور' : 'Role',
        dataIndex: 'role',
        key: 'role',
        width: 130,
        render: (v) => <Tag color="blue">{t(`roles.${v || 'EmpRead'}`)}</Tag>,
      },
    ],
    [isAr, t]
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
        title: isAr ? 'التفاصيل' : 'When',
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

  if (!canView) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const scheduleShell = {
    padding: token.paddingMD,
    borderRadius: token.borderRadiusLG,
    background: token.colorFillQuaternary,
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  return (
    <div>
      <Title
        level={4}
        style={{
          marginBottom: token.marginMD,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
        }}
      >
        <PortalTitleIcon>
          <BellOutlined />
        </PortalTitleIcon>
        {t('portal.supervisorSendNotificationsTitle')}
      </Title>

      <Card
        variant="borderless"
        style={{
          borderRadius: token.borderRadiusLG * 1.25,
          boxShadow: token.boxShadowSecondary,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        styles={{ body: { padding: token.paddingLG } }}
        extra={
          <Button
            shape="round"
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchEmployees();
              loadScheduled();
            }}
          >
            {isAr ? 'تحديث' : 'Refresh'}
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size={token.marginLG}>
          <Space direction="vertical" style={{ width: '100%' }} size={token.marginSM}>
            <Input
              size="large"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isAr ? 'عنوان (اختياري)' : 'Title (optional)'}
              maxLength={200}
              showCount
            />
            <TextArea
              size="large"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={5000}
              showCount
              placeholder={isAr ? 'نص الإشعار' : 'Notification message'}
              style={{ resize: 'vertical' }}
            />
            <Space wrap size="middle" style={{ marginTop: token.marginXXS }}>
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                loading={sending}
                onClick={sendNow}
                disabled={selectedRowKeys.length === 0}
              >
                {isAr ? 'إرسال الآن' : 'Send now'}
              </Button>
              <Tag color="processing" style={{ marginInlineEnd: 0, padding: '4px 12px', fontSize: 13 }}>
                {isAr ? `المحددون: ${selectedRowKeys.length}` : `Selected: ${selectedRowKeys.length}`}
              </Tag>
            </Space>
          </Space>

          <Divider dashed style={{ margin: `${token.marginXS}px 0` }}>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
              {isAr ? 'جدولة' : 'Schedule'}
            </Text>
          </Divider>

          <div style={scheduleShell}>
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
          </div>

          <Table
            rowKey="id"
            loading={loading}
            size="middle"
            bordered
            columns={columns}
            dataSource={employees}
            pagination={{
              pageSize: 10,
              hideOnSinglePage: true,
              showSizeChanger: false,
              showTotal: (n) =>
                isAr ? `إجمالي ${n}` : `${n} ${n === 1 ? 'employee' : 'employees'}`,
            }}
            scroll={{ x: 'max-content' }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
              preserveSelectedRowKeys: true,
              columnWidth: 48,
            }}
          />

          <Title level={5} style={{ marginTop: token.marginXS, marginBottom: token.marginSM, fontWeight: 600 }}>
            {isAr ? 'الإشعارات المجدولة (معلقة)' : 'Pending scheduled'}
          </Title>
          <Table
            rowKey="id"
            loading={loadingSched}
            size="middle"
            bordered
            columns={schedColumns}
            dataSource={scheduledRows}
            pagination={false}
            scroll={{ x: 'max-content' }}
            locale={{ emptyText: isAr ? 'لا شيء مجدول' : 'Nothing scheduled' }}
          />
        </Space>
      </Card>
    </div>
  );
}
