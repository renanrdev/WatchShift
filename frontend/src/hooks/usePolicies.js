import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy, getConfigAuditReports } from '../api/policies';

export const usePolicies = (enabled = null) => {
  return useQuery({
    queryKey: ['policies', { enabled }],
    queryFn: () => getPolicies(enabled),
    staleTime: 30000, // 30 segundos
  });
};

export const usePolicy = (policyId) => {
  return useQuery({
    queryKey: ['policy', policyId],
    queryFn: () => getPolicy(policyId),
    enabled: !!policyId, // Só executa se houver um ID
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
};

export const useConfigAuditReports = (namespace = null) => {
  return useQuery({
    queryKey: ['configAuditReports', namespace],
    queryFn: () => getConfigAuditReports(namespace),
    staleTime: 60000, // 1 minuto
  });
};