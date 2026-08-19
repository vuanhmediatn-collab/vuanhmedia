import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  saveDraft, 
  publishContentField, 
  publishSectionContent, 
  publishAllChangedContent, 
  discardDraft 
} from '../services/content.service';
import type { SiteContentSection } from '../types/content.types';
import { ADMIN_CONTENT_QUERY_KEY } from './useSiteContentAdmin';
import { ADMIN_DASHBOARD_QUERY_KEY } from '../../hooks/useAdminDashboard';
import { SITE_CONTENT_QUERY_KEY } from '../../../hooks/useSiteContent';

export const useContentMutations = () => {
  const queryClient = useQueryClient();

  const invalidateContentQueries = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_CONTENT_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: SITE_CONTENT_QUERY_KEY });
  };

  const saveDraftMutation = useMutation({
    mutationFn: ({ id, draftValue }: { id: string; draftValue: any }) =>
      saveDraft(id, draftValue),
    onSuccess: () => invalidateContentQueries(),
  });

  const publishFieldMutation = useMutation({
    mutationFn: (id: string) => publishContentField(id),
    onSuccess: () => invalidateContentQueries(),
  });

  const publishSectionMutation = useMutation({
    mutationFn: (section: SiteContentSection) => publishSectionContent(section),
    onSuccess: () => invalidateContentQueries(),
  });

  const publishAllMutation = useMutation({
    mutationFn: () => publishAllChangedContent(),
    onSuccess: () => invalidateContentQueries(),
  });

  const discardDraftMutation = useMutation({
    mutationFn: (id: string) => discardDraft(id),
    onSuccess: () => invalidateContentQueries(),
  });

  return {
    saveDraftMutation,
    publishFieldMutation,
    publishSectionMutation,
    publishAllMutation,
    discardDraftMutation,
  };
};
