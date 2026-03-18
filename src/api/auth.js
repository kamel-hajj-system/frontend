/**
 * Auth API – login, logout. Uses user module endpoints.
 */

import { apiRequest, setAuthToken } from './client.js';

export async function login(email, password) {
  const data = await apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: String(email).trim(), password }),
  });
  if (data.token) setAuthToken(data.token);
  return data;
}

export async function logout() {
  try {
    await apiRequest('/users/logout', { method: 'POST' });
  } finally {
    setAuthToken(null);
  }
}

export async function refresh() {
  const data = await apiRequest('/users/refresh', { method: 'POST' });
  if (data.token) setAuthToken(data.token);
  return data;
}
