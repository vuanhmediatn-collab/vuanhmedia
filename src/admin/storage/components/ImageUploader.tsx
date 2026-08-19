import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  X, 
  Image as ImageIcon, 
  AlertCircle, 
  FileCheck,
  RefreshCw
} from 'lucide-react';

import { validateImageFile, formatFileSize } from '../utils/storageUtils';

interface ImageUploaderProps {
  label: string;
  helperText?: string;
  projectId?: string;
  currentUrl?: string;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  isUploading?: boolean;
  disabled?: boolean;
  required?: boolean;
  allowDirectUpload?: boolean; // false for new projects when project ID doesn't exist yet
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  helperText,
  projectId,
  currentUrl = '',
  selectedFile,
  onFileSelect,
  onUrlChange,
  isUploading = false,
  disabled = false,
  required = false,
  allowDirectUpload = true,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>(allowDirectUpload ? 'upload' : 'url');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync mode if allowDirectUpload changes
  useEffect(() => {
    if (!allowDirectUpload && mode === 'upload') {
      setMode('url');
    }
  }, [allowDirectUpload, mode]);

  // Generate object URL for local preview when a file is chosen
  useEffect(() => {
    if (selectedFile) {
      const objUrl = URL.createObjectURL(selectedFile);
      setLocalPreviewUrl(objUrl);
      setImageLoadError(false);
      return () => URL.revokeObjectURL(objUrl);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleProcessFile = (file: File) => {
    setLocalError(null);

    if (!projectId && allowDirectUpload) {
      setLocalError('Vui lòng chọn dự án trước khi tải ảnh.');
      return;
    }

    const val = validateImageFile(file);
    if (!val.isValid) {
      setLocalError(val.error || 'Tệp không hợp lệ.');
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading || !allowDirectUpload) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearSelectedFile = () => {
    onFileSelect(null);
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploadDisabled = disabled || isUploading || !allowDirectUpload;
  const isNoProjectSelected = allowDirectUpload && (!projectId || !projectId.trim());

  const activeDisplayUrl = localPreviewUrl || currentUrl;

  return (
    <div className="space-y-2.5">
      {/* Label and Source Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {helperText && (
            <span className="text-[11px] text-slate-500 font-medium">{helperText}</span>
          )}
        </div>

        {/* Segmented Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {allowDirectUpload && (
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => {
                setMode('upload');
                setLocalError(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'upload'
                  ? 'bg-white text-[#0b1329] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Tải ảnh lên</span>
            </button>
          )}

          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => {
              setMode('url');
              setLocalError(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'url'
                ? 'bg-white text-[#0b1329] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Dùng URL</span>
          </button>
        </div>
      </div>

      {/* Validation Error Alert */}
      {localError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{localError}</span>
        </div>
      )}

      {/* Mode A: Upload Local File */}
      {mode === 'upload' && (
        <div className="space-y-2">
          {isNoProjectSelected ? (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
              <AlertCircle className="w-5 h-5 text-amber-600 mx-auto" />
              <p className="text-xs font-bold text-amber-900">
                Vui lòng chọn dự án trước khi tải ảnh.
              </p>
              <span className="text-[11px] text-amber-700 font-medium">
                Hệ thống cần xác định thư mục dự án trên lưu trữ đám mây.
              </span>
            </div>
          ) : selectedFile ? (
            /* Selected File Card */
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0b1329] truncate block">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    {formatFileSize(selectedFile.size)} • Sẵn sàng tải lên
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Đổi tệp
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleClearSelectedFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hủy chọn tệp"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!isUploadDisabled) fileInputRef.current?.click();
              }}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-2 cursor-pointer ${
                isDragOver
                  ? 'border-sky-500 bg-sky-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              } ${isUploadDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                disabled={isUploadDisabled}
                className="hidden"
              />

              <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center mx-auto text-slate-500">
                {isUploading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
                ) : (
                  <UploadCloud className="w-5 h-5 text-sky-600" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-[#0b1329]">
                  {isUploading
                    ? 'Đang tải ảnh lên lưu trữ Supabase...'
                    : 'Nhấn để chọn tệp hoặc kéo thả ảnh vào đây'}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">
                  Hỗ trợ định dạng: JPG, PNG, WebP (Tối đa 20 MB)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Direct URL */}
      {mode === 'url' && (
        <div className="space-y-1.5">
          <input
            type="url"
            disabled={disabled || isUploading}
            value={currentUrl}
            onChange={(e) => {
              onUrlChange(e.target.value);
              setImageLoadError(false);
            }}
            placeholder="https://images.unsplash.com/... hoặc CDN URL"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
          />
          {!allowDirectUpload && (
            <span className="text-[10.5px] text-slate-500 font-semibold block">
              💡 Lưu dự án trước để kích hoạt tính năng tải ảnh trực tiếp từ máy tính.
            </span>
          )}
        </div>
      )}

      {/* Live Safe Image Preview Box */}
      {activeDisplayUrl && (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              Xem trước hình ảnh
            </span>
            {selectedFile && (
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                Ảnh mới chưa lưu
              </span>
            )}
          </div>

          <div className="w-full h-36 rounded-xl bg-slate-200/80 border border-slate-300/80 overflow-hidden flex items-center justify-center">
            {!imageLoadError ? (
              <img
                src={activeDisplayUrl}
                alt="Preview"
                className="w-full h-full object-contain"
                onError={() => setImageLoadError(true)}
              />
            ) : (
              <div className="text-center p-3 text-xs font-semibold text-slate-500 space-y-1">
                <AlertCircle className="w-4 h-4 text-amber-500 mx-auto" />
                <span>Không thể tải trước hình ảnh từ nguồn này.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
