import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  createVideo, 
  updateVideo, 
  deleteVideo, 
  createMedia, 
  updateMedia, 
  deleteMedia 
} from '../services/media.service';
import type { VideoFormData, ImageFormData } from '../types/media.types';
import { ADMIN_VIDEOS_QUERY_KEY } from './useProjectVideos';
import { ADMIN_MEDIA_IMAGES_QUERY_KEY } from './useProjectMedia';
import { ADMIN_DASHBOARD_QUERY_KEY } from '../../hooks/useAdminDashboard';
import { PROJECTS_QUERY_KEY } from '../../../hooks/useProjects';

export const useMediaMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAllMediaQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    queryClient.invalidateQueries({ queryKey: ADMIN_VIDEOS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_MEDIA_IMAGES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
  };

  // Video Mutations
  const createVideoMutation = useMutation({
    mutationFn: (payload: VideoFormData) => createVideo(payload),
    onSuccess: () => invalidateAllMediaQueries(),
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VideoFormData> }) =>
      updateVideo(id, payload),
    onSuccess: () => invalidateAllMediaQueries(),
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => invalidateAllMediaQueries(),
  });

  // Image Media Mutations
  const createMediaMutation = useMutation({
    mutationFn: (payload: ImageFormData) => createMedia(payload),
    onSuccess: () => invalidateAllMediaQueries(),
  });

  const updateMediaMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ImageFormData> }) =>
      updateMedia(id, payload),
    onSuccess: () => invalidateAllMediaQueries(),
  });

  const deleteMediaMutation = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => invalidateAllMediaQueries(),
  });

  return {
    createVideoMutation,
    updateVideoMutation,
    deleteVideoMutation,
    createMediaMutation,
    updateMediaMutation,
    deleteMediaMutation,
  };
};
