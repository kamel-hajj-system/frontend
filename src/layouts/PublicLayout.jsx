import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { PublicNavbar } from '../components/layout/PublicNavbar';

const { Header, Content } = Layout;

export function PublicLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <PublicNavbar />
      </Header>
      <Content style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
