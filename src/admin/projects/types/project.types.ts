import type { ProjectStatus, Database } from '../../../types/database.types';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export interface ProjectFilterState {
  search: string;
  status: ProjectStatus | 'all';
  category: string | 'all';
}

export interface ProjectFormData {
  title: string;
  slug: string;
  client: string;
  category: string;
  year: string;
  short_description: string;
  full_description: string;
  scope_of_work: string;
  role_played: string;
  cover_image: string;
  thumbnail: string;
  sort_order: number;
  is_featured: boolean;
  status: ProjectStatus;
}
