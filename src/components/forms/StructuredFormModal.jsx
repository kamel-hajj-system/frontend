import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button, Modal, Space, Typography, theme as antTheme } from 'antd';

const { Text } = Typography;

/**
 * Modal tuned for multi-section forms: light header, padded body on subtle fill, custom footer
 * (cancel + primary) like the reference “إضافة محضر” layout. Respects RTL via Ant Design ConfigProvider.
 *
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} props.children — typically {@link FormSectionCard} blocks + Ant Design Form
 * @param {() => void | Promise<void>} [props.onSubmit]
 * @param {boolean} [props.submitLoading]
 * @param {string} [props.submitText]
 * @param {string} [props.cancelText]
 * @param {React.ReactNode} [props.submitIcon]
 * @param {number|string} [props.width=640]
 * @param {string} [props.closeAriaLabel]
 * @param {React.ReactNode} [props.footer] — if set, replaces default footer entirely
 */
export function StructuredFormModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLoading = false,
  submitText,
  cancelText,
  submitIcon,
  width = 640,
  closeAriaLabel = 'Close',
  footer,
}) {
  const { token } = antTheme.useToken();

  const resolvedWidth =
    typeof width === 'number'
      ? Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 32 : width)
      : width;

  const defaultFooter =
    onSubmit != null ? (
      <div
        style={{
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: '14px 20px 18px',
          background: token.colorBgContainer,
        }}
      >
        <Space style={{ width: '100%', justifyContent: 'flex-end' }} wrap>
          <Button onClick={onClose} size="large">
            {cancelText}
          </Button>
          <Button type="primary" size="large" icon={submitIcon} loading={submitLoading} onClick={() => onSubmit()}>
            {submitText}
          </Button>
        </Space>
      </div>
    ) : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={footer !== undefined ? footer : defaultFooter}
      closable={false}
      centered
      width={resolvedWidth}
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: 14,
          boxShadow: token.boxShadowSecondary,
        },
        body: { padding: 0 },
        mask: { backdropFilter: 'blur(2px)' },
      }}
    >
      <div
        style={{
          padding: '18px 20px 16px',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
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
          <Text strong style={{ fontSize: 17, flex: 1, minWidth: 0, color: token.colorText, lineHeight: 1.35 }}>
            {title}
          </Text>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeAriaLabel}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 10,
              background: token.colorBgElevated,
              color: token.colorTextSecondary,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = token.colorFillSecondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = token.colorBgElevated;
            }}
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      <div
        style={{
          background: token.colorFillAlter,
          padding: '18px 20px 22px',
          maxHeight: 'min(70vh, calc(100vh - 220px))',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </Modal>
  );
}
