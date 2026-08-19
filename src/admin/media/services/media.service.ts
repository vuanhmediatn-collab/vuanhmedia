import { supabase } from '../../../lib/supabase';
import type { 
  EnrichedProjectVideo, 
  EnrichedProjectMedia, 
  ProjectOption, 
  VideoFormData, 
  ImageFormData 
} from '../types/media.types';
import type { VideoProvider } from '../../../types/database.types';
import { deriveThumbnail } from '../utils/videoUtils';
import { deleteManagedImageByUrl } from '../../storage/services/storage.service';

export interface VideoFilterParams {
  projectId?: string | 'all';
  status?: 'published' | 'hidden' | 'all';
  provider?: VideoProvider | 'all';
  search?: string;
}

export interface MediaFilterParams {
  projectId?: string | 'all';
  status?: 'published' | 'hidden' | 'all';
  search?: string;
}

/**
 * Fetch all projects for selection in media forms & filters
 */
export const getAdminProjectsForMedia = async (): Promise<ProjectOption[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, slug, client, status')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Lỗi tải danh mục dự án: ${error.message}`);
  }

  return ((data || []) as unknown) as ProjectOption[];
};


/**
 * Fetch video records with project relationships
 */
export const getVideos = async (params?: VideoFilterParams): Promise<EnrichedProjectVideo[]> => {
  let query = (supabase.from('project_videos') as any)
    .select(`
      id,
      project_id,
      title,
      video_url,
      provider,
      thumbnail,
      description,
      sort_order,
      status,
      created_at,
      updated_at,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (params?.projectId && params.projectId !== 'all') {
    query = query.eq('project_id', params.projectId);
  }

  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  if (params?.provider && params.provider !== 'all') {
    query = query.eq('provider', params.provider);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Lỗi tải danh sách video: ${error.message}`);
  }

  let videos = ((data || []) as unknown) as EnrichedProjectVideo[];

  if (params?.search && params.search.trim() !== '') {
    const term = params.search.trim().toLowerCase();
    videos = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        (v.project?.title && v.project.title.toLowerCase().includes(term)) ||
        v.video_url.toLowerCase().includes(term)
    );
  }

  return videos;
};

/**
 * Fetch single video by ID
 */
export const getVideoById = async (id: string): Promise<EnrichedProjectVideo> => {
  const { data, error } = await (supabase.from('project_videos') as any)
    .select(`
      *,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Lỗi tải video: ${error.message}`);
  }

  return data as EnrichedProjectVideo;
};

/**
 * Create a new video record
 * Safety Rules:
 * 1. Checks duplicate video_url in the same project.
 * 2. Defaults status to 'hidden'.
 * 3. Auto-derives YouTube thumbnail if empty.
 */
export const createVideo = async (payload: VideoFormData): Promise<EnrichedProjectVideo> => {
  const cleanUrl = payload.video_url.trim();

  // Application-level duplication check for same project
  const { data: existingRows, error: checkError } = await (supabase.from('project_videos') as any)
    .select('id')
    .eq('project_id', payload.project_id)
    .eq('video_url', cleanUrl);

  if (checkError) {
    throw new Error(`Lỗi kiểm tra trùng lặp: ${checkError.message}`);
  }

  if (existingRows && existingRows.length > 0) {
    throw new Error('Video này đã tồn tại trong dự án.');
  }

  // Derive thumbnail if YouTube & empty
  let finalThumbnail = payload.thumbnail?.trim() || null;
  if (!finalThumbnail && payload.provider === 'youtube') {
    finalThumbnail = deriveThumbnail(cleanUrl, 'youtube');
  }

  const insertData = {
    project_id: payload.project_id,
    title: payload.title.trim(),
    video_url: cleanUrl,
    provider: payload.provider,
    thumbnail: finalThumbnail,
    description: payload.description?.trim() || null,
    sort_order: payload.sort_order ?? 1,
    status: payload.status || 'hidden', // Explicit safety default
  };

  const { data, error } = await (supabase.from('project_videos') as any)
    .insert(insertData)
    .select(`
      *,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .single();

  if (error) {
    throw new Error(`Lỗi thêm video: ${error.message}`);
  }

  return data as EnrichedProjectVideo;
};

/**
 * Update an existing video record
 */
export const updateVideo = async (
  id: string,
  payload: Partial<VideoFormData>
): Promise<EnrichedProjectVideo> => {
  const updateData: Record<string, any> = {};

  if (payload.title !== undefined) updateData.title = payload.title.trim();
  if (payload.video_url !== undefined) {
    updateData.video_url = payload.video_url.trim();
  }
  if (payload.provider !== undefined) updateData.provider = payload.provider;
  if (payload.thumbnail !== undefined) {
    updateData.thumbnail = payload.thumbnail?.trim() || null;
  }
  if (payload.description !== undefined) {
    updateData.description = payload.description?.trim() || null;
  }
  if (payload.sort_order !== undefined) updateData.sort_order = payload.sort_order;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.project_id !== undefined) updateData.project_id = payload.project_id;

  // If YouTube and thumbnail is empty, try deriving
  if (
    updateData.provider === 'youtube' &&
    !updateData.thumbnail &&
    updateData.video_url
  ) {
    updateData.thumbnail = deriveThumbnail(updateData.video_url, 'youtube');
  }

  const { data, error } = await (supabase.from('project_videos') as any)
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .single();

  if (error) {
    throw new Error(`Lỗi cập nhật video: ${error.message}`);
  }

  return data as EnrichedProjectVideo;
};

/**
 * Delete a video record with safe storage cleanup for custom thumbnails
 */
export const deleteVideo = async (id: string): Promise<void> => {
  // Step 1: Read thumbnail URL before delete
  const { data: videoData } = await (supabase.from('project_videos') as any)
    .select('thumbnail')
    .eq('id', id)
    .single();

  // Step 2: Delete DB reference first
  const { error } = await (supabase.from('project_videos') as any)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Lỗi xóa video: ${error.message}`);
  }

  // Step 3: If DB delete succeeded and thumbnail is managed, cleanup storage
  if (videoData?.thumbnail) {
    deleteManagedImageByUrl(videoData.thumbnail);
  }
};


/**
 * Fetch project media (images) with project relationships
 */
export const getMedia = async (params?: MediaFilterParams): Promise<EnrichedProjectMedia[]> => {
  let query = (supabase.from('project_media') as any)
    .select(`
      id,
      project_id,
      media_type,
      file_url,
      caption,
      sort_order,
      status,
      created_at,
      updated_at,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .eq('media_type', 'image')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (params?.projectId && params.projectId !== 'all') {
    query = query.eq('project_id', params.projectId);
  }

  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Lỗi tải danh sách hình ảnh: ${error.message}`);
  }

  let mediaList = ((data || []) as unknown) as EnrichedProjectMedia[];

  if (params?.search && params.search.trim() !== '') {
    const term = params.search.trim().toLowerCase();
    mediaList = mediaList.filter(
      (m) =>
        (m.caption && m.caption.toLowerCase().includes(term)) ||
        (m.project?.title && m.project.title.toLowerCase().includes(term)) ||
        m.file_url.toLowerCase().includes(term)
    );
  }

  return mediaList;
};

/**
 * Fetch single media item by ID
 */
export const getMediaById = async (id: string): Promise<EnrichedProjectMedia> => {
  const { data, error } = await (supabase.from('project_media') as any)
    .select(`
      *,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Lỗi tải hình ảnh: ${error.message}`);
  }

  return data as EnrichedProjectMedia;
};

/**
 * Create a new image media record
 * Safety Rules:
 * 1. Enforces media_type = 'image'.
 * 2. Defaults status to 'hidden'.
 */
export const createMedia = async (payload: ImageFormData): Promise<EnrichedProjectMedia> => {
  const insertData = {
    project_id: payload.project_id,
    media_type: 'image',
    file_url: payload.file_url.trim(),
    caption: payload.caption?.trim() || null,
    sort_order: payload.sort_order ?? 1,
    status: payload.status || 'hidden', // Explicit safety default
  };

  const { data, error } = await (supabase.from('project_media') as any)
    .insert(insertData)
    .select(`
      *,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .single();

  if (error) {
    throw new Error(`Lỗi thêm hình ảnh: ${error.message}`);
  }

  return data as EnrichedProjectMedia;
};

/**
 * Update an existing image media record
 */
export const updateMedia = async (
  id: string,
  payload: Partial<ImageFormData>
): Promise<EnrichedProjectMedia> => {
  const updateData: Record<string, any> = {};

  if (payload.file_url !== undefined) updateData.file_url = payload.file_url.trim();
  if (payload.caption !== undefined) updateData.caption = payload.caption?.trim() || null;
  if (payload.sort_order !== undefined) updateData.sort_order = payload.sort_order;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.project_id !== undefined) updateData.project_id = payload.project_id;

  const { data, error } = await (supabase.from('project_media') as any)
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      project:projects (
        id,
        title,
        slug,
        status
      )
    `)
    .single();

  if (error) {
    throw new Error(`Lỗi cập nhật hình ảnh: ${error.message}`);
  }

  return data as EnrichedProjectMedia;
};

/**
 * Delete a media record with safe storage cleanup
 */
export const deleteMedia = async (id: string): Promise<void> => {
  // Step 1: Read file URL before delete
  const { data: mediaData } = await (supabase.from('project_media') as any)
    .select('file_url')
    .eq('id', id)
    .single();

  // Step 2: Delete DB reference first
  const { error } = await (supabase.from('project_media') as any)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Lỗi xóa hình ảnh: ${error.message}`);
  }

  // Step 3: If DB delete succeeded and file_url was managed, attempt storage cleanup
  if (mediaData?.file_url) {
    deleteManagedImageByUrl(mediaData.file_url);
  }
};

