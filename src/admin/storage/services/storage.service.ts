import { supabase } from '../../../lib/supabase';
import type { UploadImageParams, UploadImageResult } from '../types/storage.types';
import { 
  STORAGE_BUCKET, 
  validateImageFile, 
  buildStoragePath, 
  isManagedStorageUrl, 
  extractManagedStoragePath 
} from '../utils/storageUtils';

/**
 * Uploads an image file to Supabase Storage in the vuanhmedia-assets bucket
 */
export const uploadImage = async ({
  projectId,
  category,
  file,
}: UploadImageParams): Promise<UploadImageResult> => {
  if (!projectId || !projectId.trim()) {
    throw new Error('Vui lòng chọn dự án trước khi tải ảnh.');
  }

  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Ảnh không hợp lệ.');
  }

  const storagePath = buildStoragePath(projectId, category, file.type);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Không thể tải ảnh lên: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    publicUrl: urlData.publicUrl,
    storagePath: data.path,
    fileName: file.name,
    fileSize: file.size,
  };
};

/**
 * Safely deletes a managed storage object by its public URL
 * External URLs (YouTube, Unsplash, Google Drive, etc.) are ignored safely
 */
export const deleteManagedImageByUrl = async (url: string | null | undefined): Promise<boolean> => {
  if (!isManagedStorageUrl(url)) {
    return false; // External URL, do not touch
  }

  const storagePath = extractManagedStoragePath(url);
  if (!storagePath) {
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.warn(`[STORAGE-CLEANUP-WARN] Failed to delete storage object: ${storagePath}`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[STORAGE-CLEANUP-ERR] Exception removing storage object: ${storagePath}`, err);
    return false;
  }
};

/**
 * Safely deletes a managed storage object by path
 */
export const deleteManagedImageByPath = async (storagePath: string): Promise<boolean> => {
  if (!storagePath) return false;

  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.warn(`[STORAGE-CLEANUP-WARN] Failed to delete storage path: ${storagePath}`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[STORAGE-CLEANUP-ERR] Exception removing storage path: ${storagePath}`, err);
    return false;
  }
};
