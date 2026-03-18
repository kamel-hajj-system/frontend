import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Space, Select, Button, Input, Tag, message } from 'antd';
import { TeamOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocations } from '../../api/locations';
import { getUsers, bulkAssignSupervisor } from '../../api/users';
import { ROLES, USER_TYPES, ROUTES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

export function AssignSupervisorPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const [q, setQ] = useState('');
  const [locationId, setLocationId] = useState(undefined);
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [isActive, setIsActive] = useState(undefined);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(undefined);
  const [setRole, setSetRole] = useState(undefined); // optional bulk role set
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  const fetchSupervisors = useCallback(async () => {
    try {
      const res = await getUsers({ limit: 500, userType: USER_TYPES.COMPANY, role: 'Supervisor' });
      setSupervisors(res.data || []);
    } catch {
      setSupervisors([]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        limit: 500,
        userType: USER_TYPES.COMPANY,
        q,
        locationId,
        role: roleFilter,
        isActive,
      });
      setUsers(res.data || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [isAr, q, locationId, roleFilter, isActive]);

  useEffect(() => {
    fetchSupervisors();
    fetchUsers();
  }, [fetchSupervisors, fetchUsers]);

  const supervisorOptions = useMemo(
    () =>
      supervisors.map((s) => ({
        value: s.id,
        label: `${s.fullName}${s.fullNameAr ? ` — ${s.fullNameAr}` : ''} (${s.email})`,
      })),
    [supervisors]
  );

  const locationOptions = useMemo(
    () =>
      locations.map((l) => ({
        value: l.id,
        label: isAr ? (l.locationAr || l.name) : l.name,
      })),
    [locations, isAr]
  );

  const columns = [
    { title: isAr ? 'الاسم' : 'Name', dataIndex: 'fullName', key: 'fullName' },
    { title: isAr ? 'البريد' : 'Email', dataIndex: 'email', key: 'email' },
    {
      title: isAr ? 'الدور' : 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: isAr ? 'الموقع' : 'Location',
      key: 'location',
      render: (_, r) => {
        const loc = r.shiftLocation;
        if (!loc) return '—';
        return isAr ? (loc.locationAr || loc.name) : loc.name;
      },
    },
    {
      title: isAr ? 'معرف المشرف' : 'Supervisor ID',
      dataIndex: 'supervisorId',
      key: 'supervisorId',
      render: (v) => (v ? `${String(v).slice(0, 8)}…` : '—'),
    },
    {
      title: isAr ? 'نشط' : 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) =>
        v ? <Tag color="success">{isAr ? 'نعم' : 'Yes'}</Tag> : <Tag color="error">{isAr ? 'لا' : 'No'}</Tag>,
    },
  ];

  const apply = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(isAr ? 'اختر مستخدمين أولاً' : 'Select users first');
      return;
    }
    if (!selectedSupervisorId) {
      message.warning(isAr ? 'اختر مشرفاً أولاً' : 'Select a supervisor first');
      return;
    }

    setSaving(true);
    try {
      await bulkAssignSupervisor({
        userIds: selectedRowKeys,
        supervisorId: selectedSupervisorId,
        role: setRole || undefined,
      });
      message.success(isAr ? 'تم التحديث' : 'Updated');
      setSelectedRowKeys([]);
      fetchUsers();
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  const clearSupervisor = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(isAr ? 'اختر مستخدمين أولاً' : 'Select users first');
      return;
    }
    setSaving(true);
    try {
      await bulkAssignSupervisor({
        userIds: selectedRowKeys,
        supervisorId: null,
        role: setRole || undefined,
      });
      message.success(isAr ? 'تم التحديث' : 'Updated');
      setSelectedRowKeys([]);
      fetchUsers();
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <TeamOutlined />
          <span>{isAr ? 'تعيين المستخدمين تحت مشرف' : 'Assign users under supervisor'}</span>
        </Space>
      }
      extra={
        <Space wrap>
          <Button onClick={() => navigate(ROUTES.SUPER_ADMIN_DASHBOARD)}>{isAr ? 'رجوع' : 'Back'}</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
            {isAr ? 'تحديث' : 'Refresh'}
          </Button>
        </Space>
      }
    >
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          style={{ width: 260 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={fetchUsers}
          placeholder={isAr ? 'بحث بالاسم/الإيميل/الجوال' : 'Search name/email/phone'}
          allowClear
        />

        <Select
          allowClear
          style={{ width: 240 }}
          placeholder={isAr ? 'كل المواقع' : 'All locations'}
          value={locationId}
          onChange={setLocationId}
          options={locationOptions}
        />

        <Select
          allowClear
          style={{ width: 180 }}
          placeholder={isAr ? 'كل الأدوار' : 'All roles'}
          value={roleFilter}
          onChange={setRoleFilter}
        >
          {ROLES.map((r) => (
            <Option key={r} value={r}>
              {r}
            </Option>
          ))}
        </Select>

        <Select
          allowClear
          style={{ width: 160 }}
          placeholder={isAr ? 'نشط؟' : 'Active?'}
          value={isActive}
          onChange={setIsActive}
          options={[
            { value: true, label: isAr ? 'نعم' : 'Yes' },
            { value: false, label: isAr ? 'لا' : 'No' },
          ]}
        />

        <Button onClick={fetchUsers}>{isAr ? 'بحث' : 'Search'}</Button>
      </Space>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          showSearch
          allowClear
          style={{ width: 420 }}
          placeholder={isAr ? 'اختر المشرف' : 'Select supervisor'}
          optionFilterProp="label"
          value={selectedSupervisorId}
          onChange={setSelectedSupervisorId}
          options={supervisorOptions}
        />

        <Select
          allowClear
          style={{ width: 220 }}
          placeholder={isAr ? 'تعيين الدور (اختياري)' : 'Set role (optional)'}
          value={setRole}
          onChange={setSetRole}
          options={[
            { value: 'EmpRead', label: 'EmpRead' },
            { value: 'EmpManage', label: 'EmpManage' },
          ]}
        />

        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={apply}>
          {isAr ? 'تعيين تحت المشرف' : 'Assign under supervisor'}
        </Button>

        <Button danger loading={saving} onClick={clearSupervisor}>
          {isAr ? 'إزالة المشرف' : 'Clear supervisor'}
        </Button>
      </Space>

      <ResponsiveTable
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={users}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />
    </Card>
  );
}

