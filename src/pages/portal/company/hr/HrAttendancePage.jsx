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
  Typography,
  theme as antTheme,
} from 'antd';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
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
import { getHrAttendance } from '../../../../api/attendance';
import { getLocations } from '../../../../api/locations';
import { getShifts } from '../../../../api/shifts';
import { PortalTitleIcon } from '../../../../components/portal/PortalTitleIcon';
import { SummaryStatCard } from '../../../../components/dashboard/SummaryStatCard';
import { DashboardDetailModal } from '../../../../components/dashboard/DashboardDetailModal';
import { DashboardDetailSection } from '../../../../components/dashboard/DashboardDetailSection';
import { ResponsiveTable } from '../../../../components/common/ResponsiveTable';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const LATE_GRACE_MINUTES = 15;

/** Target columns on wide panels; `minmax` floor keeps cards readable (avoids RTL “thin strip” collapse). */
const EMP_GRID_COLUMNS = 5;
const EMP_GRID_MIN_COL_PX = 148;
const EMP_GRID_MAX_ROWS = 2;
const EMP_GRID_GAP = 12;
/** Row height for grid cells (centered avatar, 2-line name, clock rows). */
const EMP_CARD_ROW_PX = 172;
/** Show vertical scroll on the location employee grid only when count exceeds this. */
const EMP_GRID_SCROLL_MIN_COUNT = 10;

function fmtTimeHm(iso, lang) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    timeZone: 'Asia/Riyadh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function fmtDateTime(iso, lang) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function isLateRow(row) {
  if (!row.checkInAt || !row.shiftStartAt) return false;
  const start = new Date(row.shiftStartAt).getTime();
  const grace = LATE_GRACE_MINUTES * 60 * 1000;
  return new Date(row.checkInAt).getTime() > start + grace;
}

function locationLabel(row, isAr) {
  const loc = row.user?.shiftLocation;
  if (!loc) return null;
  return isAr ? loc.locationAr || loc.name : loc.name;
}

function userDisplayName(u, isAr) {
  if (!u) return '';
  return (isAr ? u.fullNameAr : u.fullName) || u.fullName || u.fullNameAr || u.email || '';
}

function supervisorDisplayName(s, isAr) {
  if (!s) return '';
  return (isAr ? s.fullNameAr : s.fullName) || s.fullName || s.fullNameAr || s.email || '';
}

function DetailField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
        {label}
      </Text>
      <div style={{ fontSize: 14, lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}

function AttendanceEmployeeCard({ row, isAr, lang, t, onOpen }) {
  const { token } = antTheme.useToken();
  const u = row.user || {};
  const name = userDisplayName(u, isAr);
  const late = isLateRow(row);
  const absent = !row.checkInAt;
  const statusColor = absent ? token.colorError : late ? token.colorWarning : token.colorSuccess;

  const open = () => onOpen(row);
  const inTime = fmtTimeHm(row.checkInAt, lang);
  const outTime = fmtTimeHm(row.checkOutAt, lang);
  const ariaTimes = `${t('portal.hrAttendanceCardCheckIn')} ${inTime}, ${t('portal.hrAttendanceCardCheckOut')} ${outTime}`;
  const displayName = name || u.email || '—';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      aria-label={`${displayName === '—' ? 'Employee' : displayName}. ${ariaTimes}. ${t('portal.hrAttendanceDetailTitle')}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        boxSizing: 'border-box',
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 12,
        padding: '12px 14px',
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 10,
        overflow: 'hidden',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = token.colorPrimary;
        e.currentTarget.style.boxShadow = `0 4px 14px color-mix(in srgb, ${token.colorPrimary} 16%, transparent)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = token.colorBorderSecondary;
        e.currentTarget.style.boxShadow = token.boxShadowTertiary;
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: `color-mix(in srgb, ${statusColor} 32%, ${token.colorBgContainer})`,
          color: statusColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
          boxShadow: `0 1px 2px color-mix(in srgb, ${statusColor} 25%, transparent)`,
        }}
      >
        <UserOutlined />
      </div>

      <div
        title={displayName !== '—' ? displayName : undefined}
        style={{
          width: '100%',
          minWidth: 0,
          flexShrink: 0,
          color: token.colorText,
          fontWeight: 600,
          fontSize: 13,
          lineHeight: 1.45,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        }}
      >
        {displayName}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          minWidth: 0,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ fontSize: 16, color: token.colorSuccess }} aria-hidden />
          <Text strong style={{ fontSize: 15, color: token.colorSuccess, fontVariantNumeric: 'tabular-nums', margin: 0 }}>
            {inTime}
          </Text>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ClockCircleOutlined
            style={{ fontSize: 16, color: row.checkOutAt ? token.colorError : token.colorTextQuaternary }}
            aria-hidden
          />
          <Text
            strong
            style={{
              fontSize: 15,
              color: row.checkOutAt ? token.colorError : token.colorTextQuaternary,
              fontVariantNumeric: 'tabular-nums',
              margin: 0,
            }}
          >
            {outTime}
          </Text>
        </div>
      </div>
    </div>
  );
}

function AttendanceDetailModal({ open, row, onClose, isAr, lang, t }) {
  const { token } = antTheme.useToken();
  if (!row) return null;
  const u = row.user || {};
  const sup = u.supervisor;
  const loc = u.shiftLocation;
  const mgrName = supervisorDisplayName(sup, isAr);
  const zoneIn =
    row.checkInInsideZone === true
      ? t('portal.hrAttendanceDetailYes')
      : row.checkInInsideZone === false
        ? t('portal.hrAttendanceDetailNo')
        : t('portal.hrAttendanceDetailDash');
  const zoneOut =
    row.checkOutInsideZone === true
      ? t('portal.hrAttendanceDetailYes')
      : row.checkOutInsideZone === false
        ? t('portal.hrAttendanceDetailNo')
        : t('portal.hrAttendanceDetailDash');

  const nameLine = userDisplayName(u, isAr);
  const subtitle = [nameLine, u.email, u.role].filter(Boolean).join(' · ') || undefined;

  return (
    <DashboardDetailModal
      open={open}
      onClose={onClose}
      title={t('portal.hrAttendanceDetailTitle')}
      subtitle={subtitle}
      width={640}
      closeAriaLabel={t('common.close')}
    >
      <DashboardDetailSection title={t('portal.hrAttendanceDetailSectionProfile')} accent={token.colorPrimary}>
        <DetailField label={t('portal.hrAttendanceDetailFullNameEn')}>
          {u.fullName || t('portal.hrAttendanceDetailDash')}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailFullNameAr')}>
          {u.fullNameAr || t('portal.hrAttendanceDetailDash')}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailEmail')}>
          {u.email || t('portal.hrAttendanceDetailDash')}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailPhone')}>
          {u.phone || t('portal.hrAttendanceDetailDash')}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailRole')}>
          {u.role || t('portal.hrAttendanceDetailDash')}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailUserType')}>
          {u.userType || t('portal.hrAttendanceDetailDash')}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailWorkLocation')}>
          {loc ? (isAr ? loc.locationAr || loc.name : loc.name) : t('portal.hrAttendanceDetailDash')}
        </DetailField>
      </DashboardDetailSection>

      <DashboardDetailSection title={t('portal.hrAttendanceDetailSectionSupervisor')} accent={token.colorInfo}>
        {sup ? (
          <>
            <DetailField label={t('portal.hrAttendanceDetailManager')}>
              <Text strong style={{ fontSize: 15 }}>{mgrName}</Text>
            </DetailField>
            {sup.email ? (
              <DetailField label={t('portal.hrAttendanceDetailEmail')}>{sup.email}</DetailField>
            ) : null}
            {sup.phone ? (
              <DetailField label={t('portal.hrAttendanceDetailPhone')}>{sup.phone}</DetailField>
            ) : null}
            <DetailField label={t('portal.hrAttendanceDetailRole')}>
              {sup.role || t('portal.hrAttendanceDetailDash')}
            </DetailField>
          </>
        ) : (
          <Text type="secondary">{t('portal.hrAttendanceDetailNoManager')}</Text>
        )}
      </DashboardDetailSection>

      <DashboardDetailSection title={t('portal.hrAttendanceDetailSectionAttendance')} accent={token.colorSuccess}>
        <DetailField label={t('portal.hrAttendanceDetailShiftWindow')}>
          {fmtDateTime(row.shiftStartAt, lang)} → {fmtDateTime(row.shiftEndAt, lang)}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailCheckIn')}>
          {fmtDateTime(row.checkInAt, lang)}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailCheckOut')}>
          {fmtDateTime(row.checkOutAt, lang)}
        </DetailField>
        <DetailField label={t('portal.hrAttendanceDetailInsideZoneIn')}>{zoneIn}</DetailField>
        <DetailField label={t('portal.hrAttendanceDetailInsideZoneOut')}>{zoneOut}</DetailField>
      </DashboardDetailSection>
    </DashboardDetailModal>
  );
}

export function HrAttendancePage() {
  const { token } = antTheme.useToken();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [locations, setLocations] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [range, setRange] = useState([dayjs(), dayjs()]);
  const [locationId, setLocationId] = useState(undefined);
  const [shiftId, setShiftId] = useState(undefined);
  const [q, setQ] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [detailRow, setDetailRow] = useState(null);
  const [attendanceView, setAttendanceView] = useState('board');

  const fetchMeta = useCallback(() => {
    getLocations().then(setLocations).catch(() => setLocations([]));
    getShifts().then(setShifts).catch(() => setShifts([]));
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const dateFrom = range?.[0]?.format?.('YYYY-MM-DD');
      const dateTo = range?.[1]?.format?.('YYYY-MM-DD');
      const res = await getHrAttendance({
        limit: 500,
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
    if (user?.isHr) {
      fetchMeta();
      fetch();
    }
  }, [user?.isHr, fetchMeta, fetch]);

  const summary = useMemo(() => {
    let presentOnTime = 0;
    let late = 0;
    let absent = 0;
    let checkedOut = 0;
    for (const r of rows) {
      if (!r.checkInAt) absent += 1;
      else if (isLateRow(r)) late += 1;
      else presentOnTime += 1;
      if (r.checkOutAt) checkedOut += 1;
    }
    return { total: rows.length, presentOnTime, late, absent, checkedOut, serverTotal: total };
  }, [rows, total]);

  const groupedByLocation = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const loc = r.user?.shiftLocation;
      const key = loc?.id || '__none__';
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          location: loc,
          title:
            key === '__none__'
              ? t('portal.hrAttendanceUnknownLocation')
              : locationLabel(r, isAr) || (isAr ? loc?.locationAr || loc?.name : loc?.name) || '—',
          items: [],
        });
      }
      map.get(key).items.push(r);
    }
    const list = Array.from(map.values());
    list.forEach((g) => {
      g.items.sort((a, b) =>
        userDisplayName(a.user, isAr).localeCompare(userDisplayName(b.user, isAr), isAr ? 'ar' : 'en', {
          sensitivity: 'base',
        }),
      );
    });
    list.sort((a, b) => {
      if (a.id === '__none__') return 1;
      if (b.id === '__none__') return -1;
      return (a.title || '').localeCompare(b.title || '', isAr ? 'ar' : 'en', { sensitivity: 'base' });
    });
    return list;
  }, [rows, isAr, t]);

  const locationRowPairs = useMemo(() => {
    const g = groupedByLocation;
    const pairs = [];
    for (let i = 0; i < g.length; i += 2) {
      pairs.push(g.slice(i, i + 2));
    }
    return pairs;
  }, [groupedByLocation]);

  const gridMaxHeight = useMemo(
    () => EMP_GRID_MAX_ROWS * EMP_CARD_ROW_PX + (EMP_GRID_MAX_ROWS - 1) * EMP_GRID_GAP,
    [],
  );

  const employeeGridTemplate = useMemo(
    () =>
      `repeat(${EMP_GRID_COLUMNS}, minmax(${EMP_GRID_MIN_COL_PX}px, 1fr))`,
    [],
  );

  const attendanceTableColumns = useMemo(
    () => [
      {
        title: isAr ? 'المستخدم' : 'User',
        key: 'user',
        render: (_, r) => {
          const u = r.user || {};
          const primary = userDisplayName(u, isAr) || u.email || '—';
          const secondary = (isAr ? u.fullName : u.fullNameAr) || '';
          const showSecondary = secondary && secondary !== primary;
          return (
            <div>
              <div style={{ fontWeight: 600 }}>{primary}</div>
              {showSecondary ? <div style={{ fontSize: 12, opacity: 0.7 }}>{secondary}</div> : null}
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
        render: (v) => fmtDateTime(v, lang),
      },
      {
        title: isAr ? 'نهاية الوردية' : 'Shift end',
        dataIndex: 'shiftEndAt',
        key: 'shiftEndAt',
        render: (v) => fmtDateTime(v, lang),
      },
      {
        title: isAr ? 'الحضور' : 'Check-in',
        dataIndex: 'checkInAt',
        key: 'checkInAt',
        render: (v) => fmtDateTime(v, lang),
      },
      {
        title: isAr ? 'الانصراف' : 'Check-out',
        dataIndex: 'checkOutAt',
        key: 'checkOutAt',
        render: (v) => fmtDateTime(v, lang),
      },
    ],
    [isAr, lang],
  );

  if (!user?.isHr) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

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
          {t('portal.hrAttendanceHeading')}
        </Title>
        <Button
          type="default"
          icon={<FilterOutlined />}
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          {t('portal.hrAttendanceFilters')}
        </Button>
      </div>

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
                options={locations.map((l) => ({
                  value: l.id,
                  label: isAr ? l.locationAr || l.name : l.name,
                }))}
              />
              <Select
                allowClear
                style={{ width: 240, maxWidth: '100%' }}
                placeholder={isAr ? 'كل الورديات' : 'All shifts'}
                value={shiftId}
                onChange={setShiftId}
                options={shifts.map((s) => ({
                  value: s.id,
                  label: isAr ? s.shiftAr || s.name : s.name,
                }))}
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
              <Button icon={<ReloadOutlined />} onClick={fetch} loading={loading}>
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
            label={t('portal.hrAttendanceSummaryTotal')}
            value={summary.total}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<CheckCircleOutlined />}
            accent={token.colorSuccess}
            label={t('portal.hrAttendanceSummaryPresent')}
            value={summary.presentOnTime}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<ClockCircleOutlined />}
            accent={token.colorWarning}
            label={t('portal.hrAttendanceSummaryLate')}
            value={summary.late}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<CloseCircleOutlined />}
            accent={token.colorError}
            label={t('portal.hrAttendanceSummaryAbsent')}
            value={summary.absent}
            minHeight={148}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <SummaryStatCard
            icon={<LogoutOutlined />}
            accent={token.colorInfo}
            label={t('portal.hrAttendanceSummaryCheckedOut')}
            value={summary.checkedOut}
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
            {t('portal.hrAttendanceViewTable')}
          </Button>
          <Button
            type={attendanceView === 'board' ? 'primary' : 'default'}
            icon={<AppstoreOutlined />}
            onClick={() => setAttendanceView('board')}
          >
            {t('portal.hrAttendanceViewBoard')}
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
          <ResponsiveTable
            rowKey="id"
            columns={attendanceTableColumns}
            dataSource={rows}
            pagination={false}
            onRow={(record) => ({
              onClick: () => setDetailRow(record),
              style: { cursor: 'pointer' },
            })}
          />
        ) : (
          <Row gutter={[20, 20]}>
            {locationRowPairs.flatMap((pair) =>
              pair.map((group) => (
                <Col key={group.id} xs={24} md={12} style={{ minWidth: 0 }}>
                  <div
                    style={{
                      height: '100%',
                      minHeight: 120,
                      width: '100%',
                      minWidth: 0,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: 14,
                      padding: 14,
                      background: token.colorBgContainer,
                      boxShadow: token.boxShadowTertiary,
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        marginBottom: 12,
                        flexShrink: 0,
                        background: `color-mix(in srgb, ${token.colorPrimary} 8%, ${token.colorFillAlter})`,
                        border: `1px solid color-mix(in srgb, ${token.colorPrimary} 15%, ${token.colorBorderSecondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <ApartmentOutlined style={{ fontSize: 18, color: token.colorPrimary }} />
                      <Text strong style={{ fontSize: 15 }}>
                        {group.title}
                      </Text>
                      <Text type="secondary" style={{ marginInlineStart: 'auto', fontSize: 13 }}>
                        {group.items.length}
                      </Text>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        display: 'grid',
                        gridTemplateColumns: employeeGridTemplate,
                        gap: EMP_GRID_GAP,
                        gridAutoRows: `${EMP_CARD_ROW_PX}px`,
                        gridAutoFlow: 'row',
                        justifyItems: 'stretch',
                        alignItems: 'stretch',
                        ...(group.items.length > EMP_GRID_SCROLL_MIN_COUNT
                          ? {
                              maxHeight: gridMaxHeight,
                              overflowY: 'auto',
                              overflowX: 'auto',
                              paddingBottom: 2,
                              scrollbarGutter: 'stable',
                            }
                          : {
                              maxHeight: 'none',
                              overflow: 'visible',
                              paddingBottom: 0,
                            }),
                      }}
                    >
                      {group.items.map((row) => (
                        <div
                          key={row.id}
                          style={{
                            minWidth: 0,
                            width: '100%',
                            height: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          <AttendanceEmployeeCard
                            row={row}
                            isAr={isAr}
                            lang={lang}
                            t={t}
                            onOpen={setDetailRow}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              )),
            )}
          </Row>
        )}
      </div>

      <AttendanceDetailModal
        open={!!detailRow}
        row={detailRow}
        onClose={() => setDetailRow(null)}
        isAr={isAr}
        lang={lang}
        t={t}
      />
    </div>
  );
}
