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

/** Company supervisor: immediate send to selected direct employees. */
export function supervisorSendNotifications(payload) {
  return apiRequest('/portal/company/supervisor/notifications/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Company supervisor: schedule to selected direct employees. */
export function supervisorScheduleNotification(payload) {
  return apiRequest('/portal/company/supervisor/notifications/schedule', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** HR (edit): immediate send. */
export function hrSendNotifications(payload) {
  return apiRequest('/hr/notifications/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** HR (edit): schedule. */
export function hrScheduleNotification(payload) {
  return apiRequest('/hr/notifications/schedule', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Super Admin: schedule. */
export function superadminScheduleNotification(payload) {
  return apiRequest('/superadmin/notifications/schedule', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMyScheduledNotifications() {
  return apiRequest('/notifications/scheduled');
}

export function cancelScheduledNotification(id) {
  return apiRequest(`/notifications/scheduled/${id}`, { method: 'DELETE' });
}

