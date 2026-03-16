import { apiRequest } from './client.js';

/** List locations (optional ?isActive=true for active only). */
export async function getLocations(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiRequest(`/locations${q ? `?${q}` : ''}`);
}

/** Get one location by id. */
export async function getLocationById(id) {
  return apiRequest(`/locations/${id}`);
}

/** Create location (Super Admin). */
export async function createLocation(payload) {
  return apiRequest('/locations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Update location (Super Admin). */
export async function updateLocation(id, payload) {
  return apiRequest(`/locations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
