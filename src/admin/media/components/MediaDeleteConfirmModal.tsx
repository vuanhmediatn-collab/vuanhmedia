import React from 'react';
import { Trash2, X } from 'lucide-react';


interface MediaDeleteConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  itemType: 'video' | 'hình ảnh';
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const MediaDeleteConfirmModal: React.FC<MediaDeleteConfirmModalProps> = ({
  isOpen,
  itemTitle,
  itemType,
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-5 animate-scale-up">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
              Xóa {itemType} khỏi dự án?
            </h3>
            <span className="text-xs text-slate-500 font-semibold truncate block max-w-[260px]">
              {itemTitle}
            </span>
          </div>
        </div>

        {/* Warning Message */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-xs text-rose-900 font-medium leading-relaxed space-y-2">
          <p>
            Bạn có chắc chắn muốn xóa bản ghi {itemType} này khỏi cơ sở dữ liệu?
          </p>
          <p className="text-[11px] text-rose-700 font-semibold">
            * Lưu ý: Thao tác chỉ xóa liên kết tham chiếu khỏi CMS, không xóa nội dung gốc tại nền tảng bên ngoài (YouTube, Vimeo, Google Drive).
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};
