import apiClient from './client';

export const scanImage = async (imageName, force = false) => {
  const response = await apiClient.post('/scans', { 
    image_name: imageName, 
    force 
  });
  return response.data;
};

export const getScanResult = async (imageName) => {
  const response = await apiClient.get(`/scans/${encodeURIComponent(imageName)}`);
  return response.data;
};

export const getNamespaceSummary = async (namespace) => {
  const response = await apiClient.get(`/scans/namespace/${encodeURIComponent(namespace)}`);
  return response.data;
};

export const startBatchScan = async (force = false) => {
  const response = await apiClient.post('/scans/batch', { force });
  return response.data;
};

export const getVulnerabilityReports = async (namespace = null) => {
  const url = namespace 
    ? `/compliancereports/vulnerability?ns=${encodeURIComponent(namespace)}` 
    : '/compliancereports/vulnerability';
  const response = await apiClient.get(url);
  return response.data;
};

export const getVulnerabilityReport = async (name, namespace = 'default') => {
  const response = await apiClient.get(`/compliancereports/vulnerability/${encodeURIComponent(name)}?ns=${encodeURIComponent(namespace)}`);
  return response.data;
};

export const getComplianceSummary = async (namespace = null) => {
  const url = namespace 
    ? `/compliancereports/summary?ns=${encodeURIComponent(namespace)}` 
    : '/compliancereports/summary';
  const response = await apiClient.get(url);
  return response.data;
};

export const testTrivyConnection = async () => {
  const response = await apiClient.get('/scans/test-trivy');
  return response.data;
};