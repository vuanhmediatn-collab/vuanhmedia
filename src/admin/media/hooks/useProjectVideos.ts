import { useQuery } from '@tanstack/react-query';
import { 
  getVideos, 
  getVideoById, 
  getAdminProjectsForMedia, 
  type VideoFilterParams 
} from '../services/media.service';
import type { EnrichedProjectVideo, ProjectOption } from '../types/media.types';

export const ADMIN_VIDEOS_QUERY_KEY = ['admin', 'media', 'videos'];
export const ADMIN_MEDIA_PROJECTS_QUERY_KEY = ['admin', 'media', 'projects'];

export const useProjectVideos = (params?: VideoFilterParams) => {
  return useQuery<EnrichedProjectVideo[], Error>({
    queryKey: [...ADMIN_VIDEOS_QUERY_KEY, params],
    queryFn: () => getVideos(params),
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
};

export const useVideo = (id: string | null) => {
  return useQuery<EnrichedProjectVideo, Error>({
    queryKey: ['admin', 'media', 'video', id],
    queryFn: () => (id ? getVideoById(id) : Promise.reject(new Error('ID không hợp lệ'))),
    enabled: Boolean(id),
    staleTime: 10000,
  });
};

export const useAdminProjectsForMedia = () => {
  return useQuery<ProjectOption[], Error>({
    queryKey: ADMIN_MEDIA_PROJECTS_QUERY_KEY,
    queryFn: getAdminProjectsForMedia,
    staleTime: 30000,
  });
};
