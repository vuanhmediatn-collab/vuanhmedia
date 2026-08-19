export type StorageCategory = 'gallery' | 'cover' | 'thumbnail' | 'video-thumbnails';

export interface UploadImageParams {
  projectId: string;
  category: StorageCategory;
  file: File;
}

export interface UploadImageResult {
  publicUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}
