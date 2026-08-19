import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  AlertCircle
} from 'lucide-react';
import type { EnrichedProjectMedia, ProjectOption, ImageFormData } from '../types/media.types';
import { ProjectCombobox } from './ProjectCombobox';
import { ImageUploader } from '../../storage/components/ImageUploader';
import { useImageUpload } from '../../storage/hooks/useImageUpload';
import { deleteManagedImageByUrl } from '../../storage/services/storage.service';

interface ImageFormDrawerProps {
  isOpen: boolean;
  mediaToEdit: EnrichedProjectMedia | null;
  projects: ProjectOption[];
  defaultProjectId?: string;
  defaultSortOrder: number;
  isSaving: boolean;
  onSave: (data: ImageFormData, id?: string) => Promise<void>;
  onClose: () => void;
  onCreateNewProject?: () => void;
}

const INITIAL_IMAGE_FORM: ImageFormData = {
  project_id: '',
  file_url: '',
  caption: '',
  sort_order: 1,
  status: 'hidden', // Explicit safety default
};

export const ImageFormDrawer: React.FC<ImageFormDrawerProps> = ({
  isOpen,
  mediaToEdit,
  projects,
  defaultProjectId,
  defaultSortOrder,
  isSaving,
  onSave,
  onClose,
  onCreateNewProject,
}) => {
  const [formData, setFormData] = useState<ImageFormData>(INITIAL_IMAGE_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { upload, cleanupFailedUpload, isUploading } = useImageUpload();

  // Initialize form when drawer opens or editing target changes
  useEffect(() => {
    if (isOpen) {
      if (mediaToEdit) {
        setFormData({
          project_id: mediaToEdit.project_id || '',
          file_url: mediaToEdit.file_url || '',
          caption: mediaToEdit.caption || '',
          sort_order: mediaToEdit.sort_order ?? 1,
          status: (mediaToEdit.status as 'published' | 'hidden') || 'hidden',
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
      setSelectedFile(null);
      setValidationError(null);
    } else {
      setFormData(INITIAL_IMAGE_FORM);
      setSelectedFile(null);
      setValidationError(null);
    }
  }, [isOpen, mediaToEdit]);

  useEffect(() => {
    if (isOpen && defaultProjectId && projects.some((p) => p.id === defaultProjectId)) {
      setFormData((prev) => ({ ...prev, project_id: defaultProjectId }));
    }
  }, [defaultProjectId, projects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.project_id || !formData.project_id.trim()) {
      setValidationError('Vui lòng chọn dự án.');
      return;
    }

    let finalFileUrl = formData.file_url.trim();
    let uploadedStoragePath: string | null = null;
    const oldFileUrl = mediaToEdit?.file_url;

    // If local file selected, upload to Supabase Storage first
    if (selectedFile) {
      try {
        const uploadResult = await upload(
          formData.project_id,
          'gallery',
          selectedFile
        );
        finalFileUrl = uploadResult.publicUrl;
        uploadedStoragePath = uploadResult.storagePath;
      } catch (uploadErr: any) {
        setValidationError(uploadErr.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
        return;
      }
    }

    if (!finalFileUrl) {
      setValidationError('Vui lòng chọn tệp ảnh để tải lên hoặc nhập đường dẫn URL.');
      return;
    }

    try {
      // Execute database insert / update
      await onSave(
        {
          ...formData,
          file_url: finalFileUrl,
          caption: formData.caption.trim(),
        },
        mediaToEdit?.id
      );

      // Safe replacement: if DB update succeeds and replacing an old managed image, cleanup old storage object
      if (mediaToEdit && oldFileUrl && oldFileUrl !== finalFileUrl) {
        deleteManagedImageByUrl(oldFileUrl);
      }
    } catch (dbErr: any) {
      // Transaction rollback: if DB save fails after upload, delete the newly uploaded storage object
      if (uploadedStoragePath) {
        await cleanupFailedUpload(uploadedStoragePath);
      }
      setValidationError('Không thể lưu ảnh vào CMS. Tệp tải lên đã được dọn dẹp.');
    }
  };

  const isFormSubmitting = isSaving || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-black">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
                {mediaToEdit ? 'Chỉnh sửa Hình ảnh Media' : 'Thêm Hình ảnh mới'}
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {mediaToEdit ? `ID: ${mediaToEdit.id}` : 'Tải tệp ảnh trực tiếp lên Supabase Storage hoặc dùng URL'}
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
        <form id="image-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
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

          {/* Unified Image Uploader with File Upload / URL toggle */}
          <ImageUploader
            label="Hình ảnh Media (Gallery)"
            helperText="Hỗ trợ JPG, PNG, WebP tối đa 20 MB"
            projectId={formData.project_id}
            currentUrl={formData.file_url}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            onUrlChange={(url) => setFormData((prev) => ({ ...prev, file_url: url }))}
            isUploading={isUploading}
            disabled={isFormSubmitting}
            required
            allowDirectUpload={true}
          />

          {/* Sort Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
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

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Chú thích ảnh (Caption)
            </label>
            <input
              type="text"
              disabled={isFormSubmitting}
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Ví dụ: Hình ảnh hậu trường bối cảnh quay Studio"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isFormSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="submit"
            form="image-form"
            disabled={isFormSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isFormSubmitting ? 'Đang lưu...' : mediaToEdit ? 'Lưu thay đổi' : 'Thêm hình ảnh'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
