import apiClient from './client';

export const getComplianceSummary = async (namespace = null) => {
  const params = namespace ? { namespace } : {};
  const response = await apiClient.get('/compliancereports/summary', { params });
  return response.data;
};

export const getVulnerabilityReports = async (namespace = null) => {
  const params = namespace ? { namespace } : {};
  const response = await apiClient.get('/compliancereports/vulnerability', { params });
  return response.data;
};

export const getConfigAuditReports = async (namespace = null) => {
  const params = namespace ? { namespace } : {};
  const response = await apiClient.get('/compliancereports/configaudit', { params });
  return response.data;
};

export const runComplianceCheck = async (namespace = null) => {
  const params = namespace ? { namespace } : {};
  const response = await apiClient.post('/compliance/check', params);
  return response.data;
};