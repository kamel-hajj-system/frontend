import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Typography, Alert, Button, Space, Tag, Divider, message, Descriptions } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { USER_TYPES } from '../../../../../utils/constants';
import { attendanceCheckIn, attendanceCheckOut, getAttendanceStatus } from '../../../../../api/attendance';

const { Title, Paragraph } = Typography;

function fmt(iso, lang) {
  if (!iso) return '—';
  const date = new Date(iso);
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-SA' : 'en-US', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function AttendanceAndDeparturePage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [status, setStatus] = useState(null);
  const [geo, setGeo] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (user?.userType !== USER_TYPES.COMPANY) return;
    setLoading(true);
    try {
      const res = await getAttendanceStatus(
        geo
          ? { lat: geo.lat, lng: geo.lng, accuracyMeters: geo.accuracyMeters }
          : {}
      );
      setStatus(res);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [isAr, geo, user?.userType]);

  useEffect(() => {
    if (user?.userType !== USER_TYPES.COMPANY) return;
    refresh();
  }, [refresh, user?.userType]);

  const requestGeo = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError(isAr ? 'الجهاز لا يدعم تحديد الموقع' : 'Geolocation is not supported');
      return;
    }
    if (!window.isSecureContext) {
      setGeoError(
        isAr
          ? 'تحديد الموقع يحتاج اتصال آمن (HTTPS) أو تشغيل الموقع عبر localhost.'
          : 'Geolocation requires a secure context (HTTPS) or running on localhost.'
      );
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyMeters: pos.coords.accuracy,
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeo(null);
        const code = err?.code;
        if (code === 1) {
          setGeoError(isAr ? 'تم رفض إذن الموقع. فعّل الإذن من إعدادات المتصفح.' : 'Location permission denied. Enable it in your browser settings.');
        } else if (code === 2) {
          setGeoError(isAr ? 'الموقع غير متاح حالياً على هذا الجهاز.' : 'Position is unavailable on this device.');
        } else if (code === 3) {
          setGeoError(isAr ? 'انتهت مهلة تحديد الموقع. حاول مرة أخرى.' : 'Location request timed out. Try again.');
        } else {
          setGeoError(err?.message || (isAr ? 'تعذر الحصول على الموقع' : 'Failed to get location'));
        }
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  }, [isAr]);

  useEffect(() => {
    if (user?.userType !== USER_TYPES.COMPANY) return;
    // Only auto-fetch if user already granted permission
    if (!navigator?.permissions?.query) return;
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((p) => {
        if (p.state === 'granted') requestGeo();
      })
      .catch(() => {});
  }, [requestGeo, user?.userType]);

  // Refresh after we successfully get location
  useEffect(() => {
    if (user?.userType !== USER_TYPES.COMPANY) return;
    if (geo) refresh();
  }, [geo, refresh, user?.userType]);

  const zoneConfigured = Boolean(status?.location?.zone);
  const insideZone = status?.geo?.isInsideZone;

  const canCheckIn = useMemo(() => {
    if (!status || status.status !== 'OK') return false;
    if (zoneConfigured && insideZone !== true) return false;
    if (status.record?.checkInAt && !status.record?.checkOutAt) return false;
    if (status.record?.checkInAt && status.record?.checkOutAt) return false;
    return true;
  }, [status, zoneConfigured, insideZone]);

  const canCheckOut = useMemo(() => {
    if (!status || status.status !== 'OK') return false;
    if (zoneConfigured && insideZone !== true) return false;
    return Boolean(status.record?.checkInAt) && !status.record?.checkOutAt;
  }, [status, zoneConfigured, insideZone]);

  const doCheckIn = async () => {
    setActing(true);
    try {
      await attendanceCheckIn(
        geo ? { lat: geo.lat, lng: geo.lng, accuracyMeters: geo.accuracyMeters } : {}
      );
      message.success(isAr ? 'تم تسجيل الحضور' : 'Checked in');
      refresh();
    } catch (err) {
      message.error(err?.error || err?.message || (isAr ? 'تعذر تسجيل الحضور' : 'Failed to check in'));
    } finally {
      setActing(false);
    }
  };

  const doCheckOut = async () => {
    setActing(true);
    try {
      await attendanceCheckOut(
        geo ? { lat: geo.lat, lng: geo.lng, accuracyMeters: geo.accuracyMeters } : {}
      );
      message.success(isAr ? 'تم تسجيل الانصراف' : 'Checked out');
      refresh();
    } catch (err) {
      message.error(err?.error || err?.message || (isAr ? 'تعذر تسجيل الانصراف' : 'Failed to check out'));
    } finally {
      setActing(false);
    }
  };

  const fingerprintAction = useMemo(() => {
    if (canCheckIn) return 'checkIn';
    if (canCheckOut) return 'checkOut';
    return 'none';
  }, [canCheckIn, canCheckOut]);

  const handleFingerprintClick = () => {
    if (fingerprintAction === 'checkIn') doCheckIn();
    else if (fingerprintAction === 'checkOut') doCheckOut();
  };

  const fingerprintColor =
    fingerprintAction === 'checkIn'
      ? '#52c41a'
      : fingerprintAction === 'checkOut'
        ? '#ff4d4f'
        : '#bfbfbf';

  const fingerprintTitle =
    fingerprintAction === 'checkIn'
      ? isAr
        ? 'تسجيل حضور'
        : 'Check in'
      : fingerprintAction === 'checkOut'
        ? isAr
          ? 'تسجيل انصراف'
          : 'Check out'
        : isAr
          ? 'غير متاح حالياً'
          : 'Not available';

  if (user?.userType !== USER_TYPES.COMPANY) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FingerprintIcon sx={{ fontSize: 22, color: 'inherit' }} />
        {t('portal.attendanceDepartureTitle')}
      </Title>
      <Card
        extra={
          <Space wrap>
            <Button type="primary" onClick={requestGeo} loading={geoLoading}>
              {isAr ? 'تحديد الموقع' : 'Get location'}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
              {isAr ? 'تحديث' : 'Refresh'}
            </Button>
          </Space>
        }
      >
        <Paragraph type="secondary" style={{ marginBottom: 12 }}>
          {t('portal.attendanceDepartureIntro')}
        </Paragraph>

        {status?.status === 'NO_SHIFT' ? (
          <Alert
            type="warning"
            showIcon
            message={isAr ? 'لا توجد وردية مخصصة لك' : 'No shift assigned'}
            description={isAr ? 'يرجى التواصل مع الإدارة لتحديد وردية.' : 'Please contact admin to assign a shift.'}
          />
        ) : status?.status !== 'OK' ? (
          <Alert type="error" showIcon message={isAr ? 'تعذر تحميل الحالة' : 'Failed to load status'} />
        ) : (
          <>
            <Space wrap style={{ marginBottom: 12 }}>
              <Tag color="blue">{isAr ? 'المنطقة الزمنية' : 'Timezone'}: Asia/Riyadh</Tag>
              <Tag>{isAr ? 'الآن' : 'Now'}: {fmt(status.now, lang)}</Tag>
              {geo ? (
                <Tag>
                  {isAr ? 'موقعك' : 'Your location'}: {geo.lat.toFixed(6)}, {geo.lng.toFixed(6)}
                  {typeof geo.accuracyMeters === 'number' ? ` (±${Math.round(geo.accuracyMeters)}m)` : ''}
                </Tag>
              ) : null}
              {zoneConfigured ? (
                insideZone === true ? (
                  <Tag color="success">{isAr ? 'داخل النطاق' : 'Inside zone'}</Tag>
                ) : insideZone === false ? (
                  <Tag color="error">{isAr ? 'خارج النطاق' : 'Outside zone'}</Tag>
                ) : (
                  <Tag>{isAr ? 'لم يتم تحديد الموقع' : 'No location yet'}</Tag>
                )
              ) : (
                <Tag>{isAr ? 'لا يوجد نطاق للموقع' : 'No zone configured'}</Tag>
              )}
            </Space>

            {geoError ? (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                message={isAr ? 'يلزم السماح بالموقع' : 'Location permission required'}
                description={geoError}
              />
            ) : null}

            {zoneConfigured && insideZone === false ? (
              <Alert
                type="error"
                showIcon
                style={{ marginBottom: 12 }}
                message={isAr ? 'خارج نطاق العمل' : 'Outside allowed zone'}
                description={
                  isAr
                    ? 'أنت خارج النطاق المسموح لموقع العمل. لا يمكنك تسجيل الحضور/الانصراف.'
                    : 'You are outside the allowed work zone. Check-in/out is disabled.'
                }
              />
            ) : null}

            <Descriptions
              bordered
              size="small"
              column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
              style={{ marginBottom: 12 }}
            >
              <Descriptions.Item label={isAr ? 'الوردية' : 'Shift'}>
                {(isAr ? status.shift?.shiftAr : status.shift?.name) || status.shift?.name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={isAr ? 'بداية الوردية' : 'Shift start'}>
                {fmt(status.shift?.shiftStartAt, lang)}
              </Descriptions.Item>
              <Descriptions.Item label={isAr ? 'نهاية الوردية' : 'Shift end'}>
                {fmt(status.shift?.shiftEndAt, lang)}
              </Descriptions.Item>
              <Descriptions.Item label={isAr ? 'مسموح تسجيل الحضور من' : 'Check-in allowed from'}>
                {fmt(status.shift?.checkInEarliestAt, lang)}
              </Descriptions.Item>
              <Descriptions.Item label={isAr ? 'آخر وقت لتسجيل الحضور' : 'Latest check-in'}>
                {fmt(status.shift?.checkInLatestAt, lang)}
              </Descriptions.Item>
              <Descriptions.Item label={isAr ? 'آخر وقت لتسجيل الانصراف' : 'Latest check-out'}>
                {fmt(status.shift?.checkOutLatestAt, lang)}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
              <button
                type="button"
                title={fingerprintTitle}
                aria-label={fingerprintTitle}
                onClick={handleFingerprintClick}
                disabled={fingerprintAction === 'none' || acting}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 16,
                  margin: 0,
                  cursor: fingerprintAction === 'none' || acting ? 'not-allowed' : 'pointer',
                  lineHeight: 0,
                  borderRadius: '50%',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => {
                  if (fingerprintAction !== 'none' && !acting) e.currentTarget.style.transform = 'scale(0.96)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {acting ? (
                  <LoadingOutlined style={{ fontSize: 112, color: fingerprintColor }} spin />
                ) : (
                  <FingerprintIcon
                    sx={{
                      fontSize: 112,
                      color: fingerprintColor,
                      display: 'block',
                      transition: 'color 0.2s ease',
                    }}
                  />
                )}
              </button>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 2, lg: 2 }}>
              <Descriptions.Item label={isAr ? 'وقت الحضور' : 'Check-in time'}>
                {fmt(status.record?.checkInAt, lang)}
              </Descriptions.Item>
              <Descriptions.Item label={isAr ? 'وقت الانصراف' : 'Check-out time'}>
                {fmt(status.record?.checkOutAt, lang)}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </div>
  );
}

