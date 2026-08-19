import { useQuery } from '@tanstack/react-query';
import { getProjects, getProjectById, type GetProjectsParams } from '../services/project.service';
import type { ProjectRow } from '../types/project.types';

export const ADMIN_PROJECTS_QUERY_KEY = ['admin', 'projects'];

export const useProjects = (params?: GetProjectsParams) => {
  return useQuery<ProjectRow[], Error>({
    queryKey: [...ADMIN_PROJECTS_QUERY_KEY, params],
    queryFn: () => getProjects(params),
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
};

export const useProject = (id: string | null) => {
  return useQuery<ProjectRow, Error>({
    queryKey: [...ADMIN_PROJECTS_QUERY_KEY, id],
    queryFn: () => (id ? getProjectById(id) : Promise.reject(new Error('ID không hợp lệ'))),
    enabled: Boolean(id),
    staleTime: 10000,
  });
};
