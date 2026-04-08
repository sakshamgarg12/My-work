import { apiClient } from './api';

/**
 * Lead REST API via Axios (`apiClient`).
 * Base path: `/leads` under `API_BASE` (e.g. `/api/leads`).
 * Responses are unwrapped to JSON body by the client interceptor.
 */
export function fetchLeads(query = {}) {
  return apiClient.get('/leads', { params: query });
}

export function fetchLead(id) {
  return apiClient.get(`/leads/${id}`);
}

export function createLead(payload) {
  return apiClient.post('/leads', payload);
}

export function updateLead(id, payload) {
  return apiClient.put(`/leads/${id}`, payload);
}

export function removeLead(id) {
  return apiClient.delete(`/leads/${id}`);
}

export function convertLeadToContact(id) {
  return apiClient.post(`/leads/${id}/convert`);
}
