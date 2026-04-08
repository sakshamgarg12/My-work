import { apiClient } from './api';

const countParams = { page: 1, limit: 1 };

/**
 * Loads total record counts using list endpoints (`limit=1` keeps payloads small).
 * Uses the same Axios `apiClient` as company/contact/lead services.
 */
export async function fetchDashboardStats() {
  const [companiesRes, contactsRes, leadsRes] = await Promise.all([
    apiClient.get('/companies', { params: countParams }),
    apiClient.get('/contacts', { params: countParams }),
    apiClient.get('/leads', { params: countParams }),
  ]);

  return {
    companies: companiesRes.pagination?.total ?? 0,
    contacts: contactsRes.pagination?.total ?? 0,
    leads: leadsRes.pagination?.total ?? 0,
  };
}
