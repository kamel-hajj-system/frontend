import React from 'react';
import { Typography, theme as antTheme } from 'antd';

const { Text } = Typography;

/**
 * Standard dashboard summary tile: centered icon tile, label, value, accent bar,
 * themed border, corner blob, and accent-tinted hover shadow (not neutral gray).
 *
 * Pass `accent` from Ant Design tokens, e.g. `token.colorPrimary`, `token.colorSuccess`.
 *
 * @param {React.ReactNode} props.icon
 * @param {string} props.accent — CSS color (typically `token.colorPrimary` etc.)
 * @param {React.ReactNode} props.label
 * @param {React.ReactNode} props.value
 * @param {number} [props.minHeight=158]
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style]
 */
export function SummaryStatCard({
  icon,
  accent,
  label,
  value,
  minHeight = 158,
  className,
  style,
}) {
  const { token } = antTheme.useToken();

  const shadowIdle = `0 2px 10px color-mix(in srgb, ${accent} 12%, transparent), 0 1px 3px color-mix(in srgb, ${accent} 8%, transparent)`;
  const shadowHover = `0 14px 40px color-mix(in srgb, ${accent} 28%, transparent), 0 6px 18px color-mix(in srgb, ${accent} 18%, transparent)`;

  const blobStyle = {
    position: 'absolute',
    top: -28,
    insetInlineEnd: -24,
    width: 92,
    height: 92,
    borderRadius: '50%',
    background: accent,
    opacity: 0.11,
    pointerEvents: 'none',
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight,
        borderRadius: 18,
        background: token.colorBgContainer,
        border: `1px solid color-mix(in srgb, ${accent} 42%, ${token.colorBorderSecondary})`,
        boxShadow: shadowIdle,
        padding: 'clamp(18px, 2.8vw, 26px) clamp(14px, 2.2vw, 20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'box-shadow 0.25s ease, transform 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = shadowHover;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadowIdle;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div aria-hidden style={blobStyle} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'clamp(46px, 6.5vw, 56px)',
          height: 'clamp(46px, 6.5vw, 56px)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `color-mix(in srgb, ${accent} 16%, ${token.colorBgContainer})`,
          color: accent,
          fontSize: 'clamp(20px, 2.6vw, 26px)',
          marginBottom: 12,
          boxShadow: `0 1px 2px color-mix(in srgb, ${accent} 20%, transparent)`,
        }}
      >
        {icon}
      </div>
      <Text
        type="secondary"
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(12px, 1.4vw, 14px)',
          display: 'block',
          lineHeight: 1.45,
          marginBottom: 10,
          maxWidth: '100%',
        }}
      >
        {label}
      </Text>
      <Text
        strong
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(24px, 3.5vw, 36px)',
          color: token.colorTextHeading ?? token.colorText,
          lineHeight: 1.08,
          letterSpacing: '-0.035em',
          display: 'block',
        }}
      >
        {value}
      </Text>
      <div
        aria-hidden
        style={{
          position: 'relative',
          zIndex: 1,
          width: 'clamp(36px, 12%, 48px)',
          height: 4,
          borderRadius: 2,
          background: accent,
          marginTop: 14,
        }}
      />
    </div>
  );
}
