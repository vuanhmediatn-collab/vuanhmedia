import React from 'react';
import { 
  Layers, 
  FileText, 
  Video, 
  Activity, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { StatCard } from '../components/StatCard';
import { RecentProjectsTable } from '../components/RecentProjectsTable';
import { ActivityLogsList } from '../components/ActivityLogsList';

interface AdminDashboardPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateTab }) => {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-sky-500/20 border-t-sky-600 rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Đang tải dữ liệu tổng quan quản trị...
        </p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold">Không thể tải dữ liệu bảng điều khiển</h3>
            <p className="text-xs text-rose-700 mt-0.5">{error?.message || 'Lỗi kết nối cơ sở dữ liệu.'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-500 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Thử lại
        </button>
      </div>
    );
  }

  const { projectSummary, contentSummary, mediaSummary, recentProjects, activityLogs } = data;

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Chưa cập nhật';
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

  return (
    <div className="space-y-6">
      {/* Top Banner / System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase">
            Tổng quan hệ thống
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Theo dõi trạng thái thời gian thực của dữ liệu dự án, nội dung trang web và tài nguyên media.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-sky-600' : ''}`} />
            <span>{isFetching ? 'Đang làm mới...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Metric 1: Projects Summary */}
        <StatCard
          title="Tổng số Dự án"
          value={projectSummary.total}
          icon={Layers}
          iconBgClass="bg-sky-500/10"
          iconColorClass="text-sky-600"
          highlightBadge={{
            text: `${projectSummary.published} Đã xuất bản`,
            variant: 'success',
          }}
          breakdown={[
            { label: 'Xuất bản', count: projectSummary.published, colorClass: 'text-emerald-600' },
            { label: 'Nháp', count: projectSummary.draft, colorClass: 'text-amber-600' },
            { label: 'Ẩn', count: projectSummary.hidden, colorClass: 'text-slate-600' },
            { label: 'Lưu trữ', count: projectSummary.archived, colorClass: 'text-rose-600' },
          ]}
        />

        {/* Metric 2: Website Content Summary */}
        <StatCard
          title="Nội dung Website"
          value={contentSummary.total}
          icon={FileText}
          iconBgClass="bg-indigo-500/10"
          highlightBadge={
            contentSummary.pendingChangesCount > 0
              ? { text: `${contentSummary.pendingChangesCount} thay đổi chờ xuất bản`, variant: 'warning' }
              : { text: 'Không có thay đổi chờ xuất bản', variant: 'success' }
          }
          subtitle={`Lần cập nhật gần nhất: ${formatDate(contentSummary.lastUpdatedAt)}`}
        />


        {/* Metric 3: Media Summary */}
        <StatCard
          title="Tài nguyên Media"
          value={mediaSummary.totalAssets}
          icon={Video}
          iconBgClass="bg-cyan-500/10"
          iconColorClass="text-cyan-600"
          highlightBadge={{
            text: `${mediaSummary.totalVideos} Video Clip`,
            variant: 'info',
          }}
          breakdown={[
            { label: 'Videos', count: mediaSummary.totalVideos, colorClass: 'text-cyan-600' },
            { label: 'Gallery Media', count: mediaSummary.totalMedia, colorClass: 'text-slate-600' },
          ]}
        />
      </div>

      {/* Main Grid: Recent Projects Table & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Projects Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-3xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#0b1329] uppercase tracking-tight">
                  Danh sách Dự án mới nhất
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Hiển thị tối đa 8 dự án được cập nhật gần nhất từ bảng public.projects
                </span>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('/admin/projects')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <RecentProjectsTable projects={recentProjects} />
          </div>
        </div>

        {/* Right 1 Col: Recent Activity Logs & Quick System Info */}
        <div className="space-y-6">
          {/* Activity Logs Panel */}
          <div className="glass-panel rounded-3xl border border-slate-200/80 bg-white/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0b1329] uppercase tracking-tight">
                  Nhật ký hoạt động
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  Hoạt động gần đây
                </span>
                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('/admin/activity')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                  >
                    <span>Xem tất cả</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>


            <ActivityLogsList logs={activityLogs} />
          </div>

          {/* Quick Security & Infrastructure Badge */}
          <div className="rounded-2xl p-4 bg-slate-900 text-slate-200 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Hạ tầng Bảo mật Supabase RLS</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Dữ liệu được bảo vệ nghiêm ngặt bằng Row Level Security. Quyền ghi và chỉnh sửa yêu cầu xác thực vai trò quản trị viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
