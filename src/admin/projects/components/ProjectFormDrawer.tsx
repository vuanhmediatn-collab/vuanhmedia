import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Layers, 
  AlertCircle
} from 'lucide-react';
import type { ProjectRow, ProjectFormData } from '../types/project.types';
import type { ProjectStatus } from '../../../types/database.types';
import { slugify } from '../services/project.service';
import { ImageUploader } from '../../storage/components/ImageUploader';
import { useImageUpload } from '../../storage/hooks/useImageUpload';
import { deleteManagedImageByUrl } from '../../storage/services/storage.service';

interface ProjectFormDrawerProps {
  isOpen: boolean;
  projectToEdit: ProjectRow | null;
  defaultSortOrder: number;
  isSaving: boolean;
  onSave: (data: ProjectFormData, id?: string, newId?: string) => Promise<void>;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  'TVC / Video Quảng cáo',
  'Viral Video / Phim ngắn',
  'Phim Doanh nghiệp',
  'Music Video / Nghệ thuật',
  'Motion Graphics / 3D',
  'Sản xuất Phim tài liệu',
];

const INITIAL_FORM_DATA: ProjectFormData = {
  title: '',
  slug: '',
  client: '',
  category: CATEGORY_OPTIONS[0],
  year: new Date().getFullYear().toString(),
  short_description: '',
  full_description: '',
  scope_of_work: '',
  role_played: '',
  cover_image: '',
  thumbnail: '',
  sort_order: 1,
  is_featured: false,
  status: 'draft',
};

export const ProjectFormDrawer: React.FC<ProjectFormDrawerProps> = ({
  isOpen,
  projectToEdit,
  defaultSortOrder,
  isSaving,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_FORM_DATA);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Storage uploads state
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [draftId, setDraftId] = useState<string>(() => 
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  const { upload, cleanupFailedUpload, isUploading } = useImageUpload();

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        title: projectToEdit.title || '',
        slug: projectToEdit.slug || '',
        client: projectToEdit.client || '',
        category: projectToEdit.category || CATEGORY_OPTIONS[0],
        year: projectToEdit.year || new Date().getFullYear().toString(),
        short_description: projectToEdit.short_description || '',
        full_description: projectToEdit.full_description || '',
        scope_of_work: projectToEdit.scope_of_work || '',
        role_played: projectToEdit.role_played || '',
        cover_image: projectToEdit.cover_image || '',
        thumbnail: projectToEdit.thumbnail || '',
        sort_order: projectToEdit.sort_order ?? 1,
        is_featured: Boolean(projectToEdit.is_featured),
        status: projectToEdit.status || 'draft',
      });
      setIsSlugManuallyEdited(true);
    } else {
      setFormData({
        ...INITIAL_FORM_DATA,
        sort_order: defaultSortOrder,
      });
      setIsSlugManuallyEdited(false);
      setDraftId(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    }
    setSelectedCoverFile(null);
    setSelectedThumbnailFile(null);
    setValidationError(null);
  }, [projectToEdit, isOpen, defaultSortOrder]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      const nextSlug = isSlugManuallyEdited ? prev.slug : slugify(val);
      return { ...prev, title: val, slug: nextSlug };
    });
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const title = formData.title.trim();
    const slug = formData.slug.trim();

    if (!title) {
      setValidationError('Vui lòng nhập Tiêu đề dự án.');
      return;
    }

    if (!slug) {
      setValidationError('Vui lòng nhập Đường dẫn (slug) hợp lệ.');
      return;
    }

    let finalCoverUrl = formData.cover_image?.trim() || '';
    let finalThumbnailUrl = formData.thumbnail?.trim() || '';
    let uploadedCoverPath: string | null = null;
    let uploadedThumbPath: string | null = null;

    const oldCoverUrl = projectToEdit?.cover_image;
    const oldThumbnailUrl = projectToEdit?.thumbnail;

    const activeProjectId = projectToEdit?.id || draftId;

    try {
      // Upload cover file if selected (both for new and existing projects)
      if (selectedCoverFile) {
        const coverUpload = await upload(activeProjectId, 'cover', selectedCoverFile);
        finalCoverUrl = coverUpload.publicUrl;
        uploadedCoverPath = coverUpload.storagePath;
      }

      // Upload thumbnail file if selected (both for new and existing projects)
      if (selectedThumbnailFile) {
        const thumbUpload = await upload(activeProjectId, 'thumbnail', selectedThumbnailFile);
        finalThumbnailUrl = thumbUpload.publicUrl;
        uploadedThumbPath = thumbUpload.storagePath;
      }

      // Execute DB save with upfront ID if new
      await onSave(
        {
          ...formData,
          title,
          slug,
          client: formData.client.trim(),
          short_description: formData.short_description.trim(),
          full_description: formData.full_description.trim(),
          scope_of_work: formData.scope_of_work.trim(),
          role_played: formData.role_played.trim(),
          cover_image: finalCoverUrl,
          thumbnail: finalThumbnailUrl,
        },
        projectToEdit?.id,
        projectToEdit ? undefined : activeProjectId
      );

      // Safe replacement cleanup
      if (projectToEdit) {
        if (oldCoverUrl && oldCoverUrl !== finalCoverUrl) {
          deleteManagedImageByUrl(oldCoverUrl);
        }
        if (oldThumbnailUrl && oldThumbnailUrl !== finalThumbnailUrl) {
          deleteManagedImageByUrl(oldThumbnailUrl);
        }
      }
    } catch (err: any) {
      // Rollback newly uploaded files if DB update fails
      if (uploadedCoverPath) await cleanupFailedUpload(uploadedCoverPath);
      if (uploadedThumbPath) await cleanupFailedUpload(uploadedThumbPath);
      setValidationError(err.message || 'Lỗi lưu thông tin dự án.');
    }
  };

  const isFormSubmitting = isSaving || isUploading;
  const isExistingProject = Boolean(projectToEdit?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 text-[#0284c7] flex items-center justify-center font-black">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
                {projectToEdit ? 'Chỉnh sửa Dự án' : 'Tạo Dự án Mới'}
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {projectToEdit ? `ID: ${projectToEdit.id}` : 'Nhập thông tin ban đầu (Mặc định: Bản nháp)'}
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

        {/* Scrollable Form Body */}
        <form id="project-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Row 1: Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Tiêu đề Dự án <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isFormSubmitting}
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Phim Doanh Nghiệp Thành Long"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Đường dẫn URL (Slug) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isFormSubmitting}
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="phim-doanh-nghiep-thanh-long"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 2: Client & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Khách hàng / Đối tác (Client)
              </label>
              <input
                type="text"
                disabled={isFormSubmitting}
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Ví dụ: Tập đoàn Thành Long"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Hạng mục (Category)
              </label>
              <select
                disabled={isFormSubmitting}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Year, Sort Order, Status, Featured */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="space-y-1">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-slate-600">
                Năm sản xuất
              </label>
              <input
                type="text"
                disabled={isFormSubmitting}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2026"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1329]"
              />
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0b1329] cursor-pointer"
              >
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
                <option value="hidden">Đã ẩn</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isFormSubmitting}
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded text-[#0284c7] focus:ring-[#0284c7] w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">Nổi bật</span>
              </label>
            </div>
          </div>

          {/* Row 4: Short Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Mô tả ngắn gọn
            </label>
            <textarea
              rows={2}
              disabled={isFormSubmitting}
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Tóm tắt ý tưởng và mục tiêu truyền thông của dự án..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all resize-none"
            />
          </div>

          {/* Row 5: Full Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Nội dung giới thiệu chi tiết
            </label>
            <textarea
              rows={3}
              disabled={isFormSubmitting}
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              placeholder="Chi tiết câu chuyện dự án, bối cảnh thực hiện và giá trị mang lại cho thương hiệu..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all resize-y"
            />
          </div>

          {/* Row 6: Scope of Work & Role Played */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Phạm vi công việc (Scope of Work)
              </label>
              <input
                type="text"
                disabled={isFormSubmitting}
                value={formData.scope_of_work}
                onChange={(e) => setFormData({ ...formData, scope_of_work: e.target.value })}
                placeholder="Ví dụ: Lên ý tưởng, Tiền kỳ, Quay phim, Hậu kỳ VFX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Vai trò đảm nhiệm (Role Played)
              </label>
              <input
                type="text"
                disabled={isFormSubmitting}
                value={formData.role_played}
                onChange={(e) => setFormData({ ...formData, role_played: e.target.value })}
                placeholder="Ví dụ: Đạo diễn, Giám đốc hình ảnh (DOP), Biên tập"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 7: Integrated Storage ImageUploaders for Cover and Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <ImageUploader
              label="Ảnh bìa Dự án (Cover Image)"
              helperText="Hiển thị đầu trang chi tiết dự án"
              projectId={projectToEdit?.id || draftId}
              currentUrl={formData.cover_image}
              selectedFile={selectedCoverFile}
              onFileSelect={setSelectedCoverFile}
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url }))}
              isUploading={isUploading}
              disabled={isFormSubmitting}
              allowDirectUpload={true}
            />

            <ImageUploader
              label="Ảnh đại diện (Thumbnail)"
              helperText="Hiển thị trên danh sách và thẻ xem nhanh"
              projectId={projectToEdit?.id || draftId}
              currentUrl={formData.thumbnail}
              selectedFile={selectedThumbnailFile}
              onFileSelect={setSelectedThumbnailFile}
              onUrlChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
              isUploading={isUploading}
              disabled={isFormSubmitting}
              allowDirectUpload={true}
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
            form="project-form"
            disabled={isFormSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0284c7] hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isFormSubmitting ? 'Đang lưu...' : projectToEdit ? 'Lưu thay đổi' : 'Tạo dự án'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
