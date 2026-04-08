import { apiClient } from './api';

/**
 * Company API — uses shared Axios `apiClient` (baseURL + JSON + error handling).
 */
export function fetchCompanies(query = {}) {
  return apiClient.get('/companies', { params: query });
}

export function fetchCompanyIndustries() {
  return apiClient.get('/companies/industries');
}

export function fetchCompany(id) {
  return apiClient.get(`/companies/${id}`);
}

export function createCompany(payload) {
  return apiClient.post('/companies', payload);
}

export function updateCompany(id, payload) {
  return apiClient.put(`/companies/${id}`, payload);
}

export function removeCompany(id) {
  return apiClient.delete(`/companies/${id}`);
}
