/**
 * API client – base fetch with auth and error handling.
 * No hardcoded URLs; uses relative /api for same-origin.
 */
import { AUTH_TOKEN_KEY } from '../utils/constants';

const API_BASE = '/api';

function getToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const rawDetails = data?.details ?? data?.error;
    const message =
      typeof rawDetails === 'string'
        ? rawDetails
        : Array.isArray(rawDetails) && rawDetails.every((d) => d && typeof d.msg === 'string')
          ? rawDetails.map((d) => d.msg).join('. ')
          : data?.error || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.details = rawDetails;
    throw err;
  }
  return data;
}

export function setAuthToken(token) {
  if (token) sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  else sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export function hasAuthToken() {
  return Boolean(getToken());
}
