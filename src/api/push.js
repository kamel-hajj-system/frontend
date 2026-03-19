import { apiRequest } from './client';

/** Public: whether server has VAPID keys and the public key for subscribe(). */
export function getVapidPublicKey() {
  return apiRequest('/push/vapid-public-key');
}

export function pushSubscribe(payload) {
  return apiRequest('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function pushUnsubscribe(payload) {
  return apiRequest('/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
