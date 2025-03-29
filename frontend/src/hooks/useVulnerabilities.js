import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  scanImage, 
  getScanResult, 
  getNamespaceSummary, 
  startBatchScan,
  getVulnerabilityReports,
  getVulnerabilityReport,
  getComplianceSummary,
  testTrivyConnection
} from '../api/vulnerabilities';


export const useScanResult = (imageName) => {
  return useQuery({
    queryKey: ['scan', imageName],
    queryFn: () => getScanResult(imageName),
    enabled: !!imageName, // Só executar se houver um nome de imagem
    retry: 1,
  });
};

export const useNamespaceSummary = (namespace) => {
  return useQuery({
    queryKey: ['namespace-summary', namespace],
    queryFn: () => getNamespaceSummary(namespace),
    enabled: !!namespace, // Só executar se houver um namespace
    retry: 1,
  });
};

export const useScanImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ imageName, force }) => scanImage(imageName, force),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scan', variables.imageName] });
      queryClient.invalidateQueries({ queryKey: ['namespace-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
};

export const useStartBatchScan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (force) => startBatchScan(force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scan'] });
      queryClient.invalidateQueries({ queryKey: ['namespace-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });
};

export const useVulnerabilityReports = (namespace = null) => {
  return useQuery({
    queryKey: ['vulnerability-reports', namespace],
    queryFn: () => getVulnerabilityReports(namespace),
    staleTime: 60000, // 1 minuto
  });
};

export const useVulnerabilityReport = (name, namespace = 'default') => {
  return useQuery({
    queryKey: ['vulnerability-report', name, namespace],
    queryFn: () => getVulnerabilityReport(name, namespace),
    enabled: !!name && !!namespace,
  });
};

export const useComplianceSummary = (namespace = null) => {
  return useQuery({
    queryKey: ['compliance-summary', namespace],
    queryFn: () => getComplianceSummary(namespace),
    staleTime: 60000, // 1 minuto
  });
};

export const useTestTrivyConnection = () => {
  return useQuery({
    queryKey: ['trivy-connection-test'],
    queryFn: testTrivyConnection,
    staleTime: 300000, // 5 minutos
  });
};