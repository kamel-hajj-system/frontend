import { apiRequest } from './client.js';

/** @typedef {{ id: string, code: string, name?: string|null, nameAr?: string|null, maxCapacity?: number|null, totalAllocated: number, totalIntegrated: number, integratedPercent: number, companies: { id?: string, externalCode?: string|null, name?: string, nameAr?: string|null, allocatedPilgrims:number, mergedActualPilgrimsCount:number }[] }} ReceptionServiceCenterOverview */

/** Reception portal: glass dashboard data */
export async function getReceptionServiceCentersOverview() {
  return apiRequest('/reception/service-centers-overview');
}

/** Reception portal: users linked to a center (name + phone) */
export async function getReceptionServiceCenterUsers(centerId) {
  return apiRequest(`/reception/service-centers/${centerId}/users`);
}

/** Reception portal: pilgrim companies overview */
export async function getReceptionPilgrimCompaniesOverview() {
  return apiRequest('/reception/pilgrim-companies-overview');
}
