import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

import type { PrincipleItem } from '../../../utils/contentMapper';

interface PrinciplesEditorProps {
  items: PrincipleItem[];
  disabled?: boolean;
  onChange: (newItems: PrincipleItem[]) => void;
}

export const PrinciplesEditor: React.FC<PrinciplesEditorProps> = ({
  items = [],
  disabled = false,
  onChange,
}) => {
  const currentItems = Array.isArray(items) ? items : [];

  const handleItemChange = (index: number, field: keyof PrincipleItem, val: string) => {
    const updated = [...currentItems];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  const handleAddItem = () => {
    const nextNum = (currentItems.length + 1).toString().padStart(2, '0');
    onChange([
      ...currentItems,
      {
        num: nextNum,
        title: '',
        desc: '',
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
    <div className="space-y-3">
      {currentItems.map((item, index) => (
        <div
          key={index}
          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 relative group"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10.5px] font-mono font-black">
                Mục #{index + 1}
              </span>
              <input
                type="text"
                disabled={disabled}
                value={item.num || ''}
                onChange={(e) => handleItemChange(index, 'num', e.target.value)}
                placeholder="01"
                className="w-14 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono font-bold text-center text-[#0b1329]"
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
                title="Xóa nguyên tắc này"
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Tiêu đề nguyên tắc
              </label>
              <input
                type="text"
                disabled={disabled}
                value={item.title || ''}
                onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                placeholder="Ví dụ: Chuẩn hóa quy trình từ ngày đầu"
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                rows={2}
                disabled={disabled}
                value={item.desc || ''}
                onChange={(e) => handleItemChange(index, 'desc', e.target.value)}
                placeholder="Giải thích ngắn gọn về nguyên tắc..."
                className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-[#0b1329] focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
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
        <span>Thêm nguyên tắc mới</span>
      </button>
    </div>
  );
};
