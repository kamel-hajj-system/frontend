import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Modal, Typography, theme as antTheme } from 'antd';

const { Text } = Typography;

/**
 * Full-width detail dialog: dark header tinted from {@link token.colorPrimary}, light body, rounded shell.
 * Use with {@link DashboardDetailSection} for titled white blocks inside the body.
 *
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {React.ReactNode} props.title — main heading (white)
 * @param {React.ReactNode} [props.subtitle] — secondary line under title
 * @param {React.ReactNode} props.children — scrollable body
 * @param {number|string} [props.width=720]
 * @param {string} [props.closeAriaLabel]
 */
export function DashboardDetailModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 720,
  closeAriaLabel = 'Close',
}) {
  const { token } = antTheme.useToken();

  const headerBg = `linear-gradient(180deg,
    color-mix(in srgb, ${token.colorPrimary} 62%, #0f1720) 0%,
    color-mix(in srgb, ${token.colorPrimary} 48%, #0a1218) 100%)`;

  const resolvedWidth =
    typeof width === 'number'
      ? Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width)
      : width;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={resolvedWidth}
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: 16,
        },
        body: { padding: 0 },
      }}
    >
      <div
        style={{
          background: headerBg,
          padding: '18px 20px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            direction: 'inherit',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: 'rgba(255,255,255,0.98)',
                fontSize: 'clamp(16px, 1.5vw, 18px)',
                fontWeight: 700,
                lineHeight: 1.35,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </div>
            {subtitle != null && subtitle !== '' ? (
              <Text style={{ display: 'block', marginTop: 4, color: 'rgba(255,255,255,0.82)', fontSize: 13 }}>
                {subtitle}
              </Text>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeAriaLabel}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              border: 'none',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.95)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            }}
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      <div
        style={{
          background: token.colorFillAlter,
          padding: '20px 20px 24px',
          maxHeight: 'min(72vh, calc(100vh - 200px))',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </Modal>
  );
}
