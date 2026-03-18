export function toQueryString(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => {
    if (v === undefined || v === null) return false;
    if (typeof v === 'string' && v.trim() === '') return false;
    // avoid sending literal "undefined"/"null" strings
    if (v === 'undefined' || v === 'null') return false;
    return true;
  });
  return new URLSearchParams(entries).toString();
}

