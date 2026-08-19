import React from 'react';
import { Globe, RotateCcw, X, Layers } from 'lucide-react';


export type ContentConfirmActionType = 'publish_field' | 'publish_section' | 'publish_all' | 'discard';

interface ContentPublishConfirmModalProps {
  isOpen: boolean;
  actionType: ContentConfirmActionType;
  title: string;
  count?: number;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ContentPublishConfirmModal: React.FC<ContentPublishConfirmModalProps> = ({
  isOpen,
  actionType,
  title,
  count = 1,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDiscard = actionType === 'discard';
  const isPublishAll = actionType === 'publish_all';
  const isPublishSection = actionType === 'publish_section';

  const getHeading = () => {
    switch (actionType) {
      case 'publish_field':
        return 'Xuất bản thay đổi này lên website?';
      case 'publish_section':
        return 'Xuất bản toàn bộ thay đổi trong mục này?';
      case 'publish_all':
        return 'Xuất bản tất cả thay đổi nội dung?';
      case 'discard':
        return 'Hoàn tác thay đổi bản nháp?';
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case 'publish_field':
        return `Giá trị bản nháp mới của trường "${title}" sẽ được ghi đè vào nội dung công khai và xuất hiện trên website chính thức ngay lập tức.`;
      case 'publish_section':
        return `Toàn bộ ${count} trường có thay đổi trong chuyên mục "${title}" sẽ được xuất bản đồng loạt lên website công khai.`;
      case 'publish_all':
        return `Tất cả ${count} trường nội dung đang chờ xuất bản trên toàn website sẽ được áp dụng ngay lập tức mà không cần triển khai lại mã nguồn.`;
      case 'discard':
        return `Nội dung bản nháp của trường "${title}" sẽ bị hủy bỏ và khôi phục về giá trị đang xuất bản trên website.`;
    }
  };

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

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDiscard
                ? 'bg-amber-50 text-amber-600'
                : isPublishAll
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {isDiscard ? (
              <RotateCcw className="w-6 h-6" />
            ) : isPublishAll || isPublishSection ? (
              <Layers className="w-6 h-6" />
            ) : (
              <Globe className="w-6 h-6" />
            )}
          </div>

          <div>
            <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
              {getHeading()}
            </h3>
            <span className="text-xs text-slate-500 font-semibold block truncate max-w-[250px]">
              {title}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium leading-relaxed">
          {getDescription()}
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
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 ${
              isDiscard
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : isDiscard
              ? 'Xác nhận hoàn tác'
              : 'Xác nhận xuất bản'}
          </button>
        </div>
      </div>
    </div>
  );
};
