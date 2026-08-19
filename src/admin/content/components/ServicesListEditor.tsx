import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Film, Layers, Shield } from 'lucide-react';
import type { ServiceItem } from '../../../utils/contentMapper';

interface ServicesListEditorProps {
  items: ServiceItem[];
  disabled?: boolean;
  onChange: (newItems: ServiceItem[]) => void;
}

const ICON_OPTIONS: Array<{ value: 'film' | 'layers' | 'shield'; label: string; icon: React.FC<{ className?: string }> }> = [
  { value: 'film', label: 'Film (Sản xuất Video)', icon: Film },
  { value: 'layers', label: 'Layers (Hệ thống vận hành)', icon: Layers },
  { value: 'shield', label: 'Shield (Bảo trợ & Chuẩn hóa)', icon: Shield },
];

export const ServicesListEditor: React.FC<ServicesListEditorProps> = ({
  items = [],
  disabled = false,
  onChange,
}) => {
  const currentItems = Array.isArray(items) ? items : [];

  const handleItemChange = (index: number, field: keyof ServiceItem, val: string) => {
    const updated = [...currentItems];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  const handleAddItem = () => {
    onChange([
      ...currentItems,
      {
        tag: `TẦNG 0${currentItems.length + 1} — DỊCH VỤ`,
        title: '',
        icon: 'film',
        desc: '',
        deliverablesLabel: 'Sản phẩm bàn giao',
        deliverables: '',
        commitmentLabel: 'Cam kết chất lượng',
        commitment: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = currentItems.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...currentItems];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= currentItems.length - 1) return;
    const updated = [...currentItems];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {currentItems.map((item, index) => (
        <div
          key={index}
          className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 relative group"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[10.5px] font-mono font-black">
                Gói #{index + 1}
              </span>
              <input
                type="text"
                disabled={disabled}
                value={item.tag || ''}
                onChange={(e) => handleItemChange(index, 'tag', e.target.value)}
                placeholder="TẦNG 01 — SẢN XUẤT"
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => handleMoveUp(index)}
                title="Di chuyển lên"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled || index === currentItems.length - 1}
                onClick={() => handleMoveDown(index)}
                title="Di chuyển xuống"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => handleRemoveItem(index)}
                title="Xóa gói dịch vụ này"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Tiêu đề dịch vụ
              </label>
              <input
                type="text"
                disabled={disabled}
                value={item.title || ''}
                onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                placeholder="Ví dụ: Sản Xuất Phim Doanh Nghiệp & TVC"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Biểu tượng (Icon)
              </label>
              <select
                disabled={disabled}
                value={item.icon || 'film'}
                onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0b1329] cursor-pointer"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Mô tả dịch vụ
            </label>
            <textarea
              rows={2}
              disabled={disabled}
              value={item.desc || ''}
              onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
              placeholder="Mô tả phạm vi và giải pháp..."
              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-[#0b1329] focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
            />
          </div>

          {/* Deliverables & Commitment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  disabled={disabled}
                  value={item.deliverablesLabel || 'Sản phẩm cốt lõi'}
                  onChange={(e) => handleItemChange(index, 'deliverablesLabel', e.target.value)}
                  placeholder="Nhãn sản phẩm"
                  className="px-2 py-0.5 rounded bg-slate-100 text-[10.5px] font-mono font-bold text-slate-600 border border-slate-200 w-full"
                />
              </div>
              <textarea
                rows={2}
                disabled={disabled}
                value={item.deliverables || ''}
                onChange={(e) => handleItemChange(index, 'deliverables', e.target.value)}
                placeholder="Ví dụ: TVC 4K, video ngắn đa nền tảng..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-[#0b1329] focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  disabled={disabled}
                  value={item.commitmentLabel || 'Cam kết'}
                  onChange={(e) => handleItemChange(index, 'commitmentLabel', e.target.value)}
                  placeholder="Nhãn cam kết"
                  className="px-2 py-0.5 rounded bg-slate-100 text-[10.5px] font-mono font-bold text-slate-600 border border-slate-200 w-full"
                />
              </div>
              <textarea
                rows={2}
                disabled={disabled}
                value={item.commitment || ''}
                onChange={(e) => handleItemChange(index, 'commitment', e.target.value)}
                placeholder="Ví dụ: Đúng tiến độ, nghiệm thu từng giai đoạn..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-[#0b1329] focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={disabled}
        onClick={handleAddItem}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Thêm gói dịch vụ mới</span>
      </button>
    </div>
  );
};
