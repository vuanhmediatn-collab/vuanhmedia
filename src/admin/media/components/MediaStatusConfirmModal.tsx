import React from 'react';
import { Globe, EyeOff, X, Info } from 'lucide-react';

interface MediaStatusConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType: 'video' | 'hình ảnh';
  currentStatus: 'published' | 'hidden';
  targetStatus: 'published' | 'hidden';
  parentProjectStatus?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MediaStatusConfirmModal: React.FC<MediaStatusConfirmModalProps> = ({
  isOpen,
  itemTitle,
  itemType,
  currentStatus: _currentStatus,
  targetStatus,
  parentProjectStatus,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {

  if (!isOpen) return null;

  const isPublishing = targetStatus === 'published';
  const isParentNotPublished = parentProjectStatus && parentProjectStatus !== 'published';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-5 animate-scale-up">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Header */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isPublishing
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}
          >
            {isPublishing ? <Globe className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
          </div>

          <div>
            <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
              {isPublishing ? `Xuất bản ${itemType} này?` : `Ẩn ${itemType} này khỏi website?`}
            </h3>
            <span className="text-xs text-slate-500 font-semibold truncate block max-w-[260px]">
              {itemTitle}
            </span>
          </div>
        </div>

        {/* Informational Message */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium leading-relaxed">
            {isPublishing ? (
              <p>
                Chuyển trạng thái {itemType} sang <strong className="text-emerald-700 font-bold">Đã xuất bản</strong>. {itemType} sẽ đủ điều kiện hiển thị trên website công khai nếu dự án cha đang xuất bản.
              </p>
            ) : (
              <p>
                Chuyển trạng thái {itemType} sang <strong className="text-amber-700 font-bold">Đang ẩn</strong>. {itemType} sẽ không còn xuất hiện trên giao diện công khai.
              </p>
            )}
          </div>

          {/* Notice if parent project is not published */}
          {isPublishing && isParentNotPublished && (
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 font-medium flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý:</strong> Dự án cha hiện đang ở trạng thái <em>{parentProjectStatus}</em> (chưa xuất bản) nên {itemType} này sẽ chưa hiển thị ra ngoài website công khai cho đến khi dự án cha được xuất bản.
              </span>
            </div>
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
            Hủy
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
            {isSubmitting ? 'Đang cập nhật...' : isPublishing ? 'Xác nhận xuất bản' : 'Xác nhận ẩn'}
          </button>
        </div>
      </div>
    </div>
  );
};
