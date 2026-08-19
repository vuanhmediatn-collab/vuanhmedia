import { useState, useCallback } from 'react';
import { uploadImage, deleteManagedImageByPath } from '../services/storage.service';
import type { StorageCategory, UploadImageResult } from '../types/storage.types';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      projectId: string,
      category: StorageCategory,
      file: File
    ): Promise<UploadImageResult> => {
      setIsUploading(true);
      setUploadError(null);

      try {
        const result = await uploadImage({ projectId, category, file });
        return result;
      } catch (err: any) {
        const message = err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.';
        setUploadError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const cleanupFailedUpload = useCallback(async (storagePath: string) => {
    if (storagePath) {
      await deleteManagedImageByPath(storagePath);
    }
  }, []);

  return {
    upload,
    cleanupFailedUpload,
    isUploading,
    uploadError,
    setUploadError,
  };
};
