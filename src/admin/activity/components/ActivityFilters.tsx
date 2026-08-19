import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import type { ActivityFiltersState, QuickFilterKey } from '../types/activity.types';

interface ActivityFiltersProps {
  filters: ActivityFiltersState;
  recentActors: string[];
  onFilterChange: (newFilters: Partial<ActivityFiltersState>) => void;
  onResetFilters: () => void;
}

const QUICK_FILTERS: Array<{ key: QuickFilterKey; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'project', label: 'Dự án' },
  { key: 'project_video', label: 'Video' },
  { key: 'project_media', label: 'Hình ảnh' },
  { key: 'site_content', label: 'Nội dung Website' },
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filters,
  recentActors = [],
  onFilterChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.entityType !== 'all' ||
    filters.action !== 'all' ||
    filters.userEmail !== 'all' ||
    filters.quickFilter !== 'all';

  return (
    <div className="space-y-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
      {/* Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Phân loại:
        </span>
        {QUICK_FILTERS.map((chip) => {
          const isActive = filters.quickFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onFilterChange({ quickFilter: chip.key })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        {/* Search */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Tìm kiếm theo tiêu đề / Email
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Nhập tên đối tượng, email..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
            />
          </div>
        </div>

        {/* Entity Type Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Loại đối tượng
          </label>
          <select
            value={filters.entityType}
            onChange={(e) => onFilterChange({ entityType: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all cursor-pointer"
          >
            <option value="all">Tất cả đối tượng</option>
            <option value="project">Dự án (Projects)</option>
            <option value="project_video">Video Clip</option>
            <option value="project_media">Hình ảnh Media</option>
            <option value="site_content">Nội dung Website</option>
          </select>
        </div>

        {/* Action Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Hành động
          </label>
          <select
            value={filters.action}
            onChange={(e) => onFilterChange({ action: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all cursor-pointer"
          >
            <option value="all">Tất cả hành động</option>
            <option value="CREATE">Tạo mới (CREATE)</option>
            <option value="UPDATE">Cập nhật (UPDATE)</option>
            <option value="PUBLISH">Xuất bản (PUBLISH)</option>
            <option value="UNPUBLISH">Ẩn / Gỡ xuất bản (UNPUBLISH)</option>
            <option value="ARCHIVE">Lưu trữ (ARCHIVE)</option>
            <option value="REORDER">Đổi thứ tự (REORDER)</option>
            <option value="DELETE">Xóa (DELETE)</option>
          </select>
        </div>

        {/* Actor Filter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Người thực hiện
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-[10.5px] font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
          <select
            value={filters.userEmail}
            onChange={(e) => onFilterChange({ userEmail: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all cursor-pointer"
          >
            <option value="all">Tất cả người thực hiện</option>
            <option value="system">Hệ thống (Tự động / Null)</option>
            {recentActors.map((actor) => (
              <option key={actor} value={actor}>
                {actor}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
