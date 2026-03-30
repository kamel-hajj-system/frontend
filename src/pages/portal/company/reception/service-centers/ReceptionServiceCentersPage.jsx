import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Empty, Progress, Row, Spin, Table, Tag, Typography, theme as antTheme } from 'antd';
import { ApartmentOutlined, CheckCircleOutlined, ClockCircleOutlined, DatabaseOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { getReceptionServiceCenterUsers, getReceptionServiceCentersOverview } from '../../../../../api/reception';
import { SummaryStatCard } from '../../../../../components/dashboard/SummaryStatCard';
import { DashboardDetailModal } from '../../../../../components/dashboard/DashboardDetailModal';
import { DashboardDetailSection } from '../../../../../components/dashboard/DashboardDetailSection';
import { PortalTitleIcon } from '../../../../../components/portal/PortalTitleIcon';

const { Title, Paragraph, Text } = Typography;

function InfoCell({ label, value, valueColor, token }) {
  const inner =
    typeof value === 'number' || typeof value === 'string' ? (
      <Text strong style={{ fontSize: 15, color: valueColor ?? token.colorText }}>{value}</Text>
    ) : (
      value
    );
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</Text>
      {inner}
    </div>
  );
}

export function ReceptionServiceCentersPage() {
  const { token } = antTheme.useToken();
  const { hasAccess } = useAuth();
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';
  const canView = hasAccess('reception.serviceCenters');
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
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
    const centerCount = centers.length;
    const pilgrimsCount = centers.reduce((s, c) => s + (c.totalAllocated || 0), 0);
    const integrationMatches = centers.reduce((s, c) => s + (c.totalIntegrated || 0), 0);
    const integrationRate = pilgrimsCount > 0 ? Math.min(100, Math.round((integrationMatches / pilgrimsCount) * 100)) : 0;
    return { centerCount, pilgrimsCount, integrationMatches, integrationRate };
  }, [centers]);

  const openDetails = async (center) => {
    setSelected(center);
    setDetailOpen(true);
    setUsers([]);
    setUsersLoading(true);
    try {
      const rows = await getReceptionServiceCenterUsers(center.id);
      setUsers(Array.isArray(rows) ? rows : []);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  if (!canView) return <Alert type="error" message={t('forbidden.message')} showIcon />;

  const selectedDisplayName = selected
    ? (isAr ? selected.nameAr || selected.name : selected.name || selected.code)
    : '';

  return (
    <div>
      <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <PortalTitleIcon>
          <ApartmentOutlined />
        </PortalTitleIcon>
        {t('portal.receptionServiceCentersTitle')}
      </Title>
      <Paragraph type="secondary">{t('portal.receptionServiceCentersSubtitle')}</Paragraph>

      {loading ? (
        <Card><div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div></Card>
      ) : centers.length === 0 ? (
        <Empty description={t('portal.receptionScNoCenters')} />
      ) : (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={8}>
              <SummaryStatCard
                icon={<TeamOutlined />}
                accent={token.colorPrimary}
                label={t('portal.receptionScTotalPilgrimsTitle')}
                value={totals.pilgrimsCount}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <SummaryStatCard
                icon={<CheckCircleOutlined />}
                accent={token.colorSuccess}
                label={t('portal.receptionScTotalArrivedTitle')}
                value={totals.integrationMatches}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <SummaryStatCard
                icon={<ApartmentOutlined />}
                accent={token.colorWarning}
                label={t('portal.receptionScStatCenters')}
                value={totals.centerCount}
              />
            </Col>
          </Row>

          <Card style={{ marginBottom: 18 }}>
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} lg={16}>
                <Text strong>{t('portal.receptionScArrivedOfAllocated')}</Text>
                <Progress percent={totals.integrationRate} style={{ marginTop: 6 }} />
                <Text type="secondary">{totals.integrationMatches} / {totals.pilgrimsCount}</Text>
              </Col>
              <Col xs={24} lg={8}>
                <div style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, padding: 12 }}>
                  <Text strong><ClockCircleOutlined style={{ marginInlineEnd: 6 }} />{t('portal.receptionScArrivingComingSoon')}</Text>
                  <Paragraph type="secondary" style={{ margin: '8px 0 0' }}>{t('portal.receptionScArrivingComingSoonHint')}</Paragraph>
                </div>
              </Col>
            </Row>
          </Card>

          <Row gutter={[14, 14]}>
            {centers.map((c) => {
              const displayName = isAr ? c.nameAr || c.name : c.name || c.code;
              const companies = (c.companies || []).map((x) => (isAr ? x.nameAr || x.name : x.name)).filter(Boolean);
              return (
                <Col xs={24} md={12} xl={8} key={c.id}>
                  <Card hoverable onClick={() => openDetails(c)} style={{ height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div><Text type="secondary">{c.code}</Text><div><Text strong>{displayName}</Text></div></div>
                      <DatabaseOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
                    </div>
                    <Row gutter={8} style={{ marginTop: 12 }}>
                      <Col span={8}><Text type="secondary">{t('portal.receptionScStatAllocated')}</Text><div><Text strong>{c.totalAllocated ?? 0}</Text></div></Col>
                      <Col span={8}><Text type="secondary">{t('portal.receptionScArrived')}</Text><div><Text strong>{c.totalIntegrated ?? 0}</Text></div></Col>
                      <Col span={8}><Text type="secondary">{t('portal.receptionScArrivingLabel')}</Text><div><Tag icon={<ClockCircleOutlined />}>{t('portal.receptionScComingSoon')}</Tag></div></Col>
                    </Row>
                    <Progress percent={c.integratedPercent ?? 0} size="small" style={{ marginTop: 10, marginBottom: 8 }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {companies.slice(0, 3).map((name) => <Tag key={name}>{name}</Tag>)}
                      {companies.length > 3 ? <Tag>+{companies.length - 3}</Tag> : null}
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      <DashboardDetailModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelected(null); }}
        title={selected ? `${t('portal.receptionScDetailHeaderTitle')} — ${selectedDisplayName}` : ''}
        subtitle={selected ? `${t('portal.receptionScFieldCode')}: ${selected.code}` : ''}
        closeAriaLabel={t('common.close')}
        width={Math.min(920, typeof window !== 'undefined' ? window.innerWidth - 32 : 920)}
      >
        {selected ? (
          <>
            <DashboardDetailSection title={t('portal.receptionScDetailSectionInfo')} accent={token.colorPrimary}>
              <Row gutter={[16, 20]}>
                <Col xs={12} md={6}>
                  <InfoCell label={t('portal.receptionScFieldCode')} value={selected.code} token={token} />
                </Col>
                <Col xs={12} md={6}>
                  <InfoCell
                    label={t('portal.receptionScMaxCap')}
                    value={selected.maxCapacity != null ? String(selected.maxCapacity) : '—'}
                    token={token}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <InfoCell
                    label={t('portal.receptionScFieldMatchRate')}
                    value={`${selected.integratedPercent ?? 0}%`}
                    token={token}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <InfoCell
                    label={t('portal.receptionScFieldPartnersCount')}
                    value={(selected.companies || []).length}
                    token={token}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <InfoCell
                    label={t('portal.receptionScStatusActive')}
                    value={(
                      <Tag color="success" style={{ margin: 0, fontWeight: 600 }}>
                        {t('portal.receptionScStatusActive')}
                      </Tag>
                    )}
                    token={token}
                  />
                </Col>
              </Row>

              <div style={{ borderTop: `1px solid ${token.colorSplit}`, marginTop: 18, paddingTop: 18 }}>
                <Row gutter={[10, 10]}>
                  <Col span={8}>
                    <Text type="secondary">{t('portal.receptionScStatAllocated')}</Text>
                    <div><Text strong>{selected.totalAllocated ?? 0}</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">{t('portal.receptionScArrived')}</Text>
                    <div><Text strong>{selected.totalIntegrated ?? 0}</Text></div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">{t('portal.receptionScArrivingLabel')}</Text>
                    <div><Tag>{t('portal.receptionScComingSoon')}</Tag></div>
                  </Col>
                </Row>
              </div>
            </DashboardDetailSection>

            <DashboardDetailSection
              title={t('portal.receptionScDetailSectionUsers')}
              accent={token.colorPrimary}
              extra={(
                <Tag style={{ margin: 0, borderRadius: 999 }}>
                  {t('portal.receptionScUsersCountBadge', { count: String(users.length) })}
                </Tag>
              )}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <UserOutlined style={{ color: token.colorTextSecondary }} />
                <Text type="secondary" style={{ fontSize: 13 }}>{t('portal.receptionScDrawerHint')}</Text>
              </div>
              <Table
                size="small"
                rowKey="id"
                loading={usersLoading}
                pagination={false}
                dataSource={users}
                locale={{ emptyText: t('portal.receptionScNoUsers') }}
                columns={[
                  { title: t('portal.receptionScUserName'), key: 'n', render: (_, u) => <span>{isAr ? u.fullNameAr || u.fullName : u.fullName}</span> },
                  { title: t('portal.receptionScUserPhone'), dataIndex: 'phone', key: 'phone', render: (v) => v || '—' },
                ]}
              />
            </DashboardDetailSection>
          </>
        ) : null}
      </DashboardDetailModal>
    </div>
  );
}
