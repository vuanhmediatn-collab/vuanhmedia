import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Globe, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import type { EnrichedSiteContentRow } from '../types/content.types';
import { CONTENT_KEY_LABELS } from '../utils/contentLabels';
import { isContentEqual } from '../utils/contentCompare';
import { TextContentEditor } from './TextContentEditor';
import { StringArrayEditor } from './StringArrayEditor';
import { PrinciplesEditor } from './PrinciplesEditor';
import { ProcessStepsEditor } from './ProcessStepsEditor';
import { ServicesListEditor } from './ServicesListEditor';

interface ContentFieldEditorProps {
  row: EnrichedSiteContentRow;
  isSaving: boolean;
  isPublishing: boolean;
  isDiscarding: boolean;
  onSaveDraft: (id: string, value: any) => Promise<void>;
  onRequestPublish: (row: EnrichedSiteContentRow) => void;
  onRequestDiscard: (row: EnrichedSiteContentRow) => void;
}

export const ContentFieldEditor: React.FC<ContentFieldEditorProps> = ({
  row,
  isSaving,
  isPublishing,
  isDiscarding,
  onSaveDraft,
  onRequestPublish,
  onRequestDiscard,
}) => {
  const [localValue, setLocalValue] = useState<any>(row.draft_value);
  const [showPublishedCompare, setShowPublishedCompare] = useState(false);

  // Sync localValue whenever remote row.draft_value updates
  useEffect(() => {
    setLocalValue(row.draft_value);
  }, [row.draft_value]);

  const hasLocalUnsavedEdits = !isContentEqual(localValue, row.draft_value);
  const config = CONTENT_KEY_LABELS[row.content_key];

  const handleSaveDraft = async () => {
    await onSaveDraft(row.id, localValue);
  };

  const renderEditorWidget = () => {
    if (row.content_key === 'partners.list') {
      return (
        <StringArrayEditor
          items={localValue}
          disabled={isSaving || isPublishing || isDiscarding}
          onChange={setLocalValue}
        />
      );
    }
    if (row.content_key === 'about.principles') {
      return (
        <PrinciplesEditor
          items={localValue}
          disabled={isSaving || isPublishing || isDiscarding}
          onChange={setLocalValue}
        />
      );
    }
    if (row.content_key === 'process.steps') {
      return (
        <ProcessStepsEditor
          items={localValue}
          disabled={isSaving || isPublishing || isDiscarding}
          onChange={setLocalValue}
        />
      );
    }
    if (row.content_key === 'services.list') {
      return (
        <ServicesListEditor
          items={localValue}
          disabled={isSaving || isPublishing || isDiscarding}
          onChange={setLocalValue}
        />
      );
    }

    // Default to text editor
    return (
      <TextContentEditor
        value={localValue}
        isLongText={config?.isLongText}
        disabled={isSaving || isPublishing || isDiscarding}
        onChange={setLocalValue}
      />
    );
  };

  const renderPublishedValuePreview = () => {
    if (row.content_type === 'array') {
      return (
        <div className="p-3 rounded-xl bg-slate-100 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
          {JSON.stringify(row.published_value, null, 2)}
        </div>
      );
    }

    return (
      <div className="p-3 rounded-xl bg-slate-100 text-xs font-medium text-slate-700 whitespace-pre-wrap">
        {String(row.published_value || '(Trống)')}
      </div>
    );
  };

  return (
    <div className={`p-4 sm:p-6 rounded-3xl border transition-all space-y-4 bg-white ${
      hasLocalUnsavedEdits
        ? 'border-sky-300 ring-2 ring-sky-500/10 shadow-sm'
        : row.isChanged
        ? 'border-amber-200/90 shadow-2xs'
        : 'border-slate-200/80'
    }`}>
      {/* Field Top Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#0b1329]">
              {row.humanLabel}
            </h4>
            <span className="font-mono text-[10.5px] text-slate-400">
              ({row.content_key})
            </span>
          </div>
          {config?.helperText && (
            <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">
              {config.helperText}
            </p>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 shrink-0">
          {hasLocalUnsavedEdits ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
              <Clock className="w-3 h-3" />
              Chưa lưu nháp
            </span>
          ) : row.isChanged ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3 h-3" />
              Có thay đổi chưa xuất bản
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Đã đồng bộ
            </span>
          )}
        </div>
      </div>

      {/* Editor Component */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          Nội dung bản nháp (Draft Editor)
        </label>
        {renderEditorWidget()}
      </div>

      {/* Compare with Published Value (Collapsible) */}
      {showPublishedCompare && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500">
              Nội dung đang hiển thị công khai trên website (Published)
            </span>
          </div>
          {renderPublishedValuePreview()}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowPublishedCompare(!showPublishedCompare)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          {showPublishedCompare ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ẩn nội dung xuất bản</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Xem nội dung đang xuất bản</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* Discard Draft Button (Enabled when draft differs from published) */}
          {row.isChanged && (
            <button
              type="button"
              disabled={isSaving || isPublishing || isDiscarding}
              onClick={() => onRequestDiscard(row)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Hoàn tác</span>
            </button>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            disabled={!hasLocalUnsavedEdits || isSaving || isPublishing || isDiscarding}
            onClick={handleSaveDraft}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 ${
              hasLocalUnsavedEdits
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
          </button>

          {/* Publish Field Button */}
          <button
            type="button"
            disabled={!row.isChanged && !hasLocalUnsavedEdits}
            onClick={() => onRequestPublish(row)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-emerald-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Đang xuất bản...' : 'Xuất bản'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
