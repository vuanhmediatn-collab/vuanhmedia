import { useQuery } from '@tanstack/react-query';
import { getPublicSiteContent, mapSiteContentRecords, type SiteContentMap } from '../services/siteContent.service';
import { getMappedContent } from '../utils/contentMapper';

export const SITE_CONTENT_QUERY_KEY = ['public_site_content'] as const;

export const useSiteContent = () => {
  const query = useQuery<SiteContentMap, Error>({
    queryKey: SITE_CONTENT_QUERY_KEY,
    queryFn: async () => {
      const records = await getPublicSiteContent();
      return mapSiteContentRecords(records);
    },
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
  });

  const mappedContent = getMappedContent(query.data);

  return {
    ...query,
    content: mappedContent,
  };
};
