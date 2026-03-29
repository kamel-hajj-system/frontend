import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, DatePicker, Input, Select, Space, Tag, Typography, Button } from 'antd';
import { CalendarOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getSupervisorAttendance } from '../../../../api/attendance';
import { getMyEmployees } from '../../../../api/users';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';
import { USER_TYPES } from '../../../../utils/constants';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/** Unique locations / shifts assigned to direct reports (for filter dropdowns only). */
function teamLocationsAndShifts(employees) {
  const locById = new Map();
  const shiftById = new Map();
  for (const e of employees) {
    if (e.shiftLocation?.id) {
      locById.set(e.shiftLocation.id, e.shiftLocation);
    }
    if (e.shift?.id) {
      shiftById.set(e.shift.id, e.shift);
    }
  }
  return {
    locations: Array.from(locById.values()),
    shifts: Array.from(shiftById.values()),
  };
}

function fmtIso(iso, lang) {
  if (!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

export function SupervisorAttendancePage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [metaLoading, setMetaLoading] = useState(false);

  const [range, setRange] = useState([dayjs(), dayjs()]);
  const [locationId, setLocationId] = useState(undefined);
  const [shiftId, setShiftId] = useState(undefined);
  const [q, setQ] = useState('');

  const canView = user?.userType === USER_TYPES.COMPANY && user?.role === 'Supervisor';

  const loadTeamFilterOptions = useCallback(async () => {
    setMetaLoading(true);
    try {
      const res = await getMyEmployees({ includeInactive: true });
      const { locations: locs, shifts: shfs } = teamLocationsAndShifts(res.data || []);
      const locale = isAr ? 'ar' : 'en';
      locs.sort((a, b) =>
        (isAr ? a.locationAr || a.name : a.name).localeCompare(isAr ? b.locationAr || b.name : b.name, locale, {
          sensitivity: 'base',
        })
      );
      shfs.sort((a, b) =>
        (isAr ? a.shiftAr || a.name : a.name).localeCompare(isAr ? b.shiftAr || b.name : b.name, locale, {
          sensitivity: 'base',
        })
      );
      setLocations(locs);
      setShifts(shfs);
    } catch {
      setLocations([]);
      setShifts([]);
    } finally {
      setMetaLoading(false);
    }
  }, [isAr]);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const dateFrom = range?.[0]?.format?.('YYYY-MM-DD');
      const dateTo = range?.[1]?.format?.('YYYY-MM-DD');
      const res = await getSupervisorAttendance({
        limit: 200,
        dateFrom,
        dateTo,
        locationId,
        shiftId,
        q,
      });
      setRows(res.data || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [range, locationId, shiftId, q]);

  useEffect(() => {
    if (!canView) return;
    loadTeamFilterOptions();
  }, [canView, loadTeamFilterOptions]);

  useEffect(() => {
    if (!canView) return;
    fetch();
  }, [canView, fetch]);

  useEffect(() => {
    setLocationId((prev) => {
      if (!prev) return prev;
      if (!locations.some((l) => l.id === prev)) return undefined;
      return prev;
    });
    setShiftId((prev) => {
      if (!prev) return prev;
      if (!shifts.some((s) => s.id === prev)) return undefined;
      return prev;
    });
  }, [locations, shifts]);

  if (!canView) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const summary = useMemo(() => {
    const checkedIn = rows.filter((r) => !!r.checkInAt).length;
    const checkedOut = rows.filter((r) => !!r.checkOutAt).length;
    const insideIn = rows.filter((r) => r.checkInInsideZone === true).length;
    const insideOut = rows.filter((r) => r.checkOutInsideZone === true).length;
    return { checkedIn, checkedOut, insideIn, insideOut };
  }, [rows]);

  const columns = useMemo(
    () => [
      {
        title: isAr ? 'المستخدم' : 'User',
        key: 'user',
        render: (_, r) => {
          const u = r.user || {};
          const primary = (isAr ? u.fullNameAr : u.fullName) || u.fullName || u.fullNameAr || u.email || '';
          const secondary = (isAr ? u.fullName : u.fullNameAr) || '';
          return (
            <div>
              <div style={{ fontWeight: 600 }}>{primary}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{secondary || u.email || ''}</div>
            </div>
          );
        },
      },
      {
        title: isAr ? 'الموقع' : 'Location',
        key: 'location',
        render: (_, r) => {
          const loc = r.user?.shiftLocation;
          if (!loc) return '—';
          return isAr ? loc.locationAr || loc.name : loc.name;
        },
      },
      {
        title: isAr ? 'الوردية' : 'Shift',
        key: 'shift',
        render: (_, r) => (isAr ? r.shift?.shiftAr || r.shift?.name : r.shift?.name) || '—',
      },
      {
        title: isAr ? 'بداية الوردية' : 'Shift start',
        dataIndex: 'shiftStartAt',
        key: 'shiftStartAt',
        render: (v) => fmtIso(v, lang),
      },
      {
        title: isAr ? 'نهاية الوردية' : 'Shift end',
        dataIndex: 'shiftEndAt',
        key: 'shiftEndAt',
        render: (v) => fmtIso(v, lang),
      },
      {
        title: isAr ? 'الحضور' : 'Check-in',
        dataIndex: 'checkInAt',
        key: 'checkInAt',
        render: (v, r) => (
          <Space wrap>
            <span>{fmtIso(v, lang)}</span>
            {r.checkInInsideZone === true ? (
              <Tag color="success">{isAr ? 'داخل' : 'Inside'}</Tag>
            ) : r.checkInInsideZone === false ? (
              <Tag color="error">{isAr ? 'خارج' : 'Outside'}</Tag>
            ) : (
              <Tag>{isAr ? '—' : '—'}</Tag>
            )}
          </Space>
        ),
      },
      {
        title: isAr ? 'الانصراف' : 'Check-out',
        dataIndex: 'checkOutAt',
        key: 'checkOutAt',
        render: (v, r) => (
          <Space wrap>
            <span>{fmtIso(v, lang)}</span>
            {r.checkOutInsideZone === true ? (
              <Tag color="success">{isAr ? 'داخل' : 'Inside'}</Tag>
            ) : r.checkOutInsideZone === false ? (
              <Tag color="error">{isAr ? 'خارج' : 'Outside'}</Tag>
            ) : (
              <Tag>{isAr ? '—' : '—'}</Tag>
            )}
          </Space>
        ),
      },
    ],
    [isAr, lang]
  );

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <CalendarOutlined /> {t('portal.supervisorAttendanceTitle')}
      </Title>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={t('portal.supervisorAttendanceHint')}
      />

      <Card
        style={{ marginBottom: 16 }}
        bodyStyle={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <RangePicker
          value={range}
          onChange={(v) => setRange(v || [dayjs(), dayjs()])}
          allowClear={false}
        />
        <Select
          allowClear
          style={{ width: 240 }}
          placeholder={isAr ? 'كل المواقع' : 'All locations'}
          value={locationId}
          onChange={setLocationId}
          options={locations.map((l) => ({ value: l.id, label: isAr ? l.locationAr || l.name : l.name }))}
        />
        <Select
          allowClear
          style={{ width: 240 }}
          placeholder={isAr ? 'كل الورديات' : 'All shifts'}
          value={shiftId}
          onChange={setShiftId}
          options={shifts.map((s) => ({ value: s.id, label: isAr ? s.shiftAr || s.name : s.name }))}
        />
        <Input
          style={{ width: 280, maxWidth: '100%' }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={fetch}
          allowClear
          prefix={<SearchOutlined />}
          placeholder={isAr ? 'بحث بالاسم/الإيميل/الجوال' : 'Search name/email/phone'}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            loadTeamFilterOptions();
            fetch();
          }}
          loading={loading || metaLoading}
        >
          {isAr ? 'تحديث' : 'Refresh'}
        </Button>

        <Space wrap>
          <Tag color="blue">
            {isAr ? 'السجلات' : 'Records'}: {total}
          </Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isAr ? 'حضور' : 'Checked-in'}: <strong>{summary.checkedIn}</strong> | {isAr ? 'انصراف' : 'Checked-out'}:{' '}
            <strong>{summary.checkedOut}</strong> | {isAr ? 'داخل (حضور)' : 'Inside (in)'}:{' '}
            <strong>{summary.insideIn}</strong> | {isAr ? 'داخل (انصراف)' : 'Inside (out)'}:{' '}
            <strong>{summary.insideOut}</strong>
          </Text>
        </Space>
      </Card>

      <Card>
        <ResponsiveTable rowKey="id" loading={loading} columns={columns} dataSource={rows} pagination={false} />
      </Card>
    </div>
  );
}
