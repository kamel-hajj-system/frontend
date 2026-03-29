import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  KAMEL_LOGO_LIGHT_SRC,
  KAMEL_LOGO_DARK_SRC,
  KAMEL_LOGO_DARK_PUBLIC_SRC,
  KAMEL_LOGO_LIGHT_PUBLIC_SRC,
} from '../../utils/constants';

/**
 * Renders the Kamel wordmark from `public/logo/` based on `variant` / theme.
 * Use `fullWidth` so the image scales with its container (e.g. portal sidebar).
 * @param {'auto' | 'light' | 'dark' | 'darkPublic' | 'lightPublic'} [variant='auto'] — `lightPublic` / `darkPublic` for marketing home; `auto` uses LightMode/DarkMood from `useTheme()`.
 */
export function KamelLogo({ height = 32, fullWidth = false, alt = '', className, style, variant = 'auto' }) {
  const { theme } = useTheme();
  const src =
    variant === 'light'
      ? KAMEL_LOGO_LIGHT_SRC
      : variant === 'lightPublic'
        ? KAMEL_LOGO_LIGHT_PUBLIC_SRC
        : variant === 'dark'
          ? KAMEL_LOGO_DARK_SRC
          : variant === 'darkPublic'
            ? KAMEL_LOGO_DARK_PUBLIC_SRC
            : theme === 'dark'
              ? KAMEL_LOGO_DARK_SRC
              : KAMEL_LOGO_LIGHT_SRC;

  const sizeStyle = fullWidth
    ? {
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
      }
    : {
        height,
        width: 'auto',
        maxWidth: '100%',
      };

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      className={className}
      style={{
        ...sizeStyle,
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
    />
  );
}
