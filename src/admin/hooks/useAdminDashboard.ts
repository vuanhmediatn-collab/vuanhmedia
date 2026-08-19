import { useQuery } from '@tanstack/react-query';
import { fetchAdminDashboardData, type DashboardData } from '../services/dashboard.service';

export const ADMIN_DASHBOARD_QUERY_KEY = ['admin', 'dashboard'];

export const useAdminDashboard = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: fetchAdminDashboardData,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};
