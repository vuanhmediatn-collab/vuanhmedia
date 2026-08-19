import { supabase } from '../../lib/supabase';
import type { ProjectStatus } from '../../types/database.types';

export interface ProjectSummary {
  total: number;
  published: number;
  draft: number;
  hidden: number;
  archived: number;
}

export interface ContentSummary {
  total: number;
  pendingChangesCount: number;
  lastUpdatedAt: string | null;
}

export interface MediaSummary {
  totalVideos: number;
  totalMedia: number;
  totalAssets: number;
}

export interface AdminProjectItem {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  category: string;
  year: string | null;
  is_featured: boolean;
  status: ProjectStatus;
  updated_at: string;
}

export interface AdminActivityLogItem {
  id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  created_at: string;
}

export interface DashboardData {
  projectSummary: ProjectSummary;
  contentSummary: ContentSummary;
  mediaSummary: MediaSummary;
  recentProjects: AdminProjectItem[];
  activityLogs: AdminActivityLogItem[];
}

export const fetchAdminDashboardData = async (): Promise<DashboardData> => {
  // 1. Query Projects
  const projectsPromise = supabase
    .from('projects')
    .select('id, title, slug, client, category, year, is_featured, status, updated_at')
    .order('updated_at', { ascending: false });

  // 2. Query Site Content
  const siteContentPromise = supabase
    .from('site_content')
    .select('id, section, content_key, draft_value, published_value, updated_at')
    .order('updated_at', { ascending: false });

  // 3. Query Project Videos count
  const videosPromise = supabase
    .from('project_videos')
    .select('id', { count: 'exact', head: true });

  // 4. Query Project Media count
  const mediaPromise = supabase
    .from('project_media')
    .select('id', { count: 'exact', head: true });

  // 5. Query Activity Logs
  const activityLogsPromise = supabase
    .from('activity_logs')
    .select('id, user_email, action, entity_type, entity_id, entity_title, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  const [
    projectsRes,
    contentRes,
    videosRes,
    mediaRes,
    activityRes,
  ] = await Promise.all([
    projectsPromise,
    siteContentPromise,
    videosPromise,
    mediaPromise,
    activityLogsPromise,
  ]);

  if (projectsRes.error) {
    throw new Error(`Failed to load projects: ${projectsRes.error.message}`);
  }
  if (contentRes.error) {
    throw new Error(`Failed to load website content: ${contentRes.error.message}`);
  }
  if (videosRes.error) {
    throw new Error(`Failed to load video stats: ${videosRes.error.message}`);
  }
  if (mediaRes.error) {
    throw new Error(`Failed to load media stats: ${mediaRes.error.message}`);
  }
  if (activityRes.error) {
    throw new Error(`Failed to load activity logs: ${activityRes.error.message}`);
  }

  // Calculate Project Summary
  const allProjects = (projectsRes.data || []) as AdminProjectItem[];
  const projectSummary: ProjectSummary = {
    total: allProjects.length,
    published: allProjects.filter((p) => p.status === 'published').length,
    draft: allProjects.filter((p) => p.status === 'draft').length,
    hidden: allProjects.filter((p) => p.status === 'hidden').length,
    archived: allProjects.filter((p) => p.status === 'archived').length,
  };

interface SiteContentRow {
  id: string;
  section: string;
  content_key: string;
  draft_value: any;
  published_value: any;
  updated_at: string;
}

  // Calculate Content Summary (pending draft vs published differences)
  const allContent = (contentRes.data || []) as SiteContentRow[];

  let pendingChangesCount = 0;
  let latestContentUpdated: string | null = null;

  for (const row of allContent) {
    const draftStr = JSON.stringify(row.draft_value ?? null);
    const publishedStr = JSON.stringify(row.published_value ?? null);
    if (draftStr !== publishedStr) {
      pendingChangesCount++;
    }
    if (row.updated_at) {
      if (!latestContentUpdated || new Date(row.updated_at) > new Date(latestContentUpdated)) {
        latestContentUpdated = row.updated_at;
      }
    }
  }

  const contentSummary: ContentSummary = {
    total: allContent.length,
    pendingChangesCount,
    lastUpdatedAt: latestContentUpdated,
  };

  // Calculate Media Summary
  const totalVideos = videosRes.count ?? 0;
  const totalMedia = mediaRes.count ?? 0;
  const mediaSummary: MediaSummary = {
    totalVideos,
    totalMedia,
    totalAssets: totalVideos + totalMedia,
  };

  return {
    projectSummary,
    contentSummary,
    mediaSummary,
    recentProjects: allProjects.slice(0, 8),
    activityLogs: (activityRes.data || []) as AdminActivityLogItem[],
  };
};
