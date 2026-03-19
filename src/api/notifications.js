import { apiRequest } from './client';
import { toQueryString } from './query';

export function getMyNotifications(params = {}) {
  const q = toQueryString(params);
  return apiRequest(`/notifications/mine${q ? `?${q}` : ''}`);
}

export function getUnreadNotificationsCount() {
  return apiRequest('/notifications/unread-count');
}

export function markNotificationAsRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: 'POST' });
}

export function sendNotifications(payload) {
  return apiRequest('/superadmin/notifications/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

