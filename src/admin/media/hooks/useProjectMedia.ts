import { useQuery } from '@tanstack/react-query';
import { 
  getMedia, 
  getMediaById, 
  type MediaFilterParams 
} from '../services/media.service';
import type { EnrichedProjectMedia } from '../types/media.types';

export const ADMIN_MEDIA_IMAGES_QUERY_KEY = ['admin', 'media', 'images'];

export const useProjectMedia = (params?: MediaFilterParams) => {
  return useQuery<EnrichedProjectMedia[], Error>({
    queryKey: [...ADMIN_MEDIA_IMAGES_QUERY_KEY, params],
    queryFn: () => getMedia(params),
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
};

export const useMediaItem = (id: string | null) => {
  return useQuery<EnrichedProjectMedia, Error>({
    queryKey: ['admin', 'media', 'image', id],
    queryFn: () => (id ? getMediaById(id) : Promise.reject(new Error('ID không hợp lệ'))),
    enabled: Boolean(id),
    staleTime: 10000,
  });
};
