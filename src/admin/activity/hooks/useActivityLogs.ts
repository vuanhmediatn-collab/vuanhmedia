import { useQuery } from '@tanstack/react-query';
import { getActivityLogs, getActivitySummary } from '../services/activity.service';
import type { 
  ActivityFiltersState, 
  ActivityLogsResponse, 
  ActivitySummary 
} from '../types/activity.types';

export const ADMIN_ACTIVITY_QUERY_KEY = ['admin', 'activity'] as const;

export const useActivityLogs = (
  filters: ActivityFiltersState,
  page: number = 1,
  pageSize: number = 20
) => {
  return useQuery<ActivityLogsResponse, Error>({
    queryKey: [...ADMIN_ACTIVITY_QUERY_KEY, 'list', filters, page, pageSize],
    queryFn: () => getActivityLogs(filters, page, pageSize),
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
};

export const useActivitySummary = () => {
  return useQuery<ActivitySummary, Error>({
    queryKey: [...ADMIN_ACTIVITY_QUERY_KEY, 'summary'],
    queryFn: getActivitySummary,
    staleTime: 15000,
    refetchOnWindowFocus: true,
  });
};
