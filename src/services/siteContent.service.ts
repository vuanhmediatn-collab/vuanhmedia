import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

export type PublicSiteContentRow = Database['public']['Views']['public_site_content']['Row'];

export type SiteContentMap = Record<string, any>;

/**
 * Fetch all published site content records from the public_site_content security view
 */
export const getPublicSiteContent = async (): Promise<PublicSiteContentRow[]> => {
  const { data, error } = await supabase
    .from('public_site_content')
    .select('*');

  if (error) {
    console.error('Error fetching public site content:', error);
    throw error;
  }

  return data || [];
};

/**
 * Transforms an array of PublicSiteContentRow into a convenient dictionary key-value map
 */
export const mapSiteContentRecords = (records: PublicSiteContentRow[]): SiteContentMap => {
  const map: SiteContentMap = {};
  for (const record of records) {
    map[record.content_key] = record.published_value;
  }
  return map;
};
