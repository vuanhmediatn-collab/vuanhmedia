import React from 'react';
import { 
  Edit3, 
  Star, 
  Archive, 
  FolderGit2, 
  Eye,
  Video
} from 'lucide-react';

import type { ProjectRow } from '../types/project.types';

import type { ProjectStatus } from '../../../types/database.types';

interface ProjectListTableProps {
  projects: ProjectRow[];
  onEdit: (project: ProjectRow) => void;
  onView: (project: ProjectRow) => void;
  onRequestStatusChange: (project: ProjectRow, targetStatus: ProjectStatus) => void;
  onToggleFeatured: (project: ProjectRow) => void;
  onArchive: (project: ProjectRow) => void;
}

const renderStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Đã xuất bản
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Bản nháp
        </span>
      );
    case 'hidden':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Đã ẩn
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Đã lưu trữ
        </span>
      );
    default:
      return null;
  }
};

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

export const ProjectListTable: React.FC<ProjectListTableProps> = ({
  projects,
  onEdit,
  onView,
  onRequestStatusChange,
  onToggleFeatured,
  onArchive,
}) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
        <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700">Không tìm thấy dự án nào</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái để xem các dự án khác.
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
              <th className="py-3.5 px-4">Dự án</th>
              <th className="py-3.5 px-4">Khách hàng</th>
              <th className="py-3.5 px-4">Danh mục</th>
              <th className="py-3.5 px-4 text-center">Năm</th>
              <th className="py-3.5 px-4 text-center">Nổi bật</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4">Cập nhật</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => (
              <tr
                key={project.id}
                className="hover:bg-slate-50/70 transition-colors group text-slate-700"
              >
                {/* Sort Order */}
                <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100">
                    {project.sort_order ?? '—'}
                  </span>
                </td>

                {/* Project Title & Slug */}
                <td className="py-3.5 px-4 max-w-[220px]">
                  <div className="font-bold text-[#0b1329] truncate" title={project.title}>
                    {project.title}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    /{project.slug}
                  </span>
                </td>

                {/* Client */}
                <td className="py-3.5 px-4 font-semibold text-slate-600 max-w-[140px] truncate">
                  {project.client || '—'}
                </td>

                {/* Category */}
                <td className="py-3.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600 text-[10.5px]">
                    {project.category}
                  </span>
                </td>

                {/* Year */}
                <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                  {project.year || '—'}
                </td>

                {/* Featured Toggle */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(project)}
                    title={project.is_featured ? 'Hạ nổi bật' : 'Đánh dấu nổi bật'}
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all cursor-pointer ${
                      project.is_featured
                        ? 'bg-amber-50 text-amber-500 border border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-300 border border-slate-200 hover:text-amber-400 hover:bg-slate-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${project.is_featured ? 'fill-amber-500' : ''}`} />
                  </button>
                </td>

                {/* Status Dropdown/Selector */}
                <td className="py-3.5 px-4">
                  <div className="relative inline-block group/status">
                    <button
                      type="button"
                      className="cursor-pointer"
                      title="Nhấn để đổi trạng thái"
                    >
                      {renderStatusBadge(project.status)}
                    </button>
                    {/* Hover status change actions */}
                    <div className="hidden group-hover/status:flex absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-20 flex-col gap-1 min-w-[130px] animate-fade-in">
                      {project.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => onRequestStatusChange(project, 'published')}
                          className="w-full text-left px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                        >
                          Xuất bản
                        </button>
                      )}
                      {project.status !== 'draft' && (
                        <button
                          type="button"
                          onClick={() => onRequestStatusChange(project, 'draft')}
                          className="w-full text-left px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-amber-700 hover:bg-amber-50 cursor-pointer"
                        >
                          Chuyển về Nháp
                        </button>
                      )}
                      {project.status !== 'hidden' && (
                        <button
                          type="button"
                          onClick={() => onRequestStatusChange(project, 'hidden')}
                          className="w-full text-left px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Ẩn dự án
                        </button>
                      )}
                      {project.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => onRequestStatusChange(project, 'archived')}
                          className="w-full text-left px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          Lưu trữ
                        </button>
                      )}
                    </div>
                  </div>
                </td>

                {/* Updated At */}
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {formatDate(project.updated_at)}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5 justify-end">
                    {/* View */}
                    <button
                      type="button"
                      onClick={() => onView(project)}
                      title="Xem dự án"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onEdit(project)}
                      title="Chỉnh sửa thông tin"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Manage Media */}
                    <button
                      type="button"
                      onClick={() => {
                        window.history.pushState({}, '', `/admin/media?project=${project.id}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      title="Quản lý Media & Video của dự án"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                    </button>

                    {/* Archive */}
                    {project.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => onArchive(project)}

                        title="Lưu trữ dự án"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
