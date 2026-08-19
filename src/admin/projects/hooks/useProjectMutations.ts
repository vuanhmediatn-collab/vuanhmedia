import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createProject, 
  updateProject, 
  updateProjectStatus, 
  updateProjectFeatured, 
  archiveProject 
} from '../services/project.service';
import type { ProjectInsert, ProjectUpdate } from '../types/project.types';
import type { ProjectStatus } from '../../../types/database.types';
import { ADMIN_PROJECTS_QUERY_KEY } from './useProjects';
import { ADMIN_DASHBOARD_QUERY_KEY } from '../../hooks/useAdminDashboard';

export const useProjectMutations = () => {
  const queryClient = useQueryClient();

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ['supabase-projects'] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: ProjectInsert) => createProject(payload),
    onSuccess: () => invalidateRelatedQueries(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectUpdate }) =>
      updateProject(id, payload),
    onSuccess: () => invalidateRelatedQueries(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      updateProjectStatus(id, status),
    onSuccess: () => invalidateRelatedQueries(),
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) =>
      updateProjectFeatured(id, is_featured),
    onSuccess: () => invalidateRelatedQueries(),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveProject(id),
    onSuccess: () => invalidateRelatedQueries(),
  });

  return {
    createMutation,
    updateMutation,
    statusMutation,
    toggleFeaturedMutation,
    archiveMutation,
  };
};
