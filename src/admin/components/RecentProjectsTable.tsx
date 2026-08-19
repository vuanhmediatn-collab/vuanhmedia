import React from 'react';
import { ExternalLink, Star, FolderGit2 } from 'lucide-react';
import type { AdminProjectItem } from '../services/dashboard.service';
import type { ProjectStatus } from '../../types/database.types';

interface RecentProjectsTableProps {
  projects: AdminProjectItem[];
  onViewProject?: (slug: string) => void;
}

const renderStatusBadge = (status: ProjectStatus) => {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Đã xuất bản
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Bản nháp
        </span>
      );
    case 'hidden':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Ẩn
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Lưu trữ
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

export const RecentProjectsTable: React.FC<RecentProjectsTableProps> = ({
  projects,
  onViewProject,
}) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Chưa có dự án nào trong hệ thống cơ sở dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs font-medium">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <th className="py-3 px-4">Dự án</th>
            <th className="py-3 px-4">Khách hàng</th>
            <th className="py-3 px-4">Danh mục</th>
            <th className="py-3 px-4 text-center">Nổi bật</th>
            <th className="py-3 px-4">Trạng thái</th>
            <th className="py-3 px-4">Cập nhật</th>
            <th className="py-3 px-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-slate-50/80 transition-colors group text-slate-700"
            >
              {/* Project Title */}
              <td className="py-3.5 px-4 font-bold text-[#0b1329] max-w-[240px] truncate">
                <div className="flex items-center gap-2">
                  <span className="truncate">{project.title}</span>
                </div>
                <span className="text-[10.5px] font-mono text-slate-400 block truncate">
                  /{project.slug}
                </span>
              </td>

              {/* Client */}
              <td className="py-3.5 px-4 font-semibold text-slate-600">
                {project.client || '—'}
              </td>

              {/* Category */}
              <td className="py-3.5 px-4">
                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600 text-[10.5px]">
                  {project.category}
                </span>
              </td>

              {/* Featured */}
              <td className="py-3.5 px-4 text-center">
                {project.is_featured ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-50 text-amber-500 border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>

              {/* Status */}
              <td className="py-3.5 px-4">
                {renderStatusBadge(project.status)}
              </td>

              {/* Updated At */}
              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                {formatDate(project.updated_at)}
              </td>

              {/* Action */}
              <td className="py-3.5 px-4 text-right">
                <button
                  type="button"
                  onClick={() => {
                    if (onViewProject) {
                      onViewProject(project.slug);
                    } else {
                      window.open(`/#projects`, '_blank');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-slate-600 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-transparent transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Xem</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
