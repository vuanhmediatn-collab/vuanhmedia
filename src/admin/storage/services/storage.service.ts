import { supabase } from '../../../lib/supabase';
import type { UploadImageParams, UploadImageResult } from '../types/storage.types';
import { 
  STORAGE_BUCKET, 
  validateImageFile, 
  buildStoragePath, 
  compressImageIfLarge,
  isManagedStorageUrl, 
  extractManagedStoragePath 
} from '../utils/storageUtils';

/**
 * Uploads an image or video file to Supabase Storage in the vuanhmedia-assets bucket
 * Automatically applies client-side WebP compression for large DSLR photos (>1.5MB)
 * Supports files up to 50 MB (Supabase 100% Free Tier limit)
 */
export const uploadImage = async ({
  projectId,
  category,
  file,
}: UploadImageParams): Promise<UploadImageResult> => {
  if (!projectId || !projectId.trim()) {
    throw new Error('Vui lòng chọn dự án trước khi tải lên.');
  }

  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Tệp không hợp lệ.');
  }

  // Apply smart client-side WebP compression if the file is a large image
  const fileToUpload = await compressImageIfLarge(file);

  const storagePath = buildStoragePath(projectId, category, fileToUpload.type, fileToUpload.name);

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Không thể tải tệp lên: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    publicUrl: urlData.publicUrl,
    storagePath: data.path,
    fileName: fileToUpload.name,
    fileSize: fileToUpload.size,
  };
};

export const uploadMedia = uploadImage;

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
