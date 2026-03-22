import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicContentScrollRefContext } from '../contexts/PublicContentScrollContext';

const { Header, Content } = Layout;

export function PublicLayout() {
  const [contentScrollEl, setContentScrollEl] = useState(null);

  return (
    <PublicContentScrollRefContext.Provider value={contentScrollEl}>
    <Layout
      style={{
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Header
        style={{
          flexShrink: 0,
          width: '100%',
          padding: 0,
          height: 'auto',
          lineHeight: 'normal',
          background: 'transparent',
        }}
      >
        <PublicNavbar />
      </Header>
      {/* Scroll only this region so the navbar stays visible */}
      <Content
        ref={setContentScrollEl}
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          maxWidth: '100%',
          padding: 0,
          margin: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
    </PublicContentScrollRefContext.Provider>
  );
}
