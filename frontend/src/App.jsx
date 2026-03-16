import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { AntdConfig } from './providers/AntdConfig';
import { AppRouter } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AntdConfig>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </AntdConfig>
      </LanguageProvider>
    </ThemeProvider>
  );
}
