import { supabase } from '../../../lib/supabase';
import type { 
  SiteContentRow, 
  EnrichedSiteContentRow, 
  SiteContentSection, 
  ContentOverallSummary 
} from '../types/content.types';
import { hasUnpublishedChanges } from '../utils/contentCompare';
import { getHumanLabel, getSectionLabel, SECTION_LABELS } from '../utils/contentLabels';

/**
 * Enriches raw site_content rows with comparison and human labels
 */
export const enrichSiteContentRow = (row: SiteContentRow): EnrichedSiteContentRow => {
  const isChanged = hasUnpublishedChanges(row.draft_value, row.published_value);
  const humanLabel = getHumanLabel(row.content_key);
  const sectionLabel = getSectionLabel(row.section as SiteContentSection);

  return {
    ...row,
    isChanged,
    humanLabel,
    sectionLabel,
  };
};

/**
 * Fetch all 26 site_content rows for admin CMS
 */
export const getAdminSiteContent = async (): Promise<EnrichedSiteContentRow[]> => {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .order('section', { ascending: true })
    .order('content_key', { ascending: true });

  if (error) {
    throw new Error(`Lỗi tải danh mục nội dung: ${error.message}`);
  }

  const rows = (data || []) as SiteContentRow[];
  return rows.map(enrichSiteContentRow);
};

/**
 * Fetch site_content rows by specific section
 */
export const getAdminSiteContentBySection = async (
  section: SiteContentSection
): Promise<EnrichedSiteContentRow[]> => {
  const { data, error } = await supabase
    .from('site_content')
    .select('*')
    .eq('section', section)
    .order('content_key', { ascending: true });

  if (error) {
    throw new Error(`Lỗi tải nội dung phần ${section}: ${error.message}`);
  }

  const rows = (data || []) as SiteContentRow[];
  return rows.map(enrichSiteContentRow);
};

/**
 * Compute overall summary and pending change count
 */
export const computeContentSummary = (rows: EnrichedSiteContentRow[]): ContentOverallSummary => {
  const sectionKeys: SiteContentSection[] = ['hero', 'about', 'services', 'process', 'partners', 'contact'];
  
  const sections = sectionKeys.map((sec) => {
    const secRows = rows.filter((r) => r.section === sec);
    const pending = secRows.filter((r) => r.isChanged).length;
    return {
      section: sec,
      label: SECTION_LABELS[sec]?.name || sec,
      total: secRows.length,
      pending,
    };
  });

  const totalFields = rows.length;
  const pendingChanges = rows.filter((r) => r.isChanged).length;

  return {
    totalFields,
    pendingChanges,
    sections,
  };
};

/**
 * Save draft value for a content row without publishing
 * Updates ONLY draft_value
 */
export const saveDraft = async (id: string, draftValue: any): Promise<EnrichedSiteContentRow> => {
  const { data, error } = await (supabase.from('site_content') as any)
    .update({ draft_value: draftValue })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi lưu bản nháp: ${error.message}`);
  }

  return enrichSiteContentRow(data as SiteContentRow);
};

/**
 * Publish a single content row: sets published_value = draft_value
 */
export const publishContentField = async (id: string): Promise<EnrichedSiteContentRow> => {
  // First fetch the latest draft_value to prevent race conditions
  const { data: current, error: fetchErr } = await (supabase.from('site_content') as any)
    .select('draft_value')
    .eq('id', id)
    .single();

  if (fetchErr || !current) {
    throw new Error(`Lỗi lấy dữ liệu bản nháp: ${fetchErr?.message || 'Không tìm thấy dòng dữ liệu'}`);
  }

  const { data, error } = await (supabase.from('site_content') as any)
    .update({ published_value: current.draft_value })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi xuất bản trường nội dung: ${error.message}`);
  }

  return enrichSiteContentRow(data as SiteContentRow);
};

/**
 * Publish all changed rows in a given section
 */
export const publishSectionContent = async (section: SiteContentSection): Promise<void> => {
  const { data: rows, error: fetchErr } = await (supabase.from('site_content') as any)
    .select('*')
    .eq('section', section);

  if (fetchErr || !rows) {
    throw new Error(`Lỗi kiểm tra mục ${section}: ${fetchErr?.message}`);
  }

  const changedRows = (rows as SiteContentRow[]).filter((r) =>
    hasUnpublishedChanges(r.draft_value, r.published_value)
  );

  if (changedRows.length === 0) return;

  for (const row of changedRows) {
    const { error: updateErr } = await (supabase.from('site_content') as any)
      .update({ published_value: row.draft_value })
      .eq('id', row.id);

    if (updateErr) {
      throw new Error(`Lỗi xuất bản trường ${row.content_key}: ${updateErr.message}`);
    }
  }
};

/**
 * Publish all changed rows across the entire website
 */
export const publishAllChangedContent = async (): Promise<number> => {
  const { data: rows, error: fetchErr } = await (supabase.from('site_content') as any)
    .select('*');

  if (fetchErr || !rows) {
    throw new Error(`Lỗi kiểm tra danh mục nội dung: ${fetchErr?.message}`);
  }

  const changedRows = (rows as SiteContentRow[]).filter((r) =>
    hasUnpublishedChanges(r.draft_value, r.published_value)
  );

  if (changedRows.length === 0) return 0;

  for (const row of changedRows) {
    const { error: updateErr } = await (supabase.from('site_content') as any)
      .update({ published_value: row.draft_value })
      .eq('id', row.id);

    if (updateErr) {
      throw new Error(`Lỗi xuất bản trường ${row.content_key}: ${updateErr.message}`);
    }
  }

  return changedRows.length;
};

/**
 * Discard draft: resets draft_value to published_value
 */
export const discardDraft = async (id: string): Promise<EnrichedSiteContentRow> => {
  const { data: current, error: fetchErr } = await (supabase.from('site_content') as any)
    .select('published_value')
    .eq('id', id)
    .single();

  if (fetchErr || !current) {
    throw new Error(`Lỗi đọc nội dung xuất bản: ${fetchErr?.message}`);
  }

  const { data, error } = await (supabase.from('site_content') as any)
    .update({ draft_value: current.published_value })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Lỗi hoàn tác bản nháp: ${error.message}`);
  }

  return enrichSiteContentRow(data as SiteContentRow);
};
