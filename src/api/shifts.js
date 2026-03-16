import { apiRequest } from './client.js';

/** List shifts (optional ?isForEmployee=true for employee dropdown). */
export async function getShifts(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiRequest(`/shifts${q ? `?${q}` : ''}`);
}

/** Get one shift by id. */
export async function getShiftById(id) {
  return apiRequest(`/shifts/${id}`);
}

/** Create shift (Super Admin). */
export async function createShift(payload) {
  return apiRequest('/shifts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Update shift (Super Admin). */
export async function updateShift(id, payload) {
  return apiRequest(`/shifts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** Delete shift (Super Admin). */
export async function deleteShift(id) {
  return apiRequest(`/shifts/${id}`, { method: 'DELETE' });
}
