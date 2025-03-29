import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getComplianceSummary, 
  getVulnerabilityReports, 
  getConfigAuditReports,
  runComplianceCheck
} from '../api/compliance';

export const useComplianceSummary = (namespace) => {
  return useQuery({
    queryKey: ['compliance-summary', namespace],
    queryFn: () => getComplianceSummary(namespace),
    enabled: true,
    staleTime: 60000, // 1 minuto
  });
};

export const useVulnerabilityReports = (namespace) => {
  return useQuery({
    queryKey: ['vulnerability-reports', namespace],
    queryFn: () => getVulnerabilityReports(namespace),
    enabled: true,
    staleTime: 60000, // 1 minuto
  });
};

export const useConfigAuditReports = (namespace) => {
  return useQuery({
    queryKey: ['config-audit-reports', namespace],
    queryFn: () => getConfigAuditReports(namespace),
    enabled: true,
    staleTime: 60000, // 1 minuto
  });
};

export const useRunComplianceCheck = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (namespace) => runComplianceCheck(namespace),
    onSuccess: () => {
      // Invalidar queries relevantes após o check de compliance
      queryClient.invalidateQueries({ queryKey: ['compliance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['vulnerability-reports'] });
      queryClient.invalidateQueries({ queryKey: ['config-audit-reports'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
};