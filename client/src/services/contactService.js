import { apiClient } from './api';

/**
 * Contact API — shared Axios `apiClient` (`/api` baseURL, JSON, response + error interceptors).
 * Used by Contacts list, add/edit forms, and dashboard contact totals.
 */
export function fetchContacts(query = {}) {
  return apiClient.get('/contacts', { params: query });
}

export function fetchContact(id) {
  return apiClient.get(`/contacts/${id}`);
}

export function createContact(payload) {
  return apiClient.post('/contacts', payload);
}

export function updateContact(id, payload) {
  return apiClient.put(`/contacts/${id}`, payload);
}

export function removeContact(id) {
  return apiClient.delete(`/contacts/${id}`);
}
