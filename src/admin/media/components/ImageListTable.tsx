import React from 'react';
import { 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Info
} from 'lucide-react';

import type { EnrichedProjectMedia } from '../types/media.types';

interface ImageListTableProps {
  mediaList: EnrichedProjectMedia[];
  onEdit: (media: EnrichedProjectMedia) => void;
  onRequestStatusChange: (media: EnrichedProjectMedia, targetStatus: 'published' | 'hidden') => void;
  onDelete: (media: EnrichedProjectMedia) => void;
}

const formatDate = (isoString: string) => {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
};

export const ImageListTable: React.FC<ImageListTableProps> = ({
  mediaList,
  onEdit,
  onRequestStatusChange,
  onDelete,
}) => {
  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700">Chưa có hình ảnh nào trong danh mục</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Nhấn "Thêm hình ảnh" để đính kèm hình ảnh đại diện, bối cảnh hoặc tư liệu vào dự án.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-medium">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 w-12 text-center">Thứ tự</th>
              <th className="py-3.5 px-4">Hình ảnh</th>
              <th className="py-3.5 px-4">Dự án</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4">Cập nhật</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mediaList.map((media) => {
              const isPublished = media.status === 'published';
              const isParentDraft = media.project?.status && media.project.status !== 'published';

              return (
                <tr
                  key={media.id}
                  className="hover:bg-slate-50/70 transition-colors group text-slate-700"
                >
                  {/* Sort Order */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100">
                      {media.sort_order ?? 1}
                    </span>
                  </td>

                  {/* Image Preview & Caption */}
                  <td className="py-3.5 px-4 max-w-[280px]">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img
                          src={media.file_url}
                          alt={media.caption || 'Project Media'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[#0b1329] truncate" title={media.caption || 'Hình ảnh dự án'}>
                          {media.caption || 'Hình ảnh không có chú thích'}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block truncate" title={media.file_url}>
                          {media.file_url}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Parent Project */}
                  <td className="py-3.5 px-4 max-w-[180px]">
                    <div className="font-semibold text-slate-700 truncate" title={media.project?.title || '—'}>
                      {media.project?.title || '—'}
                    </div>

                    {/* Notice if parent is not published */}
                    {isParentDraft && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-0.5">
                        <Info className="w-3 h-3" />
                        Dự án chưa xuất bản
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() =>
                        onRequestStatusChange(
                          media,
                          isPublished ? 'hidden' : 'published'
                        )
                      }
                      title="Nhấn để đổi trạng thái"
                      className="cursor-pointer"
                    >
                      {isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Đang ẩn
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Updated At */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(media.updated_at || media.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* View Link */}
                      <a
                        href={media.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Xem ảnh gốc"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(media)}
                        title="Chỉnh sửa thông tin"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(media)}
                        title="Xóa hình ảnh khỏi dự án"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
