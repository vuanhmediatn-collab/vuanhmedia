import React from 'react';
import { AlertTriangle, Globe, X } from 'lucide-react';
import type { ProjectStatus } from '../../../types/database.types';


interface ProjectStatusConfirmModalProps {
  isOpen: boolean;
  projectTitle: string;
  currentStatus: ProjectStatus;
  targetStatus: ProjectStatus;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ProjectStatusConfirmModal: React.FC<ProjectStatusConfirmModalProps> = ({
  isOpen,
  projectTitle,
  currentStatus,
  targetStatus,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isPublishing = targetStatus === 'published';
  const isUnpublishing = currentStatus === 'published' && targetStatus !== 'published';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6 animate-scale-up">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isPublishing
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isPublishing ? <Globe className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>

          <div>
            <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
              {isPublishing ? 'Xác nhận xuất bản dự án' : 'Xác nhận thay đổi trạng thái'}
            </h3>
            <span className="text-xs text-slate-500 font-semibold truncate block max-w-[260px]">
              {projectTitle}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium leading-relaxed space-y-2">
          {isPublishing && (
            <p>
              Bạn có chắc chắn muốn <strong className="text-emerald-700 font-bold">Xuất bản</strong> dự án này lên website? Dự án sẽ hiển thị công khai ngay lập tức cho tất cả khách truy cập.
            </p>
          )}

          {isUnpublishing && (
            <p>
              Dự án này đang hiển thị công khai. Nếu chuyển sang trạng thái <strong className="text-amber-700 font-bold">{targetStatus === 'draft' ? 'Bản nháp' : targetStatus === 'hidden' ? 'Đã ẩn' : 'Lưu trữ'}</strong>, dự án sẽ <strong className="text-rose-600 font-bold">biến mất khỏi trang chủ công khai</strong>.
            </p>
          )}

          {!isPublishing && !isUnpublishing && (
            <p>
              Chuyển trạng thái dự án từ <strong className="font-bold">{currentStatus}</strong> sang <strong className="font-bold">{targetStatus}</strong>?
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer ${
              isPublishing
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-[#0284c7] hover:bg-sky-500'
            }`}
          >
            {isSubmitting ? 'Đang cập nhật...' : isPublishing ? 'Xuất bản ngay' : 'Xác nhận thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};
