import React from 'react';
import { Typography, theme as antTheme } from 'antd';

const { Text } = Typography;

/**
 * Form block: primary accent bar + section title, white rounded panel for fields.
 * Use inside {@link StructuredFormModal} or any form layout; works with RTL via parent direction.
 *
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.extra]
 * @param {string} [props.accent] — bar color (default: theme primary)
 */
export function FormSectionCard({ title, children, extra, accent }) {
  const { token } = antTheme.useToken();
  const barColor = accent ?? token.colorPrimary;

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span
            aria-hidden
            style={{
              width: 4,
              height: 22,
              borderRadius: 2,
              background: barColor,
              flexShrink: 0,
            }}
          />
          <Text strong style={{ fontSize: 15, letterSpacing: '-0.01em', color: token.colorText }}>
            {title}
          </Text>
        </div>
        {extra != null && extra !== false ? <div style={{ flexShrink: 0 }}>{extra}</div> : null}
      </div>
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 12,
          padding: '16px 18px',
          boxShadow: token.boxShadowTertiary,
        }}
      >
        {children}
      </div>
    </div>
  );
}
