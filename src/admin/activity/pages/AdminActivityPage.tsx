import React, { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  Clock, 
  Users, 
  AlertCircle 
} from 'lucide-react';

import { useActivityLogs, useActivitySummary } from '../hooks/useActivityLogs';
import { ActivityFilters } from '../components/ActivityFilters';
import { ActivityTable } from '../components/ActivityTable';
import { ActivityPagination } from '../components/ActivityPagination';
import { ActivityDetailDrawer } from '../components/ActivityDetailDrawer';
import type { ActivityFiltersState, ActivityLogRow } from '../types/activity.types';

const INITIAL_FILTERS: ActivityFiltersState = {
  search: '',
  entityType: 'all',
  action: 'all',
  userEmail: 'all',
  quickFilter: 'all',
};

export const AdminActivityPage: React.FC = () => {
  const [filters, setFilters] = useState<ActivityFiltersState>(INITIAL_FILTERS);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [selectedLog, setSelectedLog] = useState<ActivityLogRow | null>(null);

  // Queries
  const {
    data: logsResponse,
    isLoading: isLogsLoading,
    isError: isLogsError,
    error: logsError,
    refetch: refetchLogs,
    isFetching: isLogsFetching,
  } = useActivityLogs(filters, page, pageSize);

  const {
    data: summary,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useActivitySummary();

  const handleFilterChange = (partialFilters: Partial<ActivityFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...partialFilters }));
    setPage(1); // Reset to page 1 on filter change
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const isRefreshing = isLogsFetching || isSummaryFetching;

  return (
    <div className="space-y-6">
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase">
              Nhật ký hoạt động
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Kiểm toán hệ thống (Audit Trail)
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Theo dõi chi tiết các thao tác tạo mới, cập nhật, xuất bản và xóa dữ liệu trong CMS.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            refetchLogs();
            refetchSummary();
          }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
          <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Activities */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 block">
              Tổng số hoạt động
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0b1329]">
              {summary?.total ?? (logsResponse?.count || 0)}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Đã ghi nhận trong cơ sở dữ liệu
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Activities Today */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 block">
              Hoạt động hôm nay
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {summary?.today ?? 0}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Tính từ 00:00 hôm nay
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Active Actors */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 block">
              Người thực hiện gần đây
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600">
              {(summary?.recentActors.length || 0) + 1}
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Quản trị viên & Hệ thống
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <ActivityFilters
        filters={filters}
        recentActors={summary?.recentActors || []}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Table / Loading / Error */}
      {isLogsLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-sky-500/20 border-t-sky-600 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Đang tải dữ liệu nhật ký hoạt động...
          </span>
        </div>
      ) : isLogsError ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h4 className="text-sm font-bold">Lỗi tải nhật ký hoạt động</h4>
          </div>
          <p className="text-xs text-rose-700">{logsError?.message || 'Không thể kết nối Supabase.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ActivityTable
            logs={logsResponse?.data || []}
            onSelectLog={(log) => setSelectedLog(log)}
          />

          {/* Pagination */}
          <ActivityPagination
            currentPage={page}
            totalPages={logsResponse?.totalPages || 1}
            totalItems={logsResponse?.count || 0}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* Detail Drawer */}
      <ActivityDetailDrawer
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};
