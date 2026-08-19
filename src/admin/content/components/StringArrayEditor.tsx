import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface StringArrayEditorProps {
  items: string[];
  disabled?: boolean;
  itemPlaceholder?: string;
  onChange: (newItems: string[]) => void;
}

export const StringArrayEditor: React.FC<StringArrayEditorProps> = ({
  items = [],
  disabled = false,
  itemPlaceholder = 'Tên đối tác / thương hiệu...',
  onChange,
}) => {
  const currentItems = Array.isArray(items) ? items : [];

  const handleItemChange = (index: number, val: string) => {
    const updated = [...currentItems];
    updated[index] = val;
    onChange(updated);
  };

  const handleAddItem = () => {
    onChange([...currentItems, '']);
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
    <div className="space-y-2.5">
      {currentItems.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 group"
        >
          <span className="w-6 text-center font-mono text-[10px] font-bold text-slate-400">
            {index + 1}
          </span>

          <input
            type="text"
            disabled={disabled}
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            placeholder={itemPlaceholder}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:border-sky-500 disabled:opacity-50"
          />

          <div className="flex items-center gap-1 shrink-0">
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
              title="Xóa mục này"
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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
        <span>Thêm dòng đối tác</span>
      </button>
    </div>
  );
};
