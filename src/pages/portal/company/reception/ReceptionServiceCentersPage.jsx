import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Typography,
  theme as antTheme,
} from 'antd';
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import {
  getReceptionServiceCentersOverview,
  getReceptionServiceCenterUsers,
} from '../../../../api/reception';
import { nationalityFlagOrFallback } from '../../../../utils/flags';
import { ServiceCentersBarChart, TotalsMixDoughnut } from './ServiceCentersCharts';

const { Title, Paragraph, Text } = Typography;

export function ReceptionServiceCentersPage() {
  const { token } = antTheme.useToken();
  const { hasAccess } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const canView =
    hasAccess('reception.dashboard') || hasAccess('reception.serviceCenters');

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getReceptionServiceCentersOverview()
      .then((rows) => setCenters(Array.isArray(rows) ? rows : []))
      .catch(() => setCenters([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const n = centers.length;
    const alloc = centers.reduce((s, c) => s + (c.totalAllocated || 0), 0);
    const arr = centers.reduce((s, c) => s + (c.totalArrived || 0), 0);
    const pct = alloc > 0 ? Math.min(100, Math.round((arr / alloc) * 100)) : 0;
    const cap = centers.reduce((s, c) => s + (c.maxCapacity ?? 0), 0);
    return { n, alloc, arr, pct, cap };
  }, [centers]);

  const allocatedLabel = t('portal.receptionScStatAllocated');
  const arrivedLabel = t('portal.receptionScStatArrived');

  const openDetails = async (c) => {
    setSelected(c);
    setDrawerOpen(true);
    setUsers([]);
    setUsersLoading(true);
    try {
      const rows = await getReceptionServiceCenterUsers(c.id);
      setUsers(Array.isArray(rows) ? rows : []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  if (!canView) {
    return <Alert type="error" message={t('forbidden.message')} showIcon />;
  }

  /** المخصص = success، الواصلون = primary (معكوسان عن الافتراضي السابق) */
  const colorAllocated = token.colorSuccess;
  const colorArrived = token.colorPrimary;

  const progressStroke = {
    '0%': colorAllocated,
    '100%': colorArrived,
  };

  const statValueStyle = {
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 8 }}>
        <ApartmentOutlined style={{ marginInlineEnd: 8 }} />
        {t('portal.receptionServiceCentersTitle')}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {t('portal.receptionServiceCentersSubtitle')}
      </Paragraph>

      {loading ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        </Card>
      ) : centers.length === 0 ? (
        <Empty description={t('portal.receptionScNoCenters')} />
      ) : (
        <>
          <Card
            style={{ marginBottom: 24 }}
            title={
              <span>
                <BarChartOutlined style={{ marginInlineEnd: 8, color: colorAllocated }} />
                {t('portal.receptionScChartTitle')}
              </span>
            }
          >
            <Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 20 }}>
              {t('portal.receptionScChartSubtitle')}
            </Paragraph>

            <Row
              gutter={[16, 16]}
              style={{
                marginBottom: 20,
                padding: '4px 0 16px',
              }}
            >
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionScTotalPilgrimsTitle')}
                  value={totals.alloc}
                  valueStyle={{ ...statValueStyle, color: colorAllocated, fontSize: 26 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionScTotalArrivedTitle')}
                  value={totals.arr}
                  valueStyle={{ ...statValueStyle, color: colorArrived, fontSize: 26 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionScArrivedOfAllocated')}
                  value={totals.pct}
                  suffix="%"
                  valueStyle={{ ...statValueStyle, color: token.colorText, fontSize: 26 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('portal.receptionScStatCenters')}
                  value={totals.n}
                  valueStyle={{ ...statValueStyle, fontSize: 26 }}
                />
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                  {t('portal.receptionScStatCapacity')}:{' '}
                  <Text strong>{totals.cap || '—'}</Text>
                </Text>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0 20px' }} />

            <Row gutter={[24, 24]}>
              <Col xs={24} xl={17}>
                <div
                  style={{
                    borderRadius: token.borderRadiusLG,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorFillQuaternary,
                    padding: '12px 8px 8px',
                  }}
                >
                  <ServiceCentersBarChart
                    token={token}
                    centers={centers}
                    allocatedLabel={allocatedLabel}
                    arrivedLabel={arrivedLabel}
                    isAr={isAr}
                    minHeight={440}
                  />
                </div>
              </Col>
              <Col xs={24} xl={7}>
                <Card
                  size="small"
                  variant="borderless"
                  style={{
                    height: '100%',
                    background: token.colorBgLayout,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                  title={
                    <span>
                      <PieChartOutlined style={{ marginInlineEnd: 8, color: colorArrived }} />
                      {t('portal.receptionScOverallMixTitle')}
                    </span>
                  }
                >
                  {totals.alloc > 0 ? (
                    <>
                      <TotalsMixDoughnut
                        token={token}
                        totals={totals}
                        arrivedLabel={arrivedLabel}
                        remainingLabel={t('portal.receptionScRemainingToArrive')}
                        isAr={isAr}
                        title={null}
                      />
                      <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {totals.arr} / {totals.alloc} {t('portal.receptionScArrivedOfAllocated')}
                        </Text>
                      </div>
                    </>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={t('portal.receptionScNoAllocatedPilgrims')}
                    />
                  )}
                </Card>
              </Col>
            </Row>
          </Card>

          <Title level={5} style={{ marginBottom: 12, fontWeight: 600 }}>
            {t('portal.receptionScCentersListTitle')}
          </Title>
          <Row gutter={[16, 16]}>
            {centers.map((c) => {
              const displayName = isAr ? c.nameAr || c.name : c.name || c.code;
              const flags = (c.nationalities || []).filter((n) => n?.id);
              const alloc = c.totalAllocated ?? 0;
              const arr = c.totalArrived ?? 0;
              const pct = c.arrivedPercent ?? 0;
              return (
                <Col xs={24} sm={12} lg={8} key={c.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={displayName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDetails(c);
                      }
                    }}
                    style={{ height: '100%', outline: 'none' }}
                  >
                    <Card
                      hoverable
                      onClick={() => openDetails(c)}
                      style={{
                        height: '100%',
                        borderRadius: token.borderRadiusLG,
                        border: `1px solid ${token.colorBorderSecondary}`,
                      }}
                      styles={{
                        body: { padding: 16 },
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 12,
                          marginBottom: 14,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <Text
                            type="secondary"
                            style={{
                              fontFamily: 'ui-monospace, monospace',
                              fontSize: 11,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {c.code}
                          </Text>
                          <Text
                            strong
                            style={{
                              display: 'block',
                              marginTop: 6,
                              fontSize: 15,
                              fontWeight: 600,
                              lineHeight: 1.35,
                            }}
                            ellipsis={{ tooltip: displayName }}
                          >
                            {displayName}
                          </Text>
                        </div>
                        <span
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: token.borderRadius,
                            background: token.colorFillQuaternary,
                            color: token.colorTextSecondary,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                          aria-hidden
                        >
                          <ArrowRightOutlined style={{ fontSize: 13 }} />
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: 6,
                          marginBottom: 12,
                          padding: '10px 0',
                          borderTop: `1px solid ${token.colorSplit}`,
                          borderBottom: `1px solid ${token.colorSplit}`,
                        }}
                      >
                        <div>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                            {t('portal.receptionScStatAllocated')}
                          </Text>
                          <Text
                            strong
                            style={{
                              fontSize: 14,
                              fontVariantNumeric: 'tabular-nums',
                              color: colorAllocated,
                            }}
                          >
                            {alloc}
                          </Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                            {t('portal.receptionScArrived')}
                          </Text>
                          <Text
                            strong
                            style={{
                              fontSize: 14,
                              fontVariantNumeric: 'tabular-nums',
                              color: colorArrived,
                            }}
                          >
                            {arr}
                          </Text>
                        </div>
                        <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                            {t('portal.receptionScMaxCap')}
                          </Text>
                          <Text strong style={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                            {c.maxCapacity != null ? c.maxCapacity : '—'}
                          </Text>
                        </div>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('portal.receptionScArrived')}
                          </Text>
                          <Text
                            strong
                            style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: colorArrived }}
                          >
                            {pct}%
                          </Text>
                        </div>
                        <Progress
                          percent={pct}
                          strokeLinecap="round"
                          strokeWidth={6}
                          strokeColor={progressStroke}
                          trailColor={token.colorFillSecondary}
                          showInfo={false}
                        />
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                        {flags.length === 0 ? (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            —
                          </Text>
                        ) : (
                          flags.slice(0, 8).map((nat) => {
                            const f = nationalityFlagOrFallback(nat);
                            return (
                              <span
                                key={nat.id}
                                title={isAr ? nat.nameAr || nat.name : nat.name}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: token.borderRadius,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: f.type === 'emoji' ? 16 : 10,
                                  fontWeight: 600,
                                  background: token.colorFillQuaternary,
                                  border: `1px solid ${token.colorBorderSecondary}`,
                                  lineHeight: 1,
                                }}
                              >
                                {f.type === 'emoji' ? (
                                  f.value
                                ) : (
                                  <span style={{ color: token.colorTextSecondary }}>{f.value}</span>
                                )}
                              </span>
                            );
                          })
                        )}
                        {flags.length > 8 ? (
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            +{flags.length - 8}
                          </Text>
                        ) : null}
                      </div>
                    </Card>
                  </div>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      <Drawer
        title={
          selected ? (
            <span>
              <UserOutlined style={{ marginInlineEnd: 8, color: token.colorPrimary }} />
              {isAr ? selected.nameAr || selected.name : selected.name || selected.code} ({selected.code})
            </span>
          ) : (
            ''
          )
        }
        placement={isAr ? 'left' : 'right'}
        width={Math.min(440, typeof window !== 'undefined' ? window.innerWidth - 24 : 440)}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        destroyOnClose
      >
        {selected ? (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillQuaternary,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Row gutter={[12, 8]}>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  {t('portal.receptionScStatAllocated')}
                </Text>
                <Text strong style={{ color: colorAllocated }}>{selected.totalAllocated ?? 0}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  {t('portal.receptionScArrived')}
                </Text>
                <Text strong style={{ color: colorArrived }}>{selected.totalArrived ?? 0}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  {t('portal.receptionScMaxCap')}
                </Text>
                <Text strong>{selected.maxCapacity != null ? selected.maxCapacity : '—'}</Text>
              </Col>
            </Row>
          </div>
        ) : null}
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {t('portal.receptionScDrawerHint')}
        </Text>
        <Table
          size="small"
          rowKey="id"
          loading={usersLoading}
          pagination={false}
          dataSource={users}
          locale={{ emptyText: t('portal.receptionScNoUsers') }}
          columns={[
            {
              title: t('portal.receptionScUserName'),
              key: 'n',
              render: (_, u) => <span>{isAr ? u.fullNameAr || u.fullName : u.fullName}</span>,
            },
            {
              title: t('portal.receptionScUserPhone'),
              dataIndex: 'phone',
              key: 'phone',
              render: (v) => v || '—',
            },
          ]}
        />
      </Drawer>
    </div>
  );
}
