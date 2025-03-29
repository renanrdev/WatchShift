import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard');
      return response.data;
    },
    refetchInterval: 60000, //1 minuto
    staleTime: 30000, // Considerar os dados como "antigos" após 30 segundos
    retry: 2, // Tentar novamente até 2 vezes em caso de falha
  });
};