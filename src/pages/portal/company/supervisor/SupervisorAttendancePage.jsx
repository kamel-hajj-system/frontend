import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  theme as antTheme,
} from 'antd';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  LogoutOutlined,
  ReloadOutlined,
  SearchOutlined,
  TableOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getSupervisorAttendance } from '../../../../api/attendance';
import { getMyEmployees } from '../../../../api/users';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';
import { PortalTitleIcon } from '../../../../components/portal/PortalTitleIcon';
import { SummaryStatCard } from '../../../../components/dashboard/SummaryStatCard';
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

function fmtTime(iso, lang) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    timeZone: 'Asia/Riyadh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function attendanceCardName(row, isAr) {
  const u = row.user || {};
  return (isAr ? u.fullNameAr : u.fullName) || u.fullName || u.fullNameAr || u.email || '—';
}

export function SupervisorAttendancePage() {
  const { token } = antTheme.useToken();
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
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [attendanceView, setAttendanceView] = useState('table');

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
    return { checkedIn, checkedOut, insideIn, insideOut, total: rows.length, serverTotal: total };
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

  const groupedByLocation = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const loc = r.user?.shiftLocation;
      const key = loc?.id || '__none__';
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          title: key === '__none__' ? (isAr ? 'بدون موقع' : 'No location') : (isAr ? loc?.locationAr || loc?.name : loc?.name) || '—',
          items: [],
        });
      }
      map.get(key).items.push(r);
    }
    return Array.from(map.values()).sort((a, b) => (a.title || '').localeCompare(b.title || '', isAr ? 'ar' : 'en'));
  }, [rows, isAr]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <PortalTitleIcon>
            <CalendarOutlined />
          </PortalTitleIcon>
          {t('portal.supervisorAttendanceTitle')}
        </Title>
        <Button
          type="default"
          icon={<FilterOutlined />}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          {isAr ? 'الفلاتر' : 'Filters'}
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={t('portal.supervisorAttendanceHint')}
      />

      {filtersOpen ? (
        <Card size="small" style={{ marginBottom: 20 }} bodyStyle={{ padding: '12px 16px' }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space wrap style={{ width: '100%', rowGap: 12 }}>
              <RangePicker
                value={range}
                onChange={(v) => setRange(v || [dayjs(), dayjs()])}
                allowClear={false}
              />
              <Select
                allowClear
                style={{ width: 240, maxWidth: '100%' }}
                placeholder={isAr ? 'كل المواقع' : 'All locations'}
                value={locationId}
                onChange={setLocationId}
                options={locations.map((l) => ({ value: l.id, label: isAr ? l.locationAr || l.name : l.name }))}
              />
              <Select
                allowClear
                style={{ width: 240, maxWidth: '100%' }}
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
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isAr ? 'إجمالي السجلات المطابقة للفلتر' : 'Matching records'}: <strong>{summary.serverTotal}</strong>
              {summary.serverTotal > rows.length
                ? isAr
                  ? ` · عرض ${rows.length} ضمن الحد`
                  : ` · Showing ${rows.length} (limit)`
                : null}
            </Text>
          </Space>
        </Card>
      ) : null}

      <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<CalendarOutlined />}
            accent={token.colorPrimary}
            label={isAr ? 'الإجمالي' : 'Total'}
            value={summary.total}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<CheckCircleOutlined />}
            accent={token.colorSuccess}
            label={isAr ? 'حضور' : 'Checked-in'}
            value={summary.checkedIn}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<LogoutOutlined />}
            accent={token.colorInfo}
            label={isAr ? 'انصراف' : 'Checked-out'}
            value={summary.checkedOut}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<EnvironmentOutlined />}
            accent={token.colorSuccess}
            label={isAr ? 'داخل النطاق (حضور)' : 'Inside zone (in)'}
            value={summary.insideIn}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<EnvironmentOutlined />}
            accent={token.colorWarning}
            label={isAr ? 'داخل النطاق (انصراف)' : 'Inside zone (out)'}
            value={summary.insideOut}
            minHeight={148}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <Space.Compact>
          <Button
            type={attendanceView === 'table' ? 'primary' : 'default'}
            icon={<TableOutlined />}
            onClick={() => setAttendanceView('table')}
          >
            {isAr ? 'عرض الجدول' : 'Table view'}
          </Button>
          <Button
            type={attendanceView === 'board' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setAttendanceView('board')}
          >
            {isAr ? 'عرض البطاقات' : 'Board view'}
          </Button>
        </Space.Compact>
      </div>

      <div
        style={{
          width: '100%',
          padding: '18px 20px 22px',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          background: token.colorBgElevated,
          boxShadow: `0 1px 0 color-mix(in srgb, ${token.colorBorder} 45%, transparent), 0 12px 36px color-mix(in srgb, ${token.colorPrimary} 7%, transparent)`,
        }}
      >
        {loading ? (
          <Card loading style={{ border: 'none', background: 'transparent' }} bodyStyle={{ padding: 24 }} />
        ) : rows.length === 0 ? (
          <Empty description={isAr ? 'لا توجد سجلات' : 'No attendance records'} />
        ) : attendanceView === 'table' ? (
          <ResponsiveTable rowKey="id" columns={columns} dataSource={rows} pagination={false} />
        ) : (
          <Row gutter={[20, 20]}>
            {groupedByLocation.map((group) => (
              <Col key={group.id} xs={24}>
                <div
                  style={{
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 14,
                    padding: 14,
                    background: token.colorBgContainer,
                    boxShadow: token.boxShadowTertiary,
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      marginBottom: 12,
                      background: `color-mix(in srgb, ${token.colorPrimary} 8%, ${token.colorFillAlter})`,
                      border: `1px solid color-mix(in srgb, ${token.colorPrimary} 15%, ${token.colorBorderSecondary})`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <ApartmentOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                    <Text strong style={{ fontSize: 15 }}>{group.title}</Text>
                    <Text type="secondary" style={{ marginInlineStart: 'auto', fontSize: 13 }}>{group.items.length}</Text>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {group.items.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          border: `1px solid ${token.colorBorderSecondary}`,
                          borderRadius: 12,
                          padding: 12,
                          background: token.colorBgContainer,
                          height: '100%',
                        }}
                      >
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <Space size={8} align="center">
                            <UserOutlined style={{ color: token.colorPrimary }} />
                            <Text strong style={{ fontSize: 13 }}>{attendanceCardName(r, isAr)}</Text>
                          </Space>
                          <Space size={8} align="center">
                            <ClockCircleOutlined style={{ color: token.colorSuccess }} />
                            <Text style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTime(r.checkInAt, lang)}</Text>
                          </Space>
                          <Space size={8} align="center">
                            <ClockCircleOutlined style={{ color: r.checkOutAt ? token.colorError : token.colorTextQuaternary }} />
                            <Text style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtTime(r.checkOutAt, lang)}</Text>
                          </Space>
                        </Space>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
