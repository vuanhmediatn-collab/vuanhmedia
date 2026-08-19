import type { Database } from '../../../types/database.types';

export type SiteContentSection = 'hero' | 'about' | 'services' | 'process' | 'partners' | 'contact';

export type SiteContentRow = Database['public']['Tables']['site_content']['Row'];
export type SiteContentInsert = Database['public']['Tables']['site_content']['Insert'];
export type SiteContentUpdate = Database['public']['Tables']['site_content']['Update'];

export interface EnrichedSiteContentRow extends SiteContentRow {
  isChanged: boolean;
  humanLabel: string;
  sectionLabel: string;
}

export interface SectionSummary {
  section: SiteContentSection;
  label: string;
  total: number;
  pending: number;
}

export interface ContentOverallSummary {
  totalFields: number;
  pendingChanges: number;
  sections: SectionSummary[];
}
