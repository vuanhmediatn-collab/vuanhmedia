import { supabase } from '../../../lib/supabase';
import type { 
  ActivityLogRow, 
  ActivityFiltersState, 
  ActivityLogsResponse, 
  ActivitySummary 
} from '../types/activity.types';

/**
 * Fetch paginated & filtered activity logs from Supabase
 */
export const getActivityLogs = async (
  filters: ActivityFiltersState,
  page: number = 1,
  pageSize: number = 20
): Promise<ActivityLogsResponse> => {
  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' });

  // Quick Filter
  if (filters.quickFilter === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.gte('created_at', today.toISOString());
  } else if (filters.quickFilter === 'project') {
    query = query.in('entity_type', ['project', 'projects']);
  } else if (filters.quickFilter === 'project_video') {
    query = query.in('entity_type', ['project_video', 'project_videos']);
  } else if (filters.quickFilter === 'project_media') {
    query = query.eq('entity_type', 'project_media');
  } else if (filters.quickFilter === 'site_content') {
    query = query.eq('entity_type', 'site_content');
  }

  // Explicit Entity Filter
  if (filters.entityType && filters.entityType !== 'all') {
    query = query.eq('entity_type', filters.entityType);
  }

  // Action Filter
  if (filters.action && filters.action !== 'all') {
    query = query.eq('action', filters.action);
  }

  // Actor Filter
  if (filters.userEmail && filters.userEmail !== 'all') {
    if (filters.userEmail === 'system') {
      query = query.is('user_email', null);
    } else {
      query = query.eq('user_email', filters.userEmail);
    }
  }

  // Search Filter
  const trimmedSearch = filters.search?.trim();
  if (trimmedSearch) {
    query = query.or(`entity_title.ilike.%${trimmedSearch}%,user_email.ilike.%${trimmedSearch}%`);
  }

  // Sorting: newest first
  query = query.order('created_at', { ascending: false });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Lỗi tải nhật ký hoạt động: ${error.message}`);
  }

  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    data: (data || []) as ActivityLogRow[],
    count: totalCount,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * Fetch summary metrics for top stats panel
 */
export const getActivitySummary = async (): Promise<ActivitySummary> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total count
  const { count: totalCount, error: totalErr } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true });

  if (totalErr) {
    throw new Error(`Lỗi tải thống kê nhật ký: ${totalErr.message}`);
  }

  // Today count
  const { count: todayCount } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Recent actors list
  const { data: recentLogs } = await supabase
    .from('activity_logs')
    .select('user_email')
    .order('created_at', { ascending: false })
    .limit(50);

  const distinctActors = Array.from(
    new Set(((recentLogs as any[]) || []).map((l: any) => l.user_email).filter(Boolean))
  ) as string[];


  return {
    total: totalCount || 0,
    today: todayCount || 0,
    recentActors: distinctActors,
  };
};
