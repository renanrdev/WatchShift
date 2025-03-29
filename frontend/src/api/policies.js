import apiClient from './client';

export const getPolicies = async (enabled = null) => {
  const params = enabled !== null ? { enabled } : {};
  const response = await apiClient.get('/policies', { params });
  return response.data;
};

export const getPolicy = async (id) => {
  const response = await apiClient.get(`/policies/${id}`);
  return response.data;
};

export const createPolicy = async (policyData) => {
  const response = await apiClient.post('/policies', policyData);
  return response.data;
};

export const updatePolicy = async (id, policyData) => {
  const response = await apiClient.put(`/policies/${id}`, policyData);
  return response.data;
};

export const deletePolicy = async (id) => {
  await apiClient.delete(`/policies/${id}`);
  return true;
};

export const getConfigAuditReports = async (namespace = null) => {
  const url = namespace 
    ? `/compliancereports/configaudit?ns=${encodeURIComponent(namespace)}` 
    : '/compliancereports/configaudit';
  const response = await apiClient.get(url);
  return response.data;
};