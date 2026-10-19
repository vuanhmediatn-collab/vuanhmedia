import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  X, 
  Image as ImageIcon, 
  Film,
  AlertCircle, 
  FileCheck,
  RefreshCw,
  Sparkles
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
  allowDirectUpload?: boolean;
  allowVideo?: boolean;
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
  allowVideo = false,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>(allowDirectUpload ? 'upload' : 'url');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mediaLoadError, setMediaLoadError] = useState(false);
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
      setMediaLoadError(false);
      return () => {
        URL.revokeObjectURL(objUrl);
      };
    } else {
      setLocalPreviewUrl(null);
    }
  }, [selectedFile]);

  // Handle local file validation & selection
  const handleFile = (file: File) => {
    setLocalError(null);
    setMediaLoadError(false);

    const result = validateImageFile(file);
    if (!result.isValid) {
      setLocalError(result.error || 'Tệp không hợp lệ.');
      onFileSelect(null);
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClearSelectedFile = () => {
    onFileSelect(null);
    setLocalError(null);
    setMediaLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine active display URL for preview
  const activeDisplayUrl = localPreviewUrl || (mode === 'url' ? currentUrl.trim() : '');

  const isVideoContent = Boolean(
    (selectedFile && (selectedFile.type.startsWith('video/') || selectedFile.name.match(/\.(mp4|webm|mov)$/i))) ||
    (activeDisplayUrl && activeDisplayUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i)) ||
    (activeDisplayUrl && activeDisplayUrl.includes('/storage/v1/object/public/') && activeDisplayUrl.includes('/videos/'))
  );

  const isNoProjectSelected = allowDirectUpload && (!projectId || !projectId.trim());
  const isUploadDisabled = disabled || isUploading || isNoProjectSelected;

  const acceptedTypes = allowVideo
    ? '.jpg,.jpeg,.png,.webp,.gif,.svg,.mp4,.webm,.mov,image/*,video/*'
    : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

  return (
    <div className="space-y-2.5">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold text-[#0b1329] flex items-center gap-1.5">
          {allowVideo ? <Film className="w-3.5 h-3.5 text-sky-600" /> : <ImageIcon className="w-3.5 h-3.5 text-slate-500" />}
          <span>{label}</span>
          {required && <span className="text-rose-500 font-black">*</span>}
          {helperText && (
            <span className="text-[11px] font-normal text-slate-400">({helperText})</span>
          )}
        </label>

        <div className="inline-flex p-0.5 rounded-xl bg-slate-100 border border-slate-200/80">
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
              <span>Tải từ máy (50MB)</span>
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
                Vui lòng chọn hoặc lưu dự án trước khi tải tệp.
              </p>
              <span className="text-[11px] text-amber-700 font-medium">
                Hệ thống cần xác định thư mục dự án trên lưu trữ đám mây Supabase.
              </span>
            </div>
          ) : selectedFile ? (
            /* Selected File Card */
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  {isVideoContent ? <Film className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0b1329] truncate block">
                    {selectedFile.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {formatFileSize(selectedFile.size)} • Sẵn sàng tải lên
                    </span>
                    {!isVideoContent && selectedFile.size > 1.5 * 1024 * 1024 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        Tự tối ưu WebP
                      </span>
                    )}
                  </div>
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
                accept={acceptedTypes}
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
                    ? 'Đang tải tệp lên lưu trữ Supabase...'
                    : 'Nhấn để chọn tệp hoặc kéo thả vào đây'}
                </p>
                <span className="text-[11px] text-slate-400 font-medium block">
                  {allowVideo 
                    ? 'Hỗ trợ: JPG, PNG, WebP, GIF, MP4, WebM (Tối đa 50 MB - 0đ Miễn phí)'
                    : 'Hỗ trợ: JPG, PNG, WebP, GIF, SVG (Tối đa 50 MB - Tự động nén WebP siêu nhẹ)'}
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
              setMediaLoadError(false);
            }}
            placeholder={allowVideo ? "https://youtube.com/watch?v=... hoặc link MP4 / Drive / Unsplash" : "https://images.unsplash.com/... hoặc CDN URL"}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
          />
          {!allowDirectUpload && (
            <span className="text-[10.5px] text-slate-500 font-semibold block">
              💡 Lưu dự án trước để kích hoạt tính năng tải trực tiếp từ máy tính.
            </span>
          )}
        </div>
      )}

      {/* Live Safe Media Preview Box */}
      {activeDisplayUrl && (
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              {isVideoContent ? <Film className="w-3.5 h-3.5 text-sky-600" /> : <ImageIcon className="w-3.5 h-3.5" />}
              {isVideoContent ? 'Xem trước Video' : 'Xem trước hình ảnh'}
            </span>
            {selectedFile && (
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                Tệp mới chưa lưu
              </span>
            )}
          </div>

          <div className="w-full min-h-36 max-h-56 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
            {isVideoContent ? (
              <video
                src={activeDisplayUrl}
                controls
                playsInline
                muted
                className="w-full h-full max-h-56 object-contain bg-black"
                onError={() => setMediaLoadError(true)}
              />
            ) : !mediaLoadError ? (
              <img
                src={activeDisplayUrl}
                alt="Preview"
                className="w-full h-full max-h-56 object-contain"
                onError={() => setMediaLoadError(true)}
              />
            ) : (
              <div className="text-center p-3 text-xs font-semibold text-slate-400 space-y-1">
                <AlertCircle className="w-4 h-4 text-amber-500 mx-auto" />
                <span>Không thể xem trước tệp từ nguồn này.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
