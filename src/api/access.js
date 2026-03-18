import { apiRequest } from './client';
import { toQueryString } from './query';

export async function setAccessGrants(userIds, codes) {
  return apiRequest('/access/grants', {
    method: 'POST',
    body: JSON.stringify({ userIds, codes }),
  });
}

export async function getAccessGrants(userId) {
  const q = toQueryString({ userId });
  return apiRequest(`/access/grants?${q}`);
}

