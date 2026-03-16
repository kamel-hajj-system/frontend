import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_LANG, LANGUAGES } from '../utils/constants';
import { getTranslations } from '../locales';

const LanguageContext = createContext(null);

const LANG_KEY = 'kamel_lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    return window.localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  });

  useEffect(() => {
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  const setLang = (code) => {
    const next = LANGUAGES.some((l) => l.code === code) ? code : DEFAULT_LANG;
    setLangState(next);
  };

  const t = getTranslations(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
