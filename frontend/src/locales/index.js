import en from './en.json';
import ar from './ar.json';

const translations = { en, ar };

export function getTranslations(lang) {
  const l = lang in translations ? lang : 'ar';
  return (key, opts = {}) => {
    const fallback = typeof opts === 'string' ? opts : (opts?.fallback ?? '');
    const keys = key.split('.');
    let v = translations[l];
    for (const k of keys) {
      v = v?.[k];
    }
    let s = v != null ? String(v) : (fallback || key);
    if (typeof opts === 'object' && opts !== null && !opts.fallback) {
      Object.keys(opts).forEach((k) => {
        s = s.replace(new RegExp(`{{${k}}}`, 'g'), opts[k]);
      });
    }
    return s;
  };
}

export { en, ar };
