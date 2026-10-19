import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Video, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import type { EnrichedProjectVideo, ProjectOption, VideoFormData } from '../types/media.types';
import type { VideoProvider } from '../../../types/database.types';
import { detectVideoProvider, deriveThumbnail } from '../utils/videoUtils';
import { ProjectCombobox } from './ProjectCombobox';
import { ImageUploader } from '../../storage/components/ImageUploader';
import { useImageUpload } from '../../storage/hooks/useImageUpload';
import { deleteManagedImageByUrl } from '../../storage/services/storage.service';

interface VideoFormDrawerProps {
  isOpen: boolean;
  videoToEdit: EnrichedProjectVideo | null;
  projects: ProjectOption[];
  defaultProjectId?: string;
  defaultSortOrder: number;
  isSaving: boolean;
  onSave: (data: VideoFormData, id?: string) => Promise<void>;
  onClose: () => void;
  onCreateNewProject?: () => void;
}

const INITIAL_VIDEO_FORM: VideoFormData = {
  project_id: '',
  title: '',
  video_url: '',
  provider: 'youtube',
  thumbnail: '',
  description: '',
  sort_order: 1,
  status: 'hidden', // Explicit default
};

export const VideoFormDrawer: React.FC<VideoFormDrawerProps> = ({
  isOpen,
  videoToEdit,
  projects,
  defaultProjectId,
  defaultSortOrder,
  isSaving,
  onSave,
  onClose,
  onCreateNewProject,
}) => {
  const [formData, setFormData] = useState<VideoFormData>(INITIAL_VIDEO_FORM);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [detectedNotice, setDetectedNotice] = useState<string | null>(null);

  const { upload, cleanupFailedUpload, isUploading } = useImageUpload();

  // Initialize form when drawer opens or editing target changes
  useEffect(() => {
    if (isOpen) {
      if (videoToEdit) {
        setFormData({
          project_id: videoToEdit.project_id || '',
          title: videoToEdit.title || '',
          video_url: videoToEdit.video_url || '',
          provider: (videoToEdit.provider as VideoProvider) || 'youtube',
          thumbnail: videoToEdit.thumbnail || '',
          description: videoToEdit.description || '',
          sort_order: videoToEdit.sort_order ?? 1,
          status: (videoToEdit.status as 'published' | 'hidden') || 'hidden',
        });
      } else {
        const isValidProject = Boolean(
          defaultProjectId && projects.some((p) => p.id === defaultProjectId)
        );
        setFormData((prev) => ({
          ...prev,
          project_id: isValidProject ? (defaultProjectId as string) : prev.project_id || '',
          sort_order: prev.sort_order || defaultSortOrder,
          status: 'hidden',
        }));
      }
      setSelectedThumbnailFile(null);
      setSelectedVideoFile(null);
      setValidationError(null);
      setDetectedNotice(null);
    } else {
      setFormData(INITIAL_VIDEO_FORM);
      setSelectedThumbnailFile(null);
      setSelectedVideoFile(null);
      setValidationError(null);
      setDetectedNotice(null);
    }
  }, [isOpen, videoToEdit]);

  useEffect(() => {
    if (isOpen && defaultProjectId && projects.some((p) => p.id === defaultProjectId)) {
      setFormData((prev) => ({ ...prev, project_id: defaultProjectId }));
    }
  }, [defaultProjectId, projects, isOpen]);

  if (!isOpen) return null;

  const handleUrlChange = (url: string) => {
    const detected = detectVideoProvider(url);
    if (detected) {
      const derivedThumb = !formData.thumbnail ? deriveThumbnail(url, detected) : formData.thumbnail;
      setFormData((prev) => ({
        ...prev,
        video_url: url,
        provider: detected,
        thumbnail: derivedThumb || prev.thumbnail,
      }));
      setDetectedNotice(`Đã tự động nhận diện nền tảng: ${detected.toUpperCase()}`);
    } else {
      setFormData((prev) => ({ ...prev, video_url: url }));
      setDetectedNotice(null);
    }
  };

  const handleAutoDeriveThumb = () => {
    const derived = deriveThumbnail(formData.video_url, formData.provider);
    if (derived) {
      setSelectedThumbnailFile(null);
      setFormData((prev) => ({ ...prev, thumbnail: derived }));
    } else {
      setValidationError('Chỉ hỗ trợ tự động lấy ảnh bìa từ liên kết YouTube hợp lệ.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.project_id || !formData.project_id.trim()) {
      setValidationError('Vui lòng chọn dự án.');
      return;
    }

    if (!formData.title.trim()) {
      setValidationError('Vui lòng nhập Tiêu đề video.');
      return;
    }

    if (!formData.video_url.trim() && !selectedVideoFile) {
      setValidationError('Vui lòng tải lên tệp video hoặc nhập liên kết video.');
      return;
    }

    let finalVideoUrl = formData.video_url.trim();
    let finalProvider = formData.provider;
    let uploadedVideoPath: string | null = null;
    let uploadedThumbPath: string | null = null;
    const oldThumbnailUrl = videoToEdit?.thumbnail;

    // Step 1: Upload Video File if selected
    if (selectedVideoFile) {
      try {
        const videoUploadResult = await upload(
          formData.project_id,
          'videos',
          selectedVideoFile
        );
        finalVideoUrl = videoUploadResult.publicUrl;
        uploadedVideoPath = videoUploadResult.storagePath;
        finalProvider = 'direct';
      } catch (videoErr: any) {
        setValidationError(videoErr.message || 'Không thể tải tệp video lên.');
        return;
      }
    }

    // Step 2: Upload custom thumbnail if selected
    let finalThumbnailUrl = formData.thumbnail?.trim() || '';
    if (selectedThumbnailFile) {
      try {
        const uploadResult = await upload(
          formData.project_id,
          'video-thumbnails',
          selectedThumbnailFile
        );
        finalThumbnailUrl = uploadResult.publicUrl;
        uploadedThumbPath = uploadResult.storagePath;
      } catch (uploadErr: any) {
        if (uploadedVideoPath) {
          await cleanupFailedUpload(uploadedVideoPath);
        }
        setValidationError(uploadErr.message || 'Không thể tải ảnh đại diện video lên.');
        return;
      }
    } else if (!finalThumbnailUrl && finalProvider === 'youtube') {
      finalThumbnailUrl = deriveThumbnail(finalVideoUrl, 'youtube') || '';
    }

    try {
      await onSave(
        {
          ...formData,
          title: formData.title.trim(),
          video_url: finalVideoUrl,
          provider: finalProvider,
          thumbnail: finalThumbnailUrl,
          description: formData.description.trim(),
        },
        videoToEdit?.id
      );

      // Cleanup old thumbnail if updated
      if (videoToEdit && oldThumbnailUrl && oldThumbnailUrl !== finalThumbnailUrl) {
        deleteManagedImageByUrl(oldThumbnailUrl);
      }
    } catch (err: any) {
      if (uploadedVideoPath) {
        await cleanupFailedUpload(uploadedVideoPath);
      }
      if (uploadedThumbPath) {
        await cleanupFailedUpload(uploadedThumbPath);
      }
      setValidationError(err.message || 'Lỗi lưu thông tin video.');
    }
  };

  const isFormSubmitting = isSaving || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
                {videoToEdit ? 'Chỉnh sửa Video Clip' : 'Thêm Video mới'}
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {videoToEdit ? `ID: ${videoToEdit.id}` : 'Tải video trực tiếp (tối đa 50MB - 0đ) hoặc nhúng YouTube/Drive'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isFormSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form id="video-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Searchable Project Combobox */}
          <ProjectCombobox
            projects={projects}
            selectedProjectId={formData.project_id}
            onSelectProject={(id) => setFormData((prev) => ({ ...prev, project_id: id }))}
            onCreateNewProject={onCreateNewProject}
            error={validationError && !formData.project_id ? validationError : null}
            disabled={isFormSubmitting}
          />

          {/* Video Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Tiêu đề Video <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isFormSubmitting}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ví dụ: TVC Bản chính thức 60s"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
            />
          </div>

          {/* Video Media Uploader & URL Picker */}
          <div className="space-y-1.5">
            <ImageUploader
              label="Tệp hoặc Liên kết Video"
              helperText="Tải MP4/WebM từ máy (Tối đa 50 MB - 0đ Miễn phí) hoặc chuyển sang dùng URL YouTube/Drive"
              projectId={formData.project_id}
              currentUrl={formData.video_url}
              selectedFile={selectedVideoFile}
              onFileSelect={(file) => {
                setSelectedVideoFile(file);
                if (file) {
                  setFormData((prev) => ({
                    ...prev,
                    provider: 'direct',
                    title: prev.title ? prev.title : file.name.replace(/\.[^.]+$/, ''),
                  }));
                }
              }}
              onUrlChange={(url) => handleUrlChange(url)}
              isUploading={isUploading}
              disabled={isFormSubmitting}
              allowDirectUpload={true}
              allowVideo={true}
              required={!formData.video_url && !selectedVideoFile}
            />
            {detectedNotice && (
              <span className="text-[11px] font-semibold text-emerald-600 block">
                ✓ {detectedNotice}
              </span>
            )}
          </div>

          {/* Provider, Sort Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="space-y-1">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-600">
                Nền tảng (Provider)
              </label>
              <select
                disabled={isFormSubmitting}
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value as VideoProvider })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0b1329] cursor-pointer"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="drive">Google Drive</option>
                <option value="direct">MP4 / WebM Trực tiếp (50MB Free)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-600">
                Thứ tự sắp xếp
              </label>
              <input
                type="number"
                disabled={isFormSubmitting}
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0b1329]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-600">
                Trạng thái
              </label>
              <select
                disabled={isFormSubmitting}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'hidden' })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0b1329] cursor-pointer"
              >
                <option value="hidden">Đang ẩn (Mặc định)</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </div>
          </div>

          {/* Integrated ImageUploader for Video Thumbnail */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Ảnh bìa video (Thumbnail)
              </span>
              {formData.provider === 'youtube' && (
                <button
                  type="button"
                  onClick={handleAutoDeriveThumb}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Lấy tự động từ YouTube</span>
                </button>
              )}
            </div>

            <ImageUploader
              label="Ảnh đại diện Video"
              helperText="Tải ảnh tùy chỉnh hoặc nhập URL ảnh bìa"
              projectId={formData.project_id}
              currentUrl={formData.thumbnail}
              selectedFile={selectedThumbnailFile}
              onFileSelect={setSelectedThumbnailFile}
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
              isUploading={isUploading}
              disabled={isFormSubmitting}
              allowDirectUpload={true}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Mô tả ngắn về video (tùy chọn)
            </label>
            <textarea
              rows={2}
              disabled={isFormSubmitting}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ghi chú về phân cảnh, vai trò hoặc bối cảnh quay..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isFormSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="video-form"
            disabled={isFormSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1329] text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-sky-400" />
            <span>{isSaving ? 'Đang lưu...' : isUploading ? 'Đang tải tệp...' : 'Lưu Video'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
