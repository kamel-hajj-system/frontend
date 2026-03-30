import { apiRequest } from './client.js';

/** Public list for signup (no login). Returns { id, code, name, nameAr }[] */
export async function getPublicServiceCenters() {
  return apiRequest('/public/service-centers');
}

export async function getPilgrimNationalities() {
  return apiRequest('/pilgrim-nationalities');
}

/** Super admin: set each nationality's totalArrivingPilgrimsCount = sum(arriving) from all centers */
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

export async function getPilgrimCompanies() {
  return apiRequest('/pilgrim-companies');
}

export async function getPilgrimCompany(id) {
  return apiRequest(`/pilgrim-companies/${id}`);
}

export async function createPilgrimCompany(payload) {
  return apiRequest('/pilgrim-companies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePilgrimCompany(id, payload) {
  return apiRequest(`/pilgrim-companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePilgrimCompany(id) {
  return apiRequest(`/pilgrim-companies/${id}`, { method: 'DELETE' });
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
