import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserAddOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getServiceCenters,
  createServiceCenter,
  updateServiceCenter,
  deleteServiceCenter,
  getServiceCenterUsers,
  getPilgrimNationalities,
  syncAllPilgrimNationalityArrivingTotals,
  getPilgrimNationalityOverview,
  createPilgrimNationality,
  updatePilgrimNationality,
  deletePilgrimNationality,
} from '../../api/serviceCenters';
import { getUsers, updateUser } from '../../api/users';
import { USER_TYPES } from '../../utils/constants';

const { Text } = Typography;

function allocatedPilgrimsFromCenter(record) {
  return (record?.nationalities || []).reduce((s, l) => s + (l.pilgrimsCount ?? 0), 0);
}

/** Caps for one nationality row at the current service center (uses catalog aggregates + DB snapshot). */
function getNationalityRowCaps(natId, editingCenter, catalogEntry) {
  if (!natId || !catalogEntry) {
    return { maxHere: null, atOtherCenters: 0 };
  }
  const globalAlloc = catalogEntry.allocatedAcrossCenters ?? 0;
  const dbAtThis =
    editingCenter?.nationalities?.find((l) => l.pilgrimNationalityId === natId)?.pilgrimsCount ?? 0;
  const atOtherCenters = Math.max(0, globalAlloc - dbAtThis);
  const total = catalogEntry.totalPilgrimsCount;
  const maxHere =
    total != null && Number.isFinite(Number(total)) ? Math.max(0, Number(total) - atOtherCenters) : null;
  return { maxHere, atOtherCenters };
}

function NationalityRowHint({ rowName, watchedRows, nationalityById, editingCenter, t, isAr }) {
  const nid = watchedRows?.[rowName]?.pilgrimNationalityId;
  const meta = nid ? nationalityById[nid] : null;
  if (!nid || !meta) return null;
  const { maxHere, atOtherCenters } = getNationalityRowCaps(nid, editingCenter, meta);
  const total = meta.totalPilgrimsCount;
  const totalArr = meta.totalArrivingPilgrimsCount;
  return (
    <div style={{ width: '100%', marginBottom: 12, marginTop: -2 }} dir={isAr ? 'rtl' : 'ltr'}>
      <Typography.Text strong style={{ fontSize: 12 }}>
        {t('superadmin.scNatHintTitle')}
      </Typography.Text>
      <ul
        style={{
          margin: '4px 0 0',
          paddingInlineStart: 20,
          fontSize: 12,
          color: 'rgba(0,0,0,0.65)',
        }}
      >
        <li>
          {t('superadmin.scNatHintTotal')}: {total != null && total !== '' ? total : '—'}
        </li>
        <li>
          {t('superadmin.scNatHintArriving')}: {totalArr != null && totalArr !== '' ? totalArr : '—'}
        </li>
        <li>
          {t('superadmin.scNatHintOtherCenters')}: {atOtherCenters}
        </li>
        <li>
          {t('superadmin.scNatHintMaxHere')}: {maxHere != null ? maxHere : t('superadmin.scNatHintNoCap')}
        </li>
      </ul>
    </div>
  );
}

export function ServiceCentersPage() {
  const { t, lang } = useLanguage();
  const isAr = lang === 'ar';

  const [centers, setCenters] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [loadingNat, setLoadingNat] = useState(true);

  const [centerModalOpen, setCenterModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [centerForm] = Form.useForm();
  const watchedCenterCode = Form.useWatch('code', centerForm);
  const [centerSaving, setCenterSaving] = useState(false);

  const derivedCenterNames = (() => {
    const c = String(watchedCenterCode ?? '').trim();
    if (!c) return { en: '—', ar: '—' };
    return { en: `Service Center ${c}`, ar: `مركز الخدمة ${c}` };
  })();

  const watchedCenterNatRows = Form.useWatch('nationalities', centerForm) || [];
  const nationalityById = useMemo(
    () => Object.fromEntries((nationalities || []).map((n) => [n.id, n])),
    [nationalities]
  );

  const [usersModalCenter, setUsersModalCenter] = useState(null);
  const [centerUsers, setCenterUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [assignUserId, setAssignUserId] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const [natModalOpen, setNatModalOpen] = useState(false);
  const [editingNat, setEditingNat] = useState(null);
  const [natForm] = Form.useForm();
  const [natSaving, setNatSaving] = useState(false);
  const [syncingNatTotals, setSyncingNatTotals] = useState(false);

  const [natOverviewOpen, setNatOverviewOpen] = useState(false);
  const [natOverviewLoading, setNatOverviewLoading] = useState(false);
  const [natOverview, setNatOverview] = useState(null);

  const fetchCenters = useCallback(() => {
    setLoadingCenters(true);
    getServiceCenters()
      .then(setCenters)
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoadingCenters(false));
  }, [t]);

  const fetchNationalities = useCallback(() => {
    setLoadingNat(true);
    getPilgrimNationalities()
      .then(setNationalities)
      .catch(() => message.error(t('common.error')))
      .finally(() => setLoadingNat(false));
  }, [t]);

  useEffect(() => {
    fetchCenters();
    fetchNationalities();
  }, [fetchCenters, fetchNationalities]);

  const nationalityOptions = nationalities.map((n) => ({
    value: n.id,
    label: isAr ? (n.nameAr || n.name) : n.name,
  }));

  const openCreateCenter = () => {
    setEditingCenter(null);
    centerForm.resetFields();
    centerForm.setFieldsValue({
      code: '',
      presidentName: '',
      vicePresidentName: '',
      maxCapacity: null,
      nationalities: [],
    });
    setCenterModalOpen(true);
  };

  const openEditCenter = (record) => {
    setEditingCenter(record);
    centerForm.setFieldsValue({
      code: record.code || '',
      presidentName: record.presidentName || '',
      vicePresidentName: record.vicePresidentName || '',
      maxCapacity: record.maxCapacity ?? null,
      nationalities: (record.nationalities || []).map((l) => ({
        pilgrimNationalityId: l.pilgrimNationalityId,
        pilgrimsCount: l.pilgrimsCount ?? 0,
        arrivingPilgrimsCount: l.arrivingPilgrimsCount ?? 0,
      })),
    });
    setCenterModalOpen(true);
  };

  const submitCenter = async () => {
    try {
      const values = await centerForm.validateFields();
      setCenterSaving(true);
      const natRows = (values.nationalities || [])
        .filter((r) => r?.pilgrimNationalityId)
        .map((r) => ({
          pilgrimNationalityId: r.pilgrimNationalityId,
          pilgrimsCount: r.pilgrimsCount ?? 0,
          arrivingPilgrimsCount: r.arrivingPilgrimsCount ?? 0,
        }));

      const payload = {
        code: String(values.code || '').trim(),
        presidentName: values.presidentName?.trim() || null,
        vicePresidentName: values.vicePresidentName?.trim() || null,
        maxCapacity: values.maxCapacity ?? null,
        nationalities: natRows,
      };

      if (editingCenter) {
        await updateServiceCenter(editingCenter.id, payload);
        message.success(t('superadmin.updateSuccess'));
      } else {
        await createServiceCenter(payload);
        message.success(t('superadmin.createSuccess'));
      }
      setCenterModalOpen(false);
      fetchCenters();
    } catch (err) {
      if (err?.errorFields) return;
      if (
        err?.apiCode === 'CAPACITY_EXCEEDED' &&
        err?.details &&
        typeof err.details === 'object' &&
        !Array.isArray(err.details) &&
        err.details.allocatedSum != null &&
        err.details.maxCapacity != null
      ) {
        message.error(
          t('superadmin.scCapacityExceeded', {
            allocated: err.details.allocatedSum,
            max: err.details.maxCapacity,
          })
        );
        return;
      }
      if (err?.apiCode === 'DUPLICATE_NATIONALITY_IN_CENTER') {
        message.error(t('superadmin.scDuplicateNationalityRow'));
        return;
      }
      if (err?.apiCode === 'ARRIVING_EXCEEDS_ALLOCATED_ROW') {
        message.error(t('superadmin.scArrivingExceedsAllocatedRow'));
        return;
      }
      if (err?.apiCode === 'NATIONALITY_ALLOCATION_EXCEEDED' && err?.details) {
        message.error(
          t('superadmin.scNationalityAllocationExceededMsg', {
            name: err.details.nationalityName,
            total: err.details.nationalTotal,
            others: err.details.allocatedAtOtherCenters,
            requested: err.details.requestedForThisCenter,
          })
        );
        return;
      }
      message.error(err?.message || t('common.error'));
    } finally {
      setCenterSaving(false);
    }
  };

  const handleDeleteCenter = async (id) => {
    try {
      await deleteServiceCenter(id);
      message.success(t('superadmin.deleteSuccess'));
      fetchCenters();
    } catch (err) {
      message.error(err?.message || t('common.error'));
    }
  };

  const openUsersModal = async (center) => {
    setUsersModalCenter(center);
    setLoadingUsers(true);
    try {
      const users = await getServiceCenterUsers(center.id);
      setCenterUsers(users);
    } catch {
      message.error(t('common.error'));
      setCenterUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const refreshUsersModal = async () => {
    if (!usersModalCenter) return;
    setLoadingUsers(true);
    try {
      const users = await getServiceCenterUsers(usersModalCenter.id);
      setCenterUsers(users);
    } finally {
      setLoadingUsers(false);
    }
  };

  const openAssign = async () => {
    setAssignUserId(null);
    setAssignOpen(true);
    try {
      const res = await getUsers({ limit: 500 });
      setAllUsers(res?.data || []);
    } catch {
      message.error(t('common.error'));
      setAllUsers([]);
    }
  };

  const submitAssign = async () => {
    if (!assignUserId || !usersModalCenter) return;
    setAssignLoading(true);
    try {
      await updateUser(assignUserId, {
        serviceCenterId: usersModalCenter.id,
        userType: USER_TYPES.SERVICE_CENTER,
      });
      message.success(t('superadmin.scAssignSuccess'));
      setAssignOpen(false);
      await refreshUsersModal();
      fetchCenters();
    } catch (err) {
      message.error(err?.message || t('common.error'));
    } finally {
      setAssignLoading(false);
    }
  };

  const unassignUser = async (userId) => {
    try {
      await updateUser(userId, { serviceCenterId: null });
      message.success(t('superadmin.scUnassignSuccess'));
      await refreshUsersModal();
      fetchCenters();
    } catch (err) {
      message.error(err?.message || t('common.error'));
    }
  };

  const openCreateNat = () => {
    setEditingNat(null);
    natForm.resetFields();
    natForm.setFieldsValue({
      name: '',
      nameAr: '',
      code: '',
      flagCode: '',
      notes: '',
      totalPilgrimsCount: null,
      totalArrivingPilgrimsCount: null,
    });
    setNatModalOpen(true);
  };

  const openEditNat = (row) => {
    setEditingNat(row);
    natForm.setFieldsValue({
      name: row.name,
      nameAr: row.nameAr || '',
      code: row.code || '',
      flagCode: row.flagCode || '',
      notes: row.notes || '',
      totalPilgrimsCount: row.totalPilgrimsCount ?? null,
      totalArrivingPilgrimsCount: row.totalArrivingPilgrimsCount ?? null,
    });
    setNatModalOpen(true);
  };

  const openNatOverview = async (row) => {
    setNatOverview(null);
    setNatOverviewOpen(true);
    setNatOverviewLoading(true);
    try {
      const data = await getPilgrimNationalityOverview(row.id);
      setNatOverview(data);
    } catch {
      message.error(t('common.error'));
      setNatOverviewOpen(false);
    } finally {
      setNatOverviewLoading(false);
    }
  };

  const submitNat = async () => {
    try {
      const values = await natForm.validateFields();
      setNatSaving(true);
      const payload = {
        name: values.name.trim(),
        nameAr: values.nameAr?.trim() || null,
        code: values.code?.trim() || null,
        flagCode: values.flagCode?.trim() || null,
        notes: values.notes?.trim() || null,
        totalPilgrimsCount: values.totalPilgrimsCount ?? null,
        totalArrivingPilgrimsCount: values.totalArrivingPilgrimsCount ?? null,
      };
      if (editingNat) {
        await updatePilgrimNationality(editingNat.id, payload);
        message.success(t('superadmin.updateSuccess'));
      } else {
        await createPilgrimNationality(payload);
        message.success(t('superadmin.createSuccess'));
      }
      setNatModalOpen(false);
      fetchNationalities();
    } catch (err) {
      if (err?.errorFields) return;
      if (err?.apiCode === 'TOTAL_ARRIVING_EXCEEDS_TOTAL_PILGRIMS') {
        message.error(t('superadmin.natArrivingExceedsTotalField'));
        return;
      }
      if (err?.apiCode === 'NATIONALITY_TOTAL_BELOW_ALLOCATED' && err?.details) {
        message.error(
          t('superadmin.natTotalBelowAllocatedField', {
            allocated: err.details.allocatedAcrossCenters,
          })
        );
        return;
      }
      message.error(err?.message || t('common.error'));
    } finally {
      setNatSaving(false);
    }
  };

  const handleSyncNatArrivingTotals = async () => {
    setSyncingNatTotals(true);
    try {
      await syncAllPilgrimNationalityArrivingTotals();
      message.success(t('superadmin.natSyncArrivingSuccess'));
      fetchNationalities();
    } catch (err) {
      message.error(err?.message || t('common.error'));
    } finally {
      setSyncingNatTotals(false);
    }
  };

  const handleDeleteNat = async (id) => {
    try {
      await deletePilgrimNationality(id);
      message.success(t('superadmin.deleteSuccess'));
      fetchNationalities();
    } catch (err) {
      message.error(err?.message || t('common.error'));
    }
  };

  const assignableUserOptions = (allUsers || [])
    .filter((u) => !u.isSuperAdmin && u.userType !== 'SuperAdmin')
    .map((u) => ({
      value: u.id,
      label: `${u.email} — ${u.fullName || ''} (${u.userType})`,
    }));

  const centerColumns = [
    {
      title: t('superadmin.scCenterCode'),
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (v) => <Text strong>{v || '—'}</Text>,
    },
    {
      title: t('superadmin.scName'),
      key: 'displayName',
      render: (_, r) =>
        (isAr ? r.nameAr || r.name : r.name) || '—',
    },
    { title: t('superadmin.scPresident'), dataIndex: 'presidentName', key: 'presidentName', render: (v) => v || '—' },
    { title: t('superadmin.scVicePresident'), dataIndex: 'vicePresidentName', key: 'vicePresidentName', render: (v) => v || '—' },
    {
      title: t('superadmin.scPilgrims'),
      key: 'pilgrims',
      render: (_, r) => (
        <span>
          {allocatedPilgrimsFromCenter(r)} / {r.maxCapacity ?? '—'}
        </span>
      ),
    },
    {
      title: t('superadmin.scNationalities'),
      key: 'nat',
      width: 220,
      render: (_, r) => {
        const links = r.nationalities || [];
        if (!links.length) return '—';
        return (
          <Space wrap size={4}>
            {links.slice(0, 3).map((l) => (
              <Tag key={l.id}>
                {(l.nationality && (isAr ? l.nationality.nameAr || l.nationality.name : l.nationality.name)) || '—'}:{' '}
                {l.pilgrimsCount}
              </Tag>
            ))}
            {links.length > 3 ? <Tag>+{links.length - 3}</Tag> : null}
          </Space>
        );
      },
    },
    {
      title: t('superadmin.scUserCount'),
      dataIndex: 'userCount',
      key: 'userCount',
      width: 90,
    },
    {
      title: t('superadmin.actions'),
      key: 'actions',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space wrap>
          <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => openUsersModal(record)}>
            {t('superadmin.scUsers')}
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditCenter(record)}>
            {t('superadmin.edit')}
          </Button>
          <Popconfirm
            title={t('superadmin.scDeleteCenterConfirm')}
            onConfirm={() => handleDeleteCenter(record.id)}
            okText={t('superadmin.yes')}
            cancelText={t('superadmin.no')}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              {t('superadmin.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const natColumns = [
    { title: t('superadmin.scNatCode'), dataIndex: 'code', key: 'code', render: (v) => v || '—' },
    { title: t('superadmin.scNatFlagCode'), dataIndex: 'flagCode', key: 'flagCode', render: (v) => v || '—' },
    { title: t('superadmin.nameEn'), dataIndex: 'name', key: 'name' },
    { title: t('superadmin.nameAr'), dataIndex: 'nameAr', key: 'nameAr', render: (v) => v || '—' },
    {
      title: t('superadmin.natTotalPilgrims'),
      dataIndex: 'totalPilgrimsCount',
      key: 'totalPilgrimsCount',
      width: 110,
      render: (v) => (v != null ? v : '—'),
    },
    {
      title: t('superadmin.natTotalArriving'),
      dataIndex: 'totalArrivingPilgrimsCount',
      key: 'totalArrivingPilgrimsCount',
      width: 120,
      render: (v) => (v != null ? v : '—'),
    },
    {
      title: t('superadmin.actions'),
      key: 'a',
      width: 220,
      render: (_, row) => (
        <Space wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openNatOverview(row)}>
            {t('superadmin.natOverview')}
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditNat(row)}>
            {t('superadmin.edit')}
          </Button>
          <Popconfirm title={t('superadmin.scDeleteNatConfirm')} onConfirm={() => handleDeleteNat(row.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              {t('superadmin.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userColumns = [
    {
      title: isAr ? 'الاسم' : 'Name',
      key: 'n',
      render: (_, u) => (
        <div>
          <div>{u.fullName}</div>
          {u.fullNameAr && (
            <div style={{ fontSize: 12, color: '#888' }} dir="rtl">
              {u.fullNameAr}
            </div>
          )}
        </div>
      ),
    },
    { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
    { title: isAr ? 'النوع' : 'Type', dataIndex: 'userType', key: 'userType', render: (v) => <Tag>{v}</Tag> },
    {
      title: t('superadmin.actions'),
      key: 'a',
      render: (_, u) => (
        <Popconfirm title={t('superadmin.scUnassignConfirm')} onConfirm={() => unassignUser(u.id)}>
          <Button type="link" size="small" danger>
            {t('superadmin.scUnassign')}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="centers"
        items={[
          {
            key: 'centers',
            label: (
              <span>
                <TeamOutlined /> {t('superadmin.scCentersTab')}
              </span>
            ),
            children: (
              <Card
                title={t('superadmin.scCentersTitle')}
                extra={
                  <Space>
                    <Button icon={<ReloadOutlined />} onClick={fetchCenters}>
                      {isAr ? 'تحديث' : 'Refresh'}
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCenter}>
                      {t('superadmin.scAddCenter')}
                    </Button>
                  </Space>
                }
              >
                <Table
                  rowKey="id"
                  loading={loadingCenters}
                  columns={centerColumns}
                  dataSource={centers}
                  scroll={{ x: 960 }}
                  pagination={false}
                  locale={{ emptyText: t('superadmin.scNoCenters') }}
                />
              </Card>
            ),
          },
          {
            key: 'nationalities',
            label: t('superadmin.scNationalitiesTab'),
            children: (
              <Card
                title={t('superadmin.scNationalitiesTitle')}
                extra={
                  <Space wrap>
                    <Button icon={<ReloadOutlined />} onClick={fetchNationalities}>
                      {isAr ? 'تحديث' : 'Refresh'}
                    </Button>
                    <Button loading={syncingNatTotals} onClick={handleSyncNatArrivingTotals}>
                      {t('superadmin.natRecalcArriving')}
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateNat}>
                      {t('superadmin.scAddNationality')}
                    </Button>
                  </Space>
                }
              >
                <Table
                  rowKey="id"
                  loading={loadingNat}
                  columns={natColumns}
                  dataSource={nationalities}
                  pagination={false}
                  locale={{ emptyText: t('superadmin.scNoNationalities') }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={editingCenter ? t('superadmin.scEditCenter') : t('superadmin.scAddCenter')}
        open={centerModalOpen}
        onCancel={() => setCenterModalOpen(false)}
        onOk={submitCenter}
        confirmLoading={centerSaving}
        width={760}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        destroyOnClose
      >
        <Form form={centerForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label={t('superadmin.scCenterCode')}
            rules={[{ required: true, message: t('superadmin.scCenterCodeRequired') }]}
            extra={t('superadmin.scCenterCodeHint')}
          >
            <Input placeholder="110" />
          </Form.Item>
          {editingCenter && (
            <Form.Item label={t('superadmin.scInternalId')}>
              <Typography.Text type="secondary" copyable={{ text: editingCenter.id }}>
                {editingCenter.id}
              </Typography.Text>
            </Form.Item>
          )}
          <Form.Item
            label={t('superadmin.scName')}
            extra={isAr ? 'يُحدَّد تلقائياً من رمز المركز' : 'Set automatically from center code'}
          >
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Typography.Text>{derivedCenterNames.en}</Typography.Text>
              <Typography.Text dir="rtl" style={{ display: 'block' }}>
                {derivedCenterNames.ar}
              </Typography.Text>
            </Space>
          </Form.Item>
          <Form.Item name="presidentName" label={t('superadmin.scPresident')}>
            <Input />
          </Form.Item>
          <Form.Item name="vicePresidentName" label={t('superadmin.scVicePresident')}>
            <Input />
          </Form.Item>
          <Form.Item
            name="maxCapacity"
            label={t('superadmin.scMaxCapacity')}
            extra={t('superadmin.scCapacitySumHint')}
          >
            <InputNumber min={0} style={{ width: 200 }} />
          </Form.Item>

          <Typography.Title level={5}>{t('superadmin.scNationalityBreakdown')}</Typography.Title>
          <Form.List name="nationalities">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  const rowNatId = watchedCenterNatRows?.[name]?.pilgrimNationalityId;
                  const rowCatalog = rowNatId ? nationalityById[rowNatId] : null;
                  const { maxHere } = getNationalityRowCaps(rowNatId, editingCenter, rowCatalog);
                  return (
                    <div key={key} style={{ width: '100%', marginBottom: 8 }}>
                      <Space align="baseline" style={{ display: 'flex', flexWrap: 'wrap' }} wrap>
                        <Form.Item
                          {...restField}
                          name={[name, 'pilgrimNationalityId']}
                          rules={[
                            { required: true, message: t('superadmin.scSelectNationality') },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const rows = getFieldValue('nationalities') || [];
                                const same = rows.filter((r) => r?.pilgrimNationalityId === value);
                                if (value && same.length > 1) {
                                  return Promise.reject(new Error(t('superadmin.scDuplicateNationalityRow')));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <Select
                            placeholder={t('superadmin.scSelectNationality')}
                            options={nationalityOptions}
                            style={{ minWidth: 200 }}
                            showSearch
                            optionFilterProp="label"
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'pilgrimsCount']}
                          initialValue={0}
                          dependencies={[['nationalities', name, 'pilgrimNationalityId']]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, v) {
                                const nid = getFieldValue(['nationalities', name, 'pilgrimNationalityId']);
                                const cat = nid ? nationalityById[nid] : null;
                                const { maxHere: cap } = getNationalityRowCaps(nid, editingCenter, cat);
                                if (cap != null && v != null && Number(v) > cap) {
                                  return Promise.reject(
                                    new Error(t('superadmin.scAllocatedExceedsNationalTotal', { max: cap }))
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            min={0}
                            max={maxHere != null ? maxHere : undefined}
                            placeholder={t('superadmin.scPilgrimsCount')}
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'arrivingPilgrimsCount']}
                          initialValue={0}
                          dependencies={[['nationalities', name, 'pilgrimsCount']]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, v) {
                                const allocated = getFieldValue(['nationalities', name, 'pilgrimsCount']);
                                if (v != null && allocated != null && Number(v) > Number(allocated)) {
                                  return Promise.reject(
                                    new Error(t('superadmin.scArrivingExceedsAllocatedRow'))
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <InputNumber min={0} placeholder={t('superadmin.scArrivingCount')} style={{ width: 120 }} />
                        </Form.Item>
                        <Button type="link" danger onClick={() => remove(name)}>
                          {t('superadmin.delete')}
                        </Button>
                      </Space>
                      <NationalityRowHint
                        rowName={name}
                        watchedRows={watchedCenterNatRows}
                        nationalityById={nationalityById}
                        editingCenter={editingCenter}
                        t={t}
                        isAr={isAr}
                      />
                    </div>
                  );
                })}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('superadmin.scAddNatRow')}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title={
          usersModalCenter
            ? `${t('superadmin.scUsers')} — [${usersModalCenter.code}] ${(isAr ? usersModalCenter.nameAr || usersModalCenter.name : usersModalCenter.name) || ''}`.trim()
            : ''
        }
        open={!!usersModalCenter}
        onCancel={() => {
          setUsersModalCenter(null);
          setCenterUsers([]);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<UserAddOutlined />} onClick={openAssign}>
            {t('superadmin.scAssignUser')}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refreshUsersModal}>
            {isAr ? 'تحديث' : 'Refresh'}
          </Button>
        </Space>
        <Table
          rowKey="id"
          size="small"
          loading={loadingUsers}
          columns={userColumns}
          dataSource={centerUsers}
          pagination={false}
          locale={{ emptyText: t('superadmin.scNoUsersInCenter') }}
        />
      </Modal>

      <Modal
        title={t('superadmin.scAssignUser')}
        open={assignOpen}
        onCancel={() => setAssignOpen(false)}
        onOk={submitAssign}
        confirmLoading={assignLoading}
        okText={t('common.save')}
        destroyOnClose
      >
        <Select
          showSearch
          style={{ width: '100%', marginTop: 16 }}
          placeholder={t('superadmin.scSelectUser')}
          options={assignableUserOptions}
          value={assignUserId}
          onChange={setAssignUserId}
          optionFilterProp="label"
        />
        <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
          {t('superadmin.scAssignHint')}
        </Typography.Paragraph>
      </Modal>

      <Modal
        title={editingNat ? t('superadmin.scEditNationality') : t('superadmin.scAddNationality')}
        open={natModalOpen}
        onCancel={() => setNatModalOpen(false)}
        onOk={submitNat}
        confirmLoading={natSaving}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        destroyOnClose
      >
        <Form form={natForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label={t('superadmin.scNatCode')} extra={t('superadmin.scNatCodeHint')}>
            <Input allowClear placeholder={t('superadmin.scNatCodePlaceholder')} />
          </Form.Item>
          <Form.Item
            name="flagCode"
            label={t('superadmin.scNatFlagCode')}
            extra={t('superadmin.scNatFlagCodeHint')}
          >
            <Input allowClear placeholder="SA" maxLength={32} />
          </Form.Item>
          <Form.Item name="name" label={t('superadmin.nameEn')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nameAr" label={t('superadmin.nameAr')}>
            <Input dir="rtl" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="totalPilgrimsCount"
                label={t('superadmin.natTotalPilgrims')}
                dependencies={['totalArrivingPilgrimsCount']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, v) {
                      const arr = getFieldValue('totalArrivingPilgrimsCount');
                      if (v != null && arr != null && Number(arr) > Number(v)) {
                        return Promise.reject(new Error(t('superadmin.natArrivingExceedsTotalField')));
                      }
                      const minAlloc = editingNat?.allocatedAcrossCenters;
                      if (editingNat && minAlloc != null && v != null && Number(v) < Number(minAlloc)) {
                        return Promise.reject(
                          new Error(t('superadmin.natTotalBelowAllocatedField', { allocated: minAlloc }))
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="300" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="totalArrivingPilgrimsCount"
                label={t('superadmin.natTotalArriving')}
                dependencies={['totalPilgrimsCount']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, v) {
                      const total = getFieldValue('totalPilgrimsCount');
                      if (total != null && v != null && Number(v) > Number(total)) {
                        return Promise.reject(new Error(t('superadmin.natArrivingExceedsTotalField')));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
            {t('superadmin.natTotalsHint')}
          </Typography.Paragraph>
          <Form.Item name="notes" label={t('superadmin.description')}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={
          natOverview?.nationality
            ? `${t('superadmin.natOverviewTitle')}: ${isAr ? natOverview.nationality.nameAr || natOverview.nationality.name : natOverview.nationality.name}`
            : t('superadmin.natOverviewTitle')
        }
        placement={isAr ? 'left' : 'right'}
        width={Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 24 : 720)}
        open={natOverviewOpen}
        onClose={() => {
          setNatOverviewOpen(false);
          setNatOverview(null);
        }}
        destroyOnClose
      >
        {natOverviewLoading && <Typography.Paragraph>{t('common.loading')}</Typography.Paragraph>}
        {!natOverviewLoading && natOverview && (
          <>
            <Typography.Title level={5}>{t('superadmin.natNationalTotals')}</Typography.Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Statistic title={t('superadmin.natTotalPilgrims')} value={natOverview.nationality.totalPilgrimsCount ?? '—'} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('superadmin.natTotalArriving')}
                  value={natOverview.nationality.totalArrivingPilgrimsCount ?? '—'}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title={t('superadmin.natCentersCount')} value={natOverview.aggregates.centerCount} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t('superadmin.natAllocatedInCenters')}
                  value={natOverview.aggregates.allocatedAcrossCenters}
                />
              </Col>
            </Row>
            {natOverview.nationality.totalPilgrimsCount != null &&
              natOverview.aggregates.allocatedAcrossCenters > natOverview.nationality.totalPilgrimsCount && (
                <Tag color="warning" style={{ marginBottom: 16 }}>
                  {t('superadmin.natAllocatedExceedsTotal', {
                    allocated: natOverview.aggregates.allocatedAcrossCenters,
                    total: natOverview.nationality.totalPilgrimsCount,
                  })}
                </Tag>
              )}
            <Typography.Title level={5}>{t('superadmin.natCentersSupporting')}</Typography.Title>
            <Typography.Paragraph type="secondary">
              {t('superadmin.natCentersSupportingHint')}
            </Typography.Paragraph>
            <Table
              size="small"
              rowKey="serviceCenterId"
              pagination={false}
              dataSource={natOverview.centers}
              locale={{ emptyText: t('superadmin.natNoCentersForNationality') }}
              columns={[
                {
                  title: t('superadmin.scCenterCode'),
                  dataIndex: 'centerCode',
                  key: 'cc',
                  render: (v) => <Text strong>{v || '—'}</Text>,
                },
                {
                  title: t('superadmin.scName'),
                  key: 'cn',
                  render: (_, row) =>
                    (isAr ? row.centerNameAr || row.centerName : row.centerName) || '—',
                },
                {
                  title: t('superadmin.natAllocatedAtCenter'),
                  dataIndex: 'allocatedPilgrims',
                  key: 'al',
                },
                {
                  title: t('superadmin.natArrivingAtCenter'),
                  dataIndex: 'arrivingPilgrims',
                  key: 'ar',
                },
                {
                  title: t('superadmin.natWaitingAtCenter'),
                  dataIndex: 'waitingPilgrims',
                  key: 'wa',
                  render: (v) => <Tag color={v > 0 ? 'processing' : 'default'}>{v}</Tag>,
                },
              ]}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Typography.Text type="secondary">
                  {t('superadmin.natFooterSums', {
                    alloc: natOverview.aggregates.allocatedAcrossCenters,
                    arr: natOverview.aggregates.arrivingAcrossCenters,
                    wait: natOverview.aggregates.waitingAcrossCenters,
                  })}
                </Typography.Text>
              </Col>
            </Row>
          </>
        )}
      </Drawer>
    </div>
  );
}
