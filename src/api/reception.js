import { apiRequest } from './client.js';

/** @typedef {{ id: string, code: string, name?: string|null, nameAr?: string|null, maxCapacity?: number|null, totalAllocated: number, totalArrived: number, arrivedPercent: number, nationalities: { id?: string, code?: string|null, flagCode?: string|null, name?: string, nameAr?: string|null }[] }} ReceptionServiceCenterOverview */

/** Reception portal: glass dashboard data */
export async function getReceptionServiceCentersOverview() {
  return apiRequest('/reception/service-centers-overview');
}

/** Reception portal: users linked to a center (name + phone) */
export async function getReceptionServiceCenterUsers(centerId) {
  return apiRequest(`/reception/service-centers/${centerId}/users`);
}

/** @typedef {{ id: string, code?: string|null, flagCode?: string|null, name: string, nameAr?: string|null, totalAllocated: number, totalArrived: number, arrivedPercent: number }} ReceptionNationalityOverview */

/** Reception portal: all nationalities with totals across centers */
export async function getReceptionNationalitiesOverview() {
  return apiRequest('/reception/nationalities-overview');
}
