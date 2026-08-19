import React from 'react';

interface TextContentEditorProps {
  value: string;
  isLongText?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChange: (newValue: string) => void;
}

export const TextContentEditor: React.FC<TextContentEditorProps> = ({
  value,
  isLongText = false,
  disabled = false,
  placeholder = 'Nhập nội dung...',
  onChange,
}) => {
  const textValue = typeof value === 'string' ? value : String(value || '');

  if (isLongText || textValue.length > 80) {
    return (
      <div className="space-y-1">
        <textarea
          rows={Math.min(8, Math.max(3, Math.ceil(textValue.length / 70)))}
          disabled={disabled}
          value={textValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all resize-y leading-relaxed disabled:opacity-50"
        />
        <div className="text-[10px] font-mono text-slate-400 text-right">
          {textValue.length} ký tự
        </div>
      </div>
    );
  }

  return (
    <input
      type="text"
      disabled={disabled}
      value={textValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all disabled:opacity-50"
    />
  );
};
