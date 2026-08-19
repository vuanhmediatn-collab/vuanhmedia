import { supabase } from '../../../lib/supabase';
import type { ProjectRow, ProjectInsert, ProjectUpdate } from '../types/project.types';
import type { ProjectStatus } from '../../../types/database.types';

export interface GetProjectsParams {
  search?: string;
  status?: ProjectStatus | 'all';
  category?: string | 'all';
}

export const getProjects = async (params?: GetProjectsParams): Promise<ProjectRow[]> => {
  let query = supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params?.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Lỗi tải danh sách dự án: ${error.message}`);
  }

  let projects = ((data || []) as unknown) as ProjectRow[];

  if (params?.search && params.search.trim() !== '') {
    const term = params.search.trim().toLowerCase();
    projects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.client && p.client.toLowerCase().includes(term)) ||
        p.slug.toLowerCase().includes(term)
    );
  }

  return projects;
};

export const getProjectById = async (id: string): Promise<ProjectRow> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Lỗi tải thông tin dự án: ${error.message}`);
  }

  return data as unknown as ProjectRow;
};

export const createProject = async (payload: ProjectInsert): Promise<ProjectRow> => {
  const { data, error } = await (supabase.from('projects') as any)
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === '23505' || error.message.includes('unique') || error.message.includes('slug')) {
      throw new Error(`Đường dẫn tĩnh (slug) "${payload.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
    }
    throw new Error(`Lỗi tạo dự án mới: ${error.message}`);
  }

  return data as unknown as ProjectRow;
};

export const updateProject = async (id: string, payload: ProjectUpdate): Promise<ProjectRow> => {
  const { data, error } = await (supabase.from('projects') as any)
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505' || error.message.includes('unique') || error.message.includes('slug')) {
      throw new Error(`Đường dẫn tĩnh (slug) "${payload.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
    }
    throw new Error(`Lỗi cập nhật dự án: ${error.message}`);
  }


  return data as unknown as ProjectRow;
};

export const updateProjectStatus = async (id: string, status: ProjectStatus): Promise<ProjectRow> => {
  return updateProject(id, { status });
};

export const updateProjectFeatured = async (id: string, is_featured: boolean): Promise<ProjectRow> => {
  return updateProject(id, { is_featured });
};

export const archiveProject = async (id: string): Promise<ProjectRow> => {
  return updateProjectStatus(id, 'archived');
};

/**
 * Utility to generate clean, URL-friendly slug from title
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // remove special characters
    .trim()
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};
