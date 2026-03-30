import React from 'react';
import { theme as antTheme } from 'antd';

/** Consistent icon tile for portal page headings (matches HR attendance title treatment). */
export function PortalTitleIcon({ children, style, ...rest }) {
  const { token } = antTheme.useToken();
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: token.borderRadiusLG,
        background: `color-mix(in srgb, ${token.colorPrimary} 12%, ${token.colorFillAlter})`,
        border: `1px solid color-mix(in srgb, ${token.colorPrimary} 18%, ${token.colorBorderSecondary})`,
        color: token.colorPrimary,
        fontSize: 20,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
