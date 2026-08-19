import type { Database, VideoProvider } from '../../../types/database.types';

export type ProjectVideoRow = Database['public']['Tables']['project_videos']['Row'];
export type ProjectVideoInsert = Database['public']['Tables']['project_videos']['Insert'];
export type ProjectVideoUpdate = Database['public']['Tables']['project_videos']['Update'];

export type ProjectMediaRow = Database['public']['Tables']['project_media']['Row'];
export type ProjectMediaInsert = Database['public']['Tables']['project_media']['Insert'];
export type ProjectMediaUpdate = Database['public']['Tables']['project_media']['Update'];

export interface ProjectOption {
  id: string;
  title: string;
  slug: string;
  client?: string | null;
  status: 'published' | 'draft' | 'hidden' | 'archived';
}

export interface EnrichedProjectVideo extends ProjectVideoRow {
  project?: {
    id: string;
    title: string;
    slug: string;
    client?: string | null;
    status: 'published' | 'draft' | 'hidden' | 'archived';
  } | null;
}

export interface EnrichedProjectMedia extends ProjectMediaRow {
  project?: {
    id: string;
    title: string;
    slug: string;
    client?: string | null;
    status: 'published' | 'draft' | 'hidden' | 'archived';
  } | null;
}

export interface MediaFilterState {
  projectId: string | 'all';
  status: 'published' | 'hidden' | 'all';
  provider: VideoProvider | 'all';
  search: string;
}

export interface VideoFormData {
  project_id: string;
  title: string;
  video_url: string;
  provider: VideoProvider;
  thumbnail: string;
  description: string;
  sort_order: number;
  status: 'published' | 'hidden';
}

export interface ImageFormData {
  project_id: string;
  file_url: string;
  caption: string;
  sort_order: number;
  status: 'published' | 'hidden';
}
