import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Space, Select, Button, Tree, message, Tag } from 'antd';
import { SafetyOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { ResponsiveTable } from '../../components/common/ResponsiveTable';
import { getUsers } from '../../api/users';
import { getLocations } from '../../api/locations';
import { setAccessGrants, getAccessGrants } from '../../api/access';
import { ACCESS_TREE, USER_TYPES, ROUTES, ROLES } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

function buildTreeData(lang) {
  const isAr = lang === 'ar';
  const mapNode = (n) => ({
    key: n.key,
    title: isAr ? n.titleAr : n.titleEn,
    children: n.children ? n.children.map(mapNode) : undefined,
  });
  return ACCESS_TREE.map(mapNode);
}

function leafKeys(tree) {
  const keys = [];
  const walk = (n) => {
    if (!n.children || n.children.length === 0) keys.push(n.key);
    else n.children.forEach(walk);
  };
  tree.forEach(walk);
  return keys;
}

export function AccessControlPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState(undefined);
  const [role, setRole] = useState(undefined);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [saving, setSaving] = useState(false);

  const treeData = useMemo(() => buildTreeData(lang), [lang]);
  const allLeafKeys = useMemo(() => leafKeys(ACCESS_TREE), []);

  useEffect(() => {
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers({ limit: 500, userType: USER_TYPES.COMPANY, locationId, role });
      setUsers(res.data || []);
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setLoading(false);
    }
  }, [isAr, locationId, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const loadGrantsForSingleUser = useCallback(async (userId) => {
    try {
      const res = await getAccessGrants(userId);
      setCheckedKeys(res.codes || []);
    } catch {
      setCheckedKeys([]);
    }
  }, []);

  useEffect(() => {
    if (selectedRowKeys.length === 1) {
      loadGrantsForSingleUser(selectedRowKeys[0]);
    }
    if (selectedRowKeys.length !== 1) {
      setCheckedKeys([]);
    }
  }, [selectedRowKeys, loadGrantsForSingleUser]);

  const filteredUsers = users;

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
      title: isAr ? 'نشط' : 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v) => (v ? <Tag color="success">{isAr ? 'نعم' : 'Yes'}</Tag> : <Tag color="error">{isAr ? 'لا' : 'No'}</Tag>),
    },
  ];

  const onSave = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(isAr ? 'اختر مستخدمين أولاً' : 'Select users first');
      return;
    }
    const codes = (Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked || []).filter((k) => allLeafKeys.includes(k));
    setSaving(true);
    try {
      await setAccessGrants(selectedRowKeys, codes);
      message.success(isAr ? 'تم حفظ الصلاحيات' : 'Access saved');
    } catch (err) {
      message.error(err?.message || (isAr ? 'حدث خطأ' : 'Error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>{isAr ? 'التحكم في الوصول (الموديلات/الصفحات)' : 'Access Control (Modules/Pages)'}</span>
          </Space>
        }
        extra={
          <Space wrap>
            <Button onClick={() => navigate(ROUTES.SUPER_ADMIN_DASHBOARD)}>{isAr ? 'رجوع' : 'Back'}</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>{isAr ? 'تحديث' : 'Refresh'}</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>
              {isAr ? 'حفظ الوصول للمستخدمين المحددين' : 'Save access for selected users'}
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{isAr ? 'تصفية بالموقع' : 'Filter by location'}</div>
            <Select
              allowClear
              style={{ width: 260 }}
              placeholder={isAr ? 'كل المواقع' : 'All locations'}
              value={locationId}
              onChange={setLocationId}
              options={locations.map((l) => ({ value: l.id, label: isAr ? (l.locationAr || l.name) : l.name }))}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{isAr ? 'تصفية بالدور' : 'Filter by role'}</div>
            <Select
              allowClear
              style={{ width: 220 }}
              placeholder={isAr ? 'كل الأدوار' : 'All roles'}
              value={role}
              onChange={setRole}
            >
              {ROLES.map((r) => (
                <Option key={r} value={r}>{r}</Option>
              ))}
            </Select>
          </div>
        </Space>

        <ResponsiveTable
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredUsers}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </Card>

      <Card
        title={isAr ? 'الوصول (اختر الموديلات/الصفحات)' : 'Access (select modules/pages)'}
        extra={<span style={{ opacity: 0.7 }}>{isAr ? 'يتم الحفظ كمشاهدة، والأفعال تعتمد على الدور' : 'Saved as visibility; actions depend on role'}</span>}
      >
        <Tree
          checkable
          selectable={false}
          checkedKeys={checkedKeys}
          onCheck={setCheckedKeys}
          treeData={treeData}
          defaultExpandAll
        />
      </Card>
    </div>
  );
}

