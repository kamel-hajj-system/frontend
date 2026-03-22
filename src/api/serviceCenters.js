import { apiRequest } from './client.js';

/**
 * @typedef {{
 *   id: string,
 *   code?: string|null,
 *   flagCode?: string|null,
 *   name: string,
 *   nameAr?: string|null,
 *   notes?: string|null,
 *   totalPilgrimsCount?: number|null,
 *   totalArrivingPilgrimsCount?: number|null,
 *   allocatedAcrossCenters?: number,
 *   arrivingSumAcrossCenters?: number,
 * }} PilgrimNationality
 */

/** Public list for signup (no login). Returns { id, code, name, nameAr }[] */
export async function getPublicServiceCenters() {
  return apiRequest('/public/service-centers');
}

export async function getPilgrimNationalities() {
  return apiRequest('/pilgrim-nationalities');
}

/** Super admin: set each nationality's totalArrivingPilgrimsCount = sum(arriving) from all centers */
export async function syncAllPilgrimNationalityArrivingTotals() {
  return apiRequest('/pilgrim-nationalities/sync-arriving-totals', { method: 'POST' });
}

/** Super admin: nationality totals + per–service-center allocated / arriving / waiting */
export async function getPilgrimNationalityOverview(id) {
  return apiRequest(`/pilgrim-nationalities/${id}/overview`);
}

export async function createPilgrimNationality(payload) {
  return apiRequest('/pilgrim-nationalities', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePilgrimNationality(id, payload) {
  return apiRequest(`/pilgrim-nationalities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePilgrimNationality(id) {
  return apiRequest(`/pilgrim-nationalities/${id}`, { method: 'DELETE' });
}

export async function getServiceCenters() {
  return apiRequest('/service-centers');
}

export async function getServiceCenter(id) {
  return apiRequest(`/service-centers/${id}`);
}

export async function getServiceCenterUsers(id) {
  return apiRequest(`/service-centers/${id}/users`);
}

export async function createServiceCenter(payload) {
  return apiRequest('/service-centers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateServiceCenter(id, payload) {
  return apiRequest(`/service-centers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteServiceCenter(id) {
  return apiRequest(`/service-centers/${id}`, { method: 'DELETE' });
}
