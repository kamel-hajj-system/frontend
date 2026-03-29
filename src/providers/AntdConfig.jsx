import React from 'react';
import { ConfigProvider, App, theme as antdTheme } from 'antd';
import arEG from 'antd/locale/ar_EG';
import enUS from 'antd/locale/en_US';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PWAUpdatePrompt } from '../components/pwa/PWAUpdatePrompt';

const localeMap = { ar: arEG, en: enUS };

export function AntdConfig({ children }) {
  const { theme } = useTheme();
  const { lang } = useLanguage();

  const isDark = theme === 'dark';
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  const fontFamily =
    lang === 'ar' ? 'var(--font-arabic), system-ui, sans-serif' : 'var(--font-sans), system-ui, sans-serif';

  return (
    <ConfigProvider
      direction={direction}
      locale={localeMap[lang] || arEG}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#2dd4bf' : '#0f766e',
          borderRadius: 8,
          controlHeight: 40,
          fontFamily,
        },
        components: {
          Layout: {
            headerBg: 'var(--color-bg-container)',
            bodyBg: 'transparent',
            siderBg: '#001529',
          },
          Menu: {
            darkItemBg: 'transparent',
          },
        },
      }}
    >
      <App>
        {children}
        <PWAUpdatePrompt />
      </App>
    </ConfigProvider>
  );
}
