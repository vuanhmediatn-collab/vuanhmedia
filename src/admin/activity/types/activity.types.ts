import type { Database } from '../../../types/database.types';

export type ActivityLogRow = Database['public']['Tables']['activity_logs']['Row'];

export type ActivityAction =
  | 'CREATE'
  | 'UPDATE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE'
  | 'REORDER'
  | 'DELETE'
  | string;

export type ActivityEntityType =
  | 'project'
  | 'project_video'
  | 'project_media'
  | 'site_content'
  | string;

export type QuickFilterKey = 'all' | 'project' | 'project_video' | 'project_media' | 'site_content' | 'today';

export interface ActivityFiltersState {
  search: string;
  entityType: string;
  action: string;
  userEmail: string;
  quickFilter: QuickFilterKey;
}

export interface ActivityLogsResponse {
  data: ActivityLogRow[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActivitySummary {
  total: number;
  today: number;
  recentActors: string[];
}
