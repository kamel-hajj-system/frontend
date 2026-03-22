/**
 * ISO 3166-1 alpha-3 → alpha-2 (common countries + Hajj/Umrah senders).
 * Use when DB stores "SAU" instead of "SA".
 */
const ALPHA3_TO_ALPHA2 = {
  SAU: 'SA',
  ARE: 'AE',
  EGY: 'EG',
  JOR: 'JO',
  IRQ: 'IQ',
  SYR: 'SY',
  LBN: 'LB',
  PSE: 'PS',
  YEM: 'YE',
  SDN: 'SD',
  TUR: 'TR',
  IRN: 'IR',
  IND: 'IN',
  PAK: 'PK',
  BGD: 'BD',
  MYS: 'MY',
  IDN: 'ID',
  NGA: 'NG',
  USA: 'US',
  GBR: 'GB',
  FRA: 'FR',
  DEU: 'DE',
  CHN: 'CN',
  RUS: 'RU',
  MAR: 'MA',
  DZA: 'DZ',
  TUN: 'TN',
  LBY: 'LY',
  KWT: 'KW',
  QAT: 'QA',
  BHR: 'BH',
  OMN: 'OM',
  AFG: 'AF',
  UZB: 'UZ',
  TJK: 'TJ',
  SOM: 'SO',
  ETH: 'ET',
  ERI: 'ER',
  DJI: 'DJ',
  KEN: 'KE',
  SEN: 'SN',
  MLI: 'ML',
  CIV: 'CI',
  GHA: 'GH',
  CAN: 'CA',
  AUS: 'AU',
  NLD: 'NL',
  BEL: 'BE',
  ESP: 'ES',
  ITA: 'IT',
  SWE: 'SE',
  NOR: 'NO',
  FIN: 'FI',
  POL: 'PL',
  UKR: 'UA',
  ROU: 'RO',
  BRA: 'BR',
  ARG: 'AR',
  MEX: 'MX',
  ZAF: 'ZA',
  THA: 'TH',
  VNM: 'VN',
  PHL: 'PH',
  KOR: 'KR',
  JPN: 'JP',
};

/**
 * Normalize to ISO 3166-1 alpha-2 (uppercase) or null.
 */
export function normalizeNationalityIso2(code) {
  if (!code || typeof code !== 'string') return null;
  const c = code.trim().toUpperCase();
  if (c.length !== 2) return null;
  const a = c.charCodeAt(0);
  const b = c.charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return null;
  return c;
}

/**
 * Resolve ISO 3166-1 alpha-2 from DB `code` (may be alpha-2, alpha-3, or missing).
 */
export function resolveNationalityIso2ForFlag(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const c = raw.trim().toUpperCase();
  const iso2 = normalizeNationalityIso2(c);
  if (iso2) return iso2;
  if (c.length === 3 && /^[A-Z]{3}$/.test(c) && ALPHA3_TO_ALPHA2[c]) {
    return ALPHA3_TO_ALPHA2[c];
  }
  return null;
}

/**
 * Static flag image over HTTPS (flagcdn.com). Safe for <img src>; falls back on error in UI.
 * @param {string} iso2 - ISO 3166-1 alpha-2
 * @param {number} widthPx - requested width (height scales with flag aspect)
 */
export function nationalityFlagImageUrl(iso2, widthPx = 80) {
  const iso = resolveNationalityIso2ForFlag(iso2);
  if (!iso) return null;
  return `https://flagcdn.com/w${widthPx}/${iso.toLowerCase()}.png`;
}

/**
 * ISO 3166-1 alpha-2 → regional indicator flag emoji (e.g. "SA" → 🇸🇦).
 * Returns null if code is not two Latin letters.
 */
export function iso2ToFlagEmoji(code) {
  if (!code || typeof code !== 'string') return null;
  const c = normalizeNationalityIso2(code);
  if (!c) return null;
  const A = 0x1f1e6;
  const a = c.charCodeAt(0);
  const b = c.charCodeAt(1);
  return String.fromCodePoint(A + a - 65, A + b - 65);
}

/** Fallback badge when no valid ISO2 on nationality. Uses `flagCode` only (not free-form `code`). */
export function nationalityFlagOrFallback(nat) {
  const iso = resolveNationalityIso2ForFlag(nat?.flagCode);
  const emoji = iso ? iso2ToFlagEmoji(iso) : null;
  if (emoji) return { type: 'emoji', value: emoji };
  const letter = (nat?.name || nat?.nameAr || '?').trim().charAt(0).toUpperCase() || '?';
  return { type: 'letter', value: letter };
}

/** Single letter for avatar fallback (same logic as nationalityFlagOrFallback). */
export function nationalityLetterFallback(nat) {
  return (nat?.name || nat?.nameAr || '?').trim().charAt(0).toUpperCase() || '?';
}
