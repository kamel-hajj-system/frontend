import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Divider, Empty, Grid, Progress, Row, Spin, Tag, Typography, theme as antTheme } from 'antd';
import {
  ApartmentOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { getReceptionPilgrimCompaniesOverview } from '../../../../../api/reception';
import { resolveNationalityIso2ForFlag } from '../../../../../utils/flags';
import { SummaryStatCard } from '../../../../../components/dashboard/SummaryStatCard';
import { PortalTitleIcon } from '../../../../../components/portal/PortalTitleIcon';

const { Title, Paragraph, Text } = Typography;
const FLAG_CDN = 'https://cdn.jsdelivr.net/npm/country-flag-icons@1.5.11/3x2';

function gaugeColor(percent, token) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  if (p === 0) return token.colorError;
  if (p <= 35) return token.colorWarning;
  if (p < 100) return token.colorPrimary;
  return token.colorSuccess;
}

function Speedometer({ percent, token, size = 88 }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const color = gaugeColor(p, token);
  const stroke = Math.max(6, Math.round(size / 14));
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = Math.PI * r;
  const dash = (p / 100) * circ;
  const fs = Math.round(size * 0.19);

  return (
    <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`} style={{ display: 'block', flexShrink: 0 }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={token.colorFillSecondary} strokeWidth={stroke} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={fs} fontWeight="800" fill={color}>{p}%</text>
    </svg>
  );
}

function PartnerFlagPanel({ flagCode, token, compact }) {
  const iso = resolveNationalityIso2ForFlag(flagCode);
  const minH = compact ? 72 : 158;
  const grow = compact ? {} : { flex: 1, minHeight: minH };

  if (!iso) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: minH,
          height: compact ? minH : undefined,
          background: `linear-gradient(140deg, ${token.colorPrimaryBg}, ${token.colorFillQuaternary})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...grow,
        }}
      >
        <GlobalOutlined style={{ fontSize: compact ? 26 : 36, color: token.colorTextQuaternary }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: minH,
        height: compact ? minH : undefined,
        background: token.colorFillQuaternary,
        ...grow,
      }}
    >
      <img
        src={`${FLAG_CDN}/${iso.toUpperCase()}.svg`}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
        }}
      />
    </div>
  );
}

function MetricItem({ label, value, color, token }) {
  return (
    <div style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>
      <Text type="secondary" style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', display: 'block', lineHeight: 1.3 }}>{label}</Text>
      <Text strong style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', color, display: 'block', marginTop: 2 }}>{value}</Text>
    </div>
  );
}

export function PilgrimCompaniesDashboardPage() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const smUp = !!screens.sm;
  const { hasAccess } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const canView = hasAccess('reception.pilgrimCompanies') || hasAccess('reception.dashboard');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  const load = useCallback(() => {
    setLoading(true);
    getReceptionPilgrimCompaniesOverview()
      .then((res) => setRows(Array.isArray(res) ? res : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    const companies = rows.length;
    const expected = rows.reduce((s, r) => s + (r.expectedPilgrimsCount || 0), 0);
    const matched = rows.reduce((s, r) => s + (r.mergedActualPilgrimsCount || 0), 0);
    const centers = new Set(rows.flatMap((r) => (r.centers || []).map((c) => c.id).filter(Boolean))).size;
    const rate = expected > 0 ? Math.min(100, Math.round((matched / expected) * 100)) : 0;
    return { companies, expected, matched, centers, rate };
  }, [rows]);

  if (!canView) return <Alert type="error" message={t('forbidden.message')} showIcon />;

  const natLine = (nats) => nats.map((n) => n.label).join(' · ');

  return (
    <div>
      <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <PortalTitleIcon>
          <GlobalOutlined />
        </PortalTitleIcon>
        {t('portal.receptionPilgrimCompaniesTitle')}
      </Title>
      <Paragraph type="secondary">{t('portal.receptionPcSubtitle')}</Paragraph>

      {loading ? (
        <Card><div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div></Card>
      ) : rows.length === 0 ? (
        <Empty description={t('portal.receptionPcNoCompanies')} />
      ) : (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={6}>
              <SummaryStatCard icon={<TeamOutlined />} accent={token.colorPrimary} label={t('portal.receptionPcStatPartners')} value={totals.companies} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <SummaryStatCard icon={<RiseOutlined />} accent={token.colorInfo} label={t('portal.receptionPcStatExpected')} value={totals.expected.toLocaleString()} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <SummaryStatCard icon={<CheckCircleOutlined />} accent={token.colorSuccess} label={t('portal.receptionPcStatMatched')} value={totals.matched.toLocaleString()} />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <SummaryStatCard icon={<ApartmentOutlined />} accent={token.colorWarning} label={t('portal.receptionPcStatCenters')} value={totals.centers} />
            </Col>
          </Row>

          <Card style={{ marginBottom: 18 }}>
            <Text strong>{t('portal.receptionPcOverallMatch')}</Text>
            <Progress percent={totals.rate} strokeColor={gaugeColor(totals.rate, token)} style={{ marginTop: 6 }} />
            <Text type="secondary">{totals.matched} / {totals.expected}</Text>
          </Card>

          <Row gutter={[14, 14]}>
            {rows.map((r) => {
              const pct = r.matchedPercent ?? 0;
              const primaryNat = (r.nationalities || [])[0];
              const name = isAr ? r.nameAr || r.name : r.name;
              const nats = (r.nationalities || []).map((n) => ({
                ...n,
                label: isAr ? n.nameAr || n.name : n.name,
              }));
              const gaugeW = smUp ? 92 : 80;

              return (
                <Col xs={24} md={12} xl={8} key={r.id}>
                  <Card
                    styles={{ body: { padding: 0 } }}
                    style={{
                      height: '100%',
                      borderRadius: token.borderRadiusLG * 1.25,
                      overflow: 'hidden',
                      border: `1px solid ${token.colorBorderSecondary}`,
                      boxShadow: token.boxShadowTertiary,
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = token.boxShadowSecondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = token.boxShadowTertiary;
                    }}
                  >
                    <Row gutter={0} align="stretch">
                      <Col xs={24} sm={8} md={7} style={{ display: 'flex', flexDirection: 'column' }}>
                        <PartnerFlagPanel flagCode={primaryNat?.flagCode} token={token} compact={!smUp} />
                      </Col>
                      <Col xs={24} sm={16} md={17} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 280px', minWidth: 0 }}>
                        <div style={{ padding: 'clamp(12px, 2vw, 18px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <Text
                                strong
                                style={{
                                  fontSize: 'clamp(15px, 1.65vw, 17px)',
                                  display: 'block',
                                  lineHeight: 1.35,
                                  letterSpacing: '-0.02em',
                                }}
                                ellipsis={{ tooltip: name }}
                              >
                                {name}
                              </Text>
                              {nats.length > 0 ? (
                                <Paragraph
                                  type="secondary"
                                  style={{ margin: '6px 0 0', fontSize: 'clamp(12px, 1.25vw, 13px)', lineHeight: 1.5 }}
                                  ellipsis={{ rows: 2, tooltip: natLine(nats) }}
                                >
                                  {natLine(nats)}
                                </Paragraph>
                              ) : null}
                            </div>
                            <Speedometer percent={pct} token={token} size={gaugeW} />
                          </div>

                          <Divider style={{ margin: '12px 0 10px' }} />

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'stretch',
                              gap: 4,
                              marginBottom: (r.centers || []).length ? 10 : 0,
                            }}
                          >
                            <MetricItem label={isAr ? 'المتوقع' : 'Expected'} value={r.expectedPilgrimsCount ?? 0} color={token.colorPrimary} token={token} />
                            <div style={{ width: 1, background: token.colorSplit, flexShrink: 0, margin: '4px 0' }} />
                            <MetricItem label={isAr ? 'بعد المطابقة' : 'Matched'} value={r.mergedActualPilgrimsCount ?? 0} color={token.colorSuccess} token={token} />
                            <div style={{ width: 1, background: token.colorSplit, flexShrink: 0, margin: '4px 0' }} />
                            <MetricItem label={isAr ? 'المراكز' : 'Centers'} value={(r.centers || []).length} color={token.colorInfo} token={token} />
                          </div>

                          {(r.centers || []).length > 0 ? (
                            <div style={{ marginTop: 'auto', paddingTop: 4 }}>
                              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>{t('portal.receptionPcCenters')}</Text>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {(r.centers || []).map((c) => (
                                  <Tag
                                    key={c.id}
                                    style={{
                                      margin: 0,
                                      borderRadius: 8,
                                      padding: '2px 8px',
                                      fontSize: 'clamp(11px, 1.1vw, 12px)',
                                      border: `1px solid ${token.colorBorderSecondary}`,
                                      background: token.colorFillAlter,
                                    }}
                                  >
                                    <EnvironmentOutlined style={{ marginInlineEnd: 4, opacity: 0.75 }} />
                                    {isAr ? c.nameAr || c.name || c.code : c.name || c.code}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
}
