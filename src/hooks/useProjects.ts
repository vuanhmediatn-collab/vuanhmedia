import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getPublishedProjects, type PublicProjectWithRelations } from '../services/projects.service';
import { supabase } from '../lib/supabase';

export const PROJECTS_QUERY_KEY = ['published_projects'] as const;

export const useProjects = () => {
  const queryClient = useQueryClient();

  const query = useQuery<PublicProjectWithRelations[], Error>({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: getPublishedProjects,
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
  });

  // Supabase Realtime Subscription for projects, project_videos, project_media
  useEffect(() => {
    const channel = supabase
      .channel('public:projects_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          if (import.meta.env.DEV) {
            console.log('[RT-PROJECTS-EVENT]', payload.eventType, new Date().toISOString());
          }
          queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_videos' },
        (payload) => {
          if (import.meta.env.DEV) {
            console.log('[RT-PROJECTS-EVENT-VIDEOS]', payload.eventType, new Date().toISOString());
          }
          queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_media' },
        (payload) => {
          if (import.meta.env.DEV) {
            console.log('[RT-PROJECTS-EVENT-MEDIA]', payload.eventType, new Date().toISOString());
          }
          queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && import.meta.env.DEV) {
          console.log('[RT-PROJECTS-SUBSCRIBED]');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};
