import { apiRequest } from './client.js';

export async function getGroups(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiRequest(`/groups${q ? `?${q}` : ''}`);
}

export async function getGroupById(id) {
  return apiRequest(`/groups/${id}`);
}

export async function createGroup(payload) {
  return apiRequest('/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateGroup(id, payload) {
  return apiRequest(`/groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteGroup(id) {
  return apiRequest(`/groups/${id}`, { method: 'DELETE' });
}

export async function setGroupPermissions(id, permissionIds) {
  return apiRequest(`/groups/${id}/permissions`, {
    method: 'POST',
    body: JSON.stringify({ permissionIds: Array.isArray(permissionIds) ? permissionIds : [] }),
  });
}

export async function setGroupUsers(id, userIds) {
  return apiRequest(`/groups/${id}/users`, {
    method: 'POST',
    body: JSON.stringify({ userIds: Array.isArray(userIds) ? userIds : [] }),
  });
}
