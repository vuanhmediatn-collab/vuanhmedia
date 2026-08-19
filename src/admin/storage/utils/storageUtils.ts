import type { StorageCategory, ImageValidationResult } from '../types/storage.types';

export const STORAGE_BUCKET = 'vuanhmedia-assets';
export const STORAGE_ORIGIN = 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
export const STORAGE_PUBLIC_PREFIX = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

export const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const VALIDATION_ERROR_MSG = 'Ảnh phải là JPG, PNG hoặc WebP và dung lượng không vượt quá 20 MB.';

/**
 * Validates file type and size on the client before upload
 */
export const validateImageFile = (file: File): ImageValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Không có tệp nào được chọn.' };
  }

  // Check size
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { isValid: false, error: VALIDATION_ERROR_MSG };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { isValid: false, error: VALIDATION_ERROR_MSG };
  }

  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: VALIDATION_ERROR_MSG };
  }

  return { isValid: true };
};

/**
 * Builds standard storage path with unique UUID filename
 * projects/{projectId}/{category}/{uuid}.{ext}
 */
export const buildStoragePath = (
  projectId: string,
  category: StorageCategory,
  mimeType: string
): string => {
  let ext = 'jpg';
  const lowerMime = mimeType.toLowerCase();
  if (lowerMime === 'image/png') ext = 'png';
  else if (lowerMime === 'image/webp') ext = 'webp';

  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return `projects/${projectId}/${category}/${uniqueId}.${ext}`;
};

/**
 * Checks if a value is a managed Supabase Storage URL
 * Must match exact origin (https://rjylcqtiicmhhhpuxuyw.supabase.co)
 * and exact public prefix (/storage/v1/object/public/vuanhmedia-assets/)
 */
export function isManagedStorageUrl(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.origin === STORAGE_ORIGIN &&
      url.pathname.startsWith(STORAGE_PUBLIC_PREFIX)
    );
  } catch {
    return false;
  }
}

/**
 * Extracts relative storage path from a managed public URL
 * Rejects empty path, external origins, other buckets, or invalid URLs
 */
export function extractManagedStoragePath(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null;
  if (!isManagedStorageUrl(value)) return null;

  try {
    const url = new URL(value);
    const relativePath = url.pathname.slice(STORAGE_PUBLIC_PREFIX.length);
    const cleanPath = relativePath.split('?')[0].split('#')[0].trim();
    return cleanPath.length > 0 ? cleanPath : null;
  } catch {
    return null;
  }
}

/**
 * Formats byte size into human readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
