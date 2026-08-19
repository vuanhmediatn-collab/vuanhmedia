import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useProjectMutations } from '../hooks/useProjectMutations';
import { ProjectListTable } from '../components/ProjectListTable';
import { ProjectFormDrawer } from '../components/ProjectFormDrawer';
import { ProjectStatusConfirmModal } from '../components/ProjectStatusConfirmModal';
import type { ProjectRow, ProjectFormData } from '../types/project.types';
import type { ProjectStatus } from '../../../types/database.types';

export const AdminProjectsPage: React.FC = () => {
  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  // Drawer / Modal States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectRow | null>(null);

  // Status Change Confirmation State
  const [statusConfirmState, setStatusConfirmState] = useState<{
    isOpen: boolean;
    project: ProjectRow | null;
    targetStatus: ProjectStatus;
  }>({
    isOpen: false,
    project: null,
    targetStatus: 'draft',
  });

  // Notification / Toast Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data Queries
  const { data: allProjects = [], isLoading, isError, error, refetch, isFetching } = useProjects();
  const {
    createMutation,
    updateMutation,
    statusMutation,
    toggleFeaturedMutation,
  } = useProjectMutations();



  // Distinct Categories from DB
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [allProjects]);

  // Next default sort order for new projects
  const nextSortOrder = useMemo(() => {
    if (allProjects.length === 0) return 1;
    const maxOrder = Math.max(...allProjects.map((p) => p.sort_order ?? 0));
    return maxOrder + 1;
  }, [allProjects]);

  // Filtered dataset
  const filteredProjects = useMemo(() => {
    let list = [...allProjects];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.client && p.client.toLowerCase().includes(term)) ||
          p.slug.toLowerCase().includes(term)
      );
    }

    // Sort order ASC, then updated_at DESC
    list.sort((a, b) => {
      const orderA = a.sort_order ?? 999;
      const orderB = b.sort_order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return list;
  }, [allProjects, statusFilter, categoryFilter, searchTerm]);

  // Counts for status tabs
  const statusCounts = useMemo(() => {
    return {
      all: allProjects.length,
      published: allProjects.filter((p) => p.status === 'published').length,
      draft: allProjects.filter((p) => p.status === 'draft').length,
      hidden: allProjects.filter((p) => p.status === 'hidden').length,
      archived: allProjects.filter((p) => p.status === 'archived').length,
    };
  }, [allProjects]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handlers
  const handleOpenCreate = () => {
    setProjectToEdit(null);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (project: ProjectRow) => {
    setProjectToEdit(project);
    setDrawerOpen(true);
  };

  const handleViewProject = (project: ProjectRow) => {
    if (project.status === 'published') {
      window.open(`/#projects`, '_blank');
    } else {
      // Non-published projects open in edit drawer preview
      handleOpenEdit(project);
    }
  };

  const handleSaveProject = async (formData: ProjectFormData, id?: string) => {
    if (id) {
      await updateMutation.mutateAsync({
        id,
        payload: formData,
      });
      showFeedback('success', `Đã cập nhật dự án "${formData.title}" thành công.`);
    } else {
      await createMutation.mutateAsync(formData);
      showFeedback('success', `Đã tạo dự án mới "${formData.title}" thành công.`);
    }
    setDrawerOpen(false);
  };

  const handleToggleFeatured = async (project: ProjectRow) => {
    const nextVal = !project.is_featured;
    try {
      await toggleFeaturedMutation.mutateAsync({
        id: project.id,
        is_featured: nextVal,
      });
      showFeedback(
        'success',
        `Đã ${nextVal ? 'đánh dấu nổi bật' : 'hạ nổi bật'} dự án "${project.title}".`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi cập nhật trạng thái nổi bật.');
    }
  };

  const handleRequestStatusChange = (project: ProjectRow, targetStatus: ProjectStatus) => {
    // Show confirmation modal for any status change involving published or explicit change
    setStatusConfirmState({
      isOpen: true,
      project,
      targetStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmState.project) return;
    const { project, targetStatus } = statusConfirmState;

    try {
      await statusMutation.mutateAsync({
        id: project.id,
        status: targetStatus,
      });
      showFeedback('success', `Đã chuyển trạng thái dự án "${project.title}" sang "${targetStatus}".`);
      setStatusConfirmState({ isOpen: false, project: null, targetStatus: 'draft' });
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi cập nhật trạng thái dự án.');
    }
  };

  const handleArchiveProject = (project: ProjectRow) => {
    handleRequestStatusChange(project, 'archived');
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-black uppercase opacity-60 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase">
              Quản lý Dự án
            </h2>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {allProjects.length} dự án
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Quản trị toàn bộ danh mục sản phẩm, trạng thái vòng đời xuất bản và thứ tự hiển thị.
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
            <span>{isFetching ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm dự án</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200/80 pb-2">
          {[
            { key: 'all', label: 'Tất cả', count: statusCounts.all },
            { key: 'published', label: 'Đã xuất bản', count: statusCounts.published },
            { key: 'draft', label: 'Bản nháp', count: statusCounts.draft },
            { key: 'hidden', label: 'Đã ẩn', count: statusCounts.hidden },
            { key: 'archived', label: 'Lưu trữ', count: statusCounts.archived },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-slate-700 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Inputs */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, khách hàng hoặc slug..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0b1329] focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Category Filter */}
          {availableCategories.length > 0 && (
            <div className="sm:w-60 shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0b1329] focus:border-[#0284c7] outline-none transition-all cursor-pointer"
              >
                <option value="all">Tất cả danh mục ({availableCategories.length})</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Table View */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-sky-500/20 border-t-sky-600 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Đang tải danh sách dự án...
          </span>
        </div>
      ) : isError ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h4 className="text-sm font-bold">Lỗi tải danh sách dự án</h4>
          </div>
          <p className="text-xs text-rose-700">{error?.message || 'Không thể kết nối Supabase.'}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-rose-500"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <ProjectListTable
          projects={filteredProjects}
          onEdit={handleOpenEdit}
          onView={handleViewProject}
          onRequestStatusChange={handleRequestStatusChange}
          onToggleFeatured={handleToggleFeatured}
          onArchive={handleArchiveProject}
        />
      )}

      {/* Drawer for Create & Edit */}
      <ProjectFormDrawer
        isOpen={drawerOpen}
        projectToEdit={projectToEdit}
        defaultSortOrder={nextSortOrder}
        isSaving={createMutation.isPending || updateMutation.isPending}
        onSave={handleSaveProject}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Status Change Confirmation Modal */}
      <ProjectStatusConfirmModal
        isOpen={statusConfirmState.isOpen}
        projectTitle={statusConfirmState.project?.title || ''}
        currentStatus={statusConfirmState.project?.status || 'draft'}
        targetStatus={statusConfirmState.targetStatus}
        isSubmitting={statusMutation.isPending}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusConfirmState({ isOpen: false, project: null, targetStatus: 'draft' })}
      />
    </div>
  );
};
