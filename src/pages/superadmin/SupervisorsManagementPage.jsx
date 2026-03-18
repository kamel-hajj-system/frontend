import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Collapse, Input, message, Select, Space, Switch, Tag, Typography, Empty } from 'antd';
import { TeamOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSuperAdminSupervisorsTree, getUsers, updateUser } from '../../api/users';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { ROLES, USER_TYPES } from '../../utils/constants';

const { Title, Text } = Typography;

function renderPersonName(isAr, u) {
  const primary = (isAr ? u.fullNameAr : u.fullName) || u.fullName || u.fullNameAr || u.email || '';
  const secondary = (isAr ? u.fullName : u.fullNameAr) || null;
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{primary}</div>
      {secondary ? <div style={{ fontSize: 12, opacity: 0.7 }}>{secondary}</div> : null}
    </div>
  );
}

export function SupervisorsManagementPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});
  const [q, setQ] = useState('');
  const [data, setData] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const fetchSupervisors = useCallback(async () => {
    try {
      const res = await getUsers({ limit: 500, userType: USER_TYPES.COMPANY, role: 'Supervisor' });
      setSupervisors(res.data || []);
    } catch {
      setSupervisors([]);
    }
  }, []);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminSupervisorsTree({ q, includeInactive: true });
      setData(res.data || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [q, isAr]);

  useEffect(() => {
    fetchSupervisors();
    fetchTree();
  }, [fetchSupervisors, fetchTree]);

  const supervisorOptions = useMemo(
    () =>
      supervisors.map((s) => ({
        value: s.id,
        label: `${s.fullName}${s.fullNameAr ? ` — ${s.fullNameAr}` : ''} (${s.email})`,
      })),
    [supervisors]
  );

  const saveEmployeePatch = async (empId, patch) => {
    setSavingMap((m) => ({ ...m, [empId]: true }));
    try {
      await updateUser(empId, patch);
      message.success(isAr ? 'تم التحديث' : 'Updated');
      fetchTree();
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setSavingMap((m) => ({ ...m, [empId]: false }));
    }
  };

  const items = useMemo(() => {
    return (data || []).map((s) => {
      const employees = Array.isArray(s.employees) ? s.employees : [];
      const loc = s.shiftLocation;
      const locLabel = loc ? (isAr ? (loc.locationAr || loc.name) : loc.name) : '—';

      const columns = [
        {
          title: isAr ? 'الموظف' : 'Employee',
          key: 'name',
          render: (_, r) => renderPersonName(isAr, r),
        },
        { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
        {
          title: isAr ? 'الدور' : 'Role',
          key: 'role',
          render: (_, r) => (
            <Select
              value={r.role}
              style={{ width: 140 }}
              options={[
                { value: 'EmpRead', label: 'EmpRead' },
                { value: 'EmpManage', label: 'EmpManage' },
                { value: 'Supervisor', label: 'Supervisor' },
              ]}
              onChange={(value) => saveEmployeePatch(r.id, { role: value })}
              disabled={!!savingMap[r.id] || r.isSuperAdmin}
            />
          ),
        },
        {
          title: isAr ? 'تحت مشرف' : 'Supervisor',
          key: 'supervisor',
          render: (_, r) => (
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder={isAr ? 'اختر مشرفاً' : 'Select supervisor'}
              style={{ width: 260 }}
              value={r.supervisorId || undefined}
              options={supervisorOptions}
              onChange={(value) => saveEmployeePatch(r.id, { supervisorId: value || null })}
              disabled={!!savingMap[r.id] || r.isSuperAdmin}
            />
          ),
        },
        {
          title: isAr ? 'نشط' : 'Active',
          key: 'isActive',
          render: (_, r) => (
            <Switch
              checked={!!r.isActive}
              onChange={(checked) => saveEmployeePatch(r.id, { isActive: checked })}
              disabled={!!savingMap[r.id] || r.isSuperAdmin}
            />
          ),
        },
        {
          title: isAr ? 'حفظ' : 'Save',
          key: 'save',
          render: (_, r) => (
            <Button
              icon={<SaveOutlined />}
              size="small"
              onClick={() => fetchTree()}
              loading={!!savingMap[r.id]}
            >
              {isAr ? 'تحديث' : 'Refresh'}
            </Button>
          ),
        },
      ];

      const header = (
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            {renderPersonName(isAr, s)}
            <Tag>{s.role}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isAr ? 'الموقع' : 'Location'}: {locLabel}
            </Text>
          </Space>
          <Space>
            <Badge count={employees.length} showZero color="#1677ff" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isAr ? 'موظف' : 'employee(s)'}
            </Text>
          </Space>
        </Space>
      );

      return {
        key: s.id,
        label: header,
        children:
          employees.length === 0 ? (
            <Empty description={isAr ? 'لا يوجد موظفون تحت هذا المشرف' : 'No employees under this supervisor'} />
          ) : (
            <ResponsiveTable rowKey="id" columns={columns} dataSource={employees} pagination={false} />
          ),
      };
    });
  }, [data, isAr, supervisorOptions, savingMap, fetchTree]);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <TeamOutlined /> {isAr ? 'المشرفون والموظفون (إدارة)' : 'Supervisors & Employees (Management)'}
      </Title>

      <Card
        style={{ marginBottom: 16 }}
        bodyStyle={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={fetchTree}
          allowClear
          style={{ width: 320, maxWidth: '100%' }}
          placeholder={isAr ? 'بحث: اسم/إيميل/جوال' : 'Search: name/email/phone'}
        />
        <Button icon={<ReloadOutlined />} onClick={fetchTree} loading={loading}>
          {isAr ? 'تحديث' : 'Refresh'}
        </Button>
        <Tag color="blue">
          {isAr ? 'المشرفون' : 'Supervisors'}: {(data || []).length}
        </Tag>
        <Tag color="purple">
          {isAr ? 'الإجمالي' : 'Total employees'}:{' '}
          {(data || []).reduce((sum, s) => sum + (Array.isArray(s.employees) ? s.employees.length : 0), 0)}
        </Tag>
        <Tag>
          {isAr ? 'الأدوار' : 'Roles'}: {ROLES.join(' / ')}
        </Tag>
      </Card>

      <Card>
        <Collapse items={items} accordion bordered={false} />
      </Card>
    </div>
  );
}

