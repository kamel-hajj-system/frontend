import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Col,
  Empty,
  Row,
  Spin,
  Statistic,
  Typography,
  theme as antTheme,
} from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { getReceptionNationalitiesOverview } from '../../../../api/reception';
import { NationalityFlagImage } from '../../../../components/flags/NationalityFlagImage';
import { ReceptionNationalityPie } from './ReceptionNationalityPie';

const { Title, Paragraph, Text } = Typography;

export function ReceptionNationalitiesPage() {
  const { token } = antTheme.useToken();
  const { hasAccess } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const canView =
    hasAccess('reception.dashboard') ||
    hasAccess('reception.serviceCenters') ||
    hasAccess('reception.nationalities');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getReceptionNationalitiesOverview()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const n = rows.length;
    const withData = rows.filter((r) => (r.totalAllocated ?? 0) > 0).length;
    const alloc = rows.reduce((s, r) => s + (r.totalAllocated || 0), 0);
    const arr = rows.reduce((s, r) => s + (r.totalArrived || 0), 0);
    const pct = alloc > 0 ? Math.min(100, Math.round((arr / alloc) * 100)) : 0;
    return { n, withData, alloc, arr, pct };
  }, [rows]);

  if (!canView) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  const colorAllocated = token.colorSuccess;
  const colorArrived = token.colorPrimary;

  const summarySurface = {
    marginBottom: 24,
    padding: '20px 22px',
    borderRadius: token.borderRadiusLG * 1.25,
    background: token.colorFillQuaternary,
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 8 }}>
        <GlobalOutlined style={{ marginInlineEnd: 8 }} />
        {t('portal.receptionNatTitle')}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {t('portal.receptionNatSubtitle')}
      </Paragraph>

      {loading ? (
        <div style={{ ...summarySurface, textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : rows.length === 0 ? (
        <Empty description={t('portal.receptionNatEmpty')} />
      ) : (
        <>
          <div style={summarySurface}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionNatSummaryNationalities')}
                  value={totals.n}
                  valueStyle={{ fontWeight: 700, fontSize: 26, fontVariantNumeric: 'tabular-nums' }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('portal.receptionNatSummaryWithData', { count: totals.withData })}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionNatSummaryAllocated')}
                  value={totals.alloc}
                  valueStyle={{
                    fontWeight: 700,
                    fontSize: 26,
                    color: colorAllocated,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionNatSummaryArrived')}
                  value={totals.arr}
                  valueStyle={{
                    fontWeight: 700,
                    fontSize: 26,
                    color: colorArrived,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionNatSummaryRate')}
                  value={totals.pct}
                  suffix="%"
                  valueStyle={{ fontWeight: 700, fontSize: 26, fontVariantNumeric: 'tabular-nums' }}
                />
              </Col>
            </Row>
          </div>

          <Title level={5} style={{ marginBottom: 14, fontWeight: 600 }}>
            {t('portal.receptionNatByNationality')}
          </Title>
          <Row gutter={[14, 14]}>
            {rows.map((nat) => {
              const displayName = isAr ? nat.nameAr || nat.name : nat.name || nat.code;
              const alloc = nat.totalAllocated ?? 0;
              const arr = nat.totalArrived ?? 0;
              const pct = nat.arrivedPercent ?? 0;

              return (
                <Col xs={24} lg={12} xxl={8} key={nat.id}>
                  <div
                    title={displayName}
                    style={{
                      height: '100%',
                      minHeight: 148,
                      borderRadius: token.borderRadiusLG * 1.25,
                      background: token.colorBgContainer,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 18,
                      boxShadow: token.boxShadowTertiary,
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    {/* Identity */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        flex: '1 1 200px',
                        minWidth: 0,
                      }}
                    >
                      <NationalityFlagImage variant="card" flagCode={nat.flagCode} nat={nat} token={token} />
                      <div style={{ minWidth: 0 }}>
                        {nat.code != null && nat.code !== '' ? (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 11,
                              fontFamily: 'ui-monospace, monospace',
                              letterSpacing: '0.04em',
                              display: 'block',
                              marginBottom: 2,
                            }}
                          >
                            {nat.code}
                          </Text>
                        ) : null}
                        <Text
                          strong
                          style={{
                            fontSize: 16,
                            lineHeight: 1.35,
                            display: 'block',
                          }}
                          ellipsis
                        >
                          {displayName}
                        </Text>
                      </div>
                    </div>

                    {/* Stats strip */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 0,
                        flex: '1 1 200px',
                        justifyContent: isAr ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{ paddingInline: 16, textAlign: isAr ? 'right' : 'left' }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                          {t('portal.receptionNatPilgrims')}
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: 22,
                            fontVariantNumeric: 'tabular-nums',
                            color: colorAllocated,
                            lineHeight: 1.2,
                          }}
                        >
                          {alloc}
                        </Text>
                      </div>
                      <div
                        style={{
                          width: 1,
                          alignSelf: 'stretch',
                          background: token.colorSplit,
                          margin: '4px 0',
                        }}
                        aria-hidden
                      />
                      <div style={{ paddingInline: 16, textAlign: isAr ? 'right' : 'left' }}>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>
                          {t('portal.receptionNatArrived')}
                        </Text>
                        <Text
                          strong
                          style={{
                            fontSize: 22,
                            fontVariantNumeric: 'tabular-nums',
                            color: colorArrived,
                            lineHeight: 1.2,
                          }}
                        >
                          {arr}
                        </Text>
                      </div>
                    </div>

                    {/* Chart — unchanged component */}
                    <div
                      style={{
                        flex: '0 0 auto',
                        marginInlineStart: isAr ? 0 : 'auto',
                        marginInlineEnd: isAr ? 'auto' : 0,
                        marginTop: 4,
                      }}
                    >
                      <ReceptionNationalityPie
                        token={token}
                        allocated={alloc}
                        arrived={arr}
                        arrivedLabel={t('portal.receptionNatArrived')}
                        pendingLabel={t('portal.receptionNatPending')}
                        percent={pct}
                      />
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </>
      )}
    </div>
  );
}
