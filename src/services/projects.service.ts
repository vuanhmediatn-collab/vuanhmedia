import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectVideoRow = Database['public']['Tables']['project_videos']['Row'];
export type ProjectMediaRow = Database['public']['Tables']['project_media']['Row'];

export interface PublicProjectWithRelations extends ProjectRow {
  videos: ProjectVideoRow[];
  media: ProjectMediaRow[];
}

/**
 * Fetch all published projects ordered by sort_order ASC,
 * including their published videos and media.
 */
export const getPublishedProjects = async (): Promise<PublicProjectWithRelations[]> => {
  const { data: rawProjects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (projectsError) {
    console.error('Error fetching published projects:', projectsError);
    throw projectsError;
  }

  const projects = (rawProjects || []) as ProjectRow[];

  if (projects.length === 0) {
    return [];
  }

  const projectIds = projects.map((p) => p.id);

  // Fetch published videos for these projects
  const { data: rawVideos, error: videosError } = await supabase
    .from('project_videos')
    .select('*')
    .in('project_id', projectIds)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (videosError) {
    console.error('Error fetching project videos:', videosError);
    throw videosError;
  }

  const videos = (rawVideos || []) as ProjectVideoRow[];

  // Fetch published media for these projects
  const { data: rawMedia, error: mediaError } = await supabase
    .from('project_media')
    .select('*')
    .in('project_id', projectIds)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (mediaError) {
    console.error('Error fetching project media:', mediaError);
    throw mediaError;
  }

  const media = (rawMedia || []) as ProjectMediaRow[];

  return projects.map((project) => ({
    ...project,
    videos: videos.filter((v) => v.project_id === project.id),
    media: media.filter((m) => m.project_id === project.id),
  }));
};

/**
 * Fetch a single published project by its canonical slug
 */
export const getPublishedProjectBySlug = async (
  slug: string
): Promise<PublicProjectWithRelations | null> => {
  const { data: rawProject, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (projectError) {
    console.error(`Error fetching project by slug (${slug}):`, projectError);
    throw projectError;
  }

  if (!rawProject) return null;

  const project = rawProject as ProjectRow;

  const { data: rawVideos } = await supabase
    .from('project_videos')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  const { data: rawMedia } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', project.id)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  const videos = (rawVideos || []) as ProjectVideoRow[];
  const media = (rawMedia || []) as ProjectMediaRow[];

  return {
    ...project,
    videos,
    media,
  };
};
