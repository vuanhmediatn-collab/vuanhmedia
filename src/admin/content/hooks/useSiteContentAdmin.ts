import { useQuery } from '@tanstack/react-query';
import { 
  getAdminSiteContent, 
  computeContentSummary 
} from '../services/content.service';
import type { EnrichedSiteContentRow, ContentOverallSummary } from '../types/content.types';

export const ADMIN_CONTENT_QUERY_KEY = ['admin', 'content'] as const;

export const useSiteContentAdmin = () => {
  const query = useQuery<EnrichedSiteContentRow[], Error>({
    queryKey: ADMIN_CONTENT_QUERY_KEY,
    queryFn: getAdminSiteContent,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });

  const summary: ContentOverallSummary = computeContentSummary(query.data || []);

  return {
    ...query,
    rows: query.data || [],
    summary,
  };
};
