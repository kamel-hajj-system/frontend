import { apiRequest } from './client.js';
import { toQueryString } from './query.js';

export async function getAttendanceStatus(params = {}) {
  const q = toQueryString(params);
  return apiRequest(`/attendance/status${q ? `?${q}` : ''}`);
}

export async function attendanceCheckIn(payload = {}) {
  return apiRequest('/attendance/check-in', { method: 'POST', body: JSON.stringify(payload) });
}

export async function attendanceCheckOut(payload = {}) {
  return apiRequest('/attendance/check-out', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getHrAttendance(params = {}) {
  const q = toQueryString(params);
  return apiRequest(`/hr/attendance${q ? `?${q}` : ''}`);
}
