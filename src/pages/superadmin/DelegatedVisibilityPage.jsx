import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Space, Select, Button, Typography, Tag, message, Divider } from 'antd';
import { EyeOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getUsers } from '../../api/users';
import { getDelegatedEmployeeVisibility, setDelegatedEmployeeVisibility } from '../../api/delegatedVisibility';
import { USER_TYPES } from '../../utils/constants';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';

const { Text, Paragraph } = Typography;

function userLabel(u) {
  const ar = u.fullNameAr ? ` — ${u.fullNameAr}` : '';
  return `${u.fullName || ''}${ar} (${u.email})`;
}

export function DelegatedVisibilityPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [viewerId, setViewerId] = useState(undefined);
  const [visibleUserIds, setVisibleUserIds] = useState([]);

  const loadCompanyUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await getUsers({ limit: 500, userType: USER_TYPES.COMPANY });
      const list = (res.data || []).filter((u) => !u.isSuperAdmin && u.userType === USER_TYPES.COMPANY);
      setCompanyUsers(list);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
      setCompanyUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [isAr]);

  const loadGrants = useCallback(async () => {
    setLoadingGrants(true);
    try {
      const res = await getDelegatedEmployeeVisibility();
      setGrouped(res.data || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
      setGrouped([]);
    } finally {
      setLoadingGrants(false);
    }
  }, [isAr]);

  useEffect(() => {
    loadCompanyUsers();
    loadGrants();
  }, [loadCompanyUsers, loadGrants]);

  const viewerOptions = useMemo(
    () =>
      companyUsers.map((u) => ({
        value: u.id,
        label: userLabel(u),
      })),
    [companyUsers]
  );

  const visibleOptions = useMemo(() => {
    return companyUsers
      .filter((u) => u.id !== viewerId)
      .map((u) => ({
        value: u.id,
        label: userLabel(u),
      }));
  }, [companyUsers, viewerId]);

  const onViewerChange = (id) => {
    setViewerId(id || undefined);
    if (!id) {
      setVisibleUserIds([]);
      return;
    }
    const row = grouped.find((g) => g.viewer?.id === id);
    setVisibleUserIds((row?.visibleUsers || []).map((u) => u.id));
  };

  useEffect(() => {
    if (!viewerId) return;
    const row = grouped.find((g) => g.viewer?.id === viewerId);
    setVisibleUserIds((row?.visibleUsers || []).map((u) => u.id));
  }, [grouped, viewerId]);

  const save = async () => {
    if (!viewerId) {
      message.warning(t('superadmin.delegatedVisibilitySelectViewer'));
      return;
    }
    setSaving(true);
    try {
      await setDelegatedEmployeeVisibility(viewerId, visibleUserIds);
      message.success(t('superadmin.delegatedVisibilitySaved'));
      await loadGrants();
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const summaryColumns = [
    {
      title: t('superadmin.delegatedVisibilityViewer'),
      key: 'viewer',
      render: (_, row) => userLabel(row.viewer),
    },
    {
      title: t('superadmin.delegatedVisibilityVisibleUsers'),
      key: 'visible',
      render: (_, row) => {
        const list = row.visibleUsers || [];
        if (list.length === 0) return <Text type="secondary">—</Text>;
        return (
          <Space wrap size={[4, 4]}>
            {list.slice(0, 8).map((u) => (
              <Tag key={u.id}>{u.fullName || u.email}</Tag>
            ))}
            {list.length > 8 ? <Tag>+{list.length - 8}</Tag> : null}
          </Space>
        );
      },
    },
    {
      title: t('superadmin.total'),
      key: 'count',
      width: 100,
      render: (_, row) => (row.visibleUsers || []).length,
    },
  ];

  const title = (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <EyeOutlined />
      {t('superadmin.delegatedVisibilityTitle')}
    </span>
  );

  return (
    <Card title={title} extra={<Tag color="blue">Super Admin</Tag>}>
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {t('superadmin.delegatedVisibilityIntro')}
      </Paragraph>

      <Space wrap style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={() => { loadCompanyUsers(); loadGrants(); }} loading={loadingUsers || loadingGrants}>
          {t('superadmin.delegatedVisibilityReload')}
        </Button>
      </Space>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ maxWidth: 720 }}>
          <Text strong>{t('superadmin.delegatedVisibilityViewer')}</Text>
          <Select
            showSearch
            allowClear
            placeholder={t('superadmin.selectUsers')}
            optionFilterProp="label"
            style={{ width: '100%', marginTop: 8 }}
            loading={loadingUsers}
            options={viewerOptions}
            value={viewerId}
            onChange={onViewerChange}
          />
        </div>

        <div style={{ maxWidth: 720 }}>
          <Text strong>{t('superadmin.delegatedVisibilityVisibleUsers')}</Text>
          <Select
            mode="multiple"
            showSearch
            allowClear
            disabled={!viewerId}
            placeholder={viewerId ? t('superadmin.selectUsers') : t('superadmin.delegatedVisibilitySelectViewer')}
            optionFilterProp="label"
            style={{ width: '100%', marginTop: 8 }}
            loading={loadingUsers}
            options={visibleOptions}
            value={visibleUserIds}
            onChange={setVisibleUserIds}
            maxTagCount="responsive"
          />
        </div>

        <div>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={save} disabled={!viewerId}>
            {t('superadmin.delegatedVisibilitySave')}
          </Button>
        </div>
      </Space>

      <Divider />

      <Text strong style={{ display: 'block', marginBottom: 12 }}>
        {t('superadmin.delegatedVisibilitySummary')}
      </Text>
      <ResponsiveTable
        size="small"
        rowKey={(row) => row.viewer?.id}
        loading={loadingGrants}
        dataSource={grouped}
        columns={summaryColumns}
        locale={{ emptyText: isAr ? 'لا توجد تعيينات' : 'No assignments yet' }}
        pagination={grouped.length > 12 ? { pageSize: 12 } : false}
      />
    </Card>
  );
}
