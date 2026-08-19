import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

import { useProjectVideos, useAdminProjectsForMedia } from '../hooks/useProjectVideos';
import { useProjectMedia } from '../hooks/useProjectMedia';
import { useMediaMutations } from '../hooks/useMediaMutations';
import { useProjectMutations } from '../../projects/hooks/useProjectMutations';
import { ProjectFormDrawer } from '../../projects/components/ProjectFormDrawer';
import { MediaTabs, type MediaTabKey } from '../components/MediaTabs';
import { VideoListTable } from '../components/VideoListTable';
import { VideoFormDrawer } from '../components/VideoFormDrawer';
import { ImageListTable } from '../components/ImageListTable';
import { ImageFormDrawer } from '../components/ImageFormDrawer';
import { MediaStatusConfirmModal } from '../components/MediaStatusConfirmModal';
import { MediaDeleteConfirmModal } from '../components/MediaDeleteConfirmModal';
import type { 
  EnrichedProjectVideo, 
  EnrichedProjectMedia, 
  VideoFormData, 
  ImageFormData 
} from '../types/media.types';
import type { ProjectFormData } from '../../projects/types/project.types';
import type { VideoProvider } from '../../../types/database.types';

export const AdminMediaPage: React.FC = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState<MediaTabKey>('videos');

  // URL Query State for project filter: /admin/media?project=<id>
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'published' | 'hidden' | 'all'>('all');
  const [providerFilter, setProviderFilter] = useState<VideoProvider | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer / Modal States
  const [videoDrawerOpen, setVideoDrawerOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<EnrichedProjectVideo | null>(null);

  const [imageDrawerOpen, setImageDrawerOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<EnrichedProjectMedia | null>(null);

  // Quick Project Creation Modal from Media Drawer
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | undefined>(undefined);

  // Status Confirm Modal State
  const [statusConfirmState, setStatusConfirmState] = useState<{
    isOpen: boolean;
    itemTitle: string;
    itemType: 'video' | 'hình ảnh';
    currentStatus: 'published' | 'hidden';
    targetStatus: 'published' | 'hidden';
    parentProjectStatus?: string;
    targetId: string;
    tab: MediaTabKey;
  }>({
    isOpen: false,
    itemTitle: '',
    itemType: 'video',
    currentStatus: 'hidden',
    targetStatus: 'published',
    targetId: '',
    tab: 'videos',
  });

  // Delete Confirm Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    itemTitle: string;
    itemType: 'video' | 'hình ảnh';
    targetId: string;
    tab: MediaTabKey;
  }>({
    isOpen: false,
    itemTitle: '',
    itemType: 'video',
    targetId: '',
    tab: 'videos',
  });

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize project filter from URL search params if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const proj = params.get('project');
    if (proj) {
      setSelectedProjectId(proj);
    }
  }, []);

  // Data Queries
  const { data: projects = [], refetch: refetchProjects } = useAdminProjectsForMedia();
  const {
    data: allVideos = [],
    isLoading: isVideosLoading,
    isError: isVideosError,
    error: videosError,
    refetch: refetchVideos,
    isFetching: isVideosFetching,
  } = useProjectVideos({
    projectId: selectedProjectId,
    status: statusFilter,
    provider: providerFilter,
    search: searchTerm,
  });

  const {
    data: allMedia = [],
    isLoading: isMediaLoading,
    isError: isMediaError,
    error: mediaError,
    refetch: refetchMedia,
    isFetching: isMediaFetching,
  } = useProjectMedia({
    projectId: selectedProjectId,
    status: statusFilter,
    search: searchTerm,
  });

  // Mutations
  const {
    createVideoMutation,
    updateVideoMutation,
    deleteVideoMutation,
    createMediaMutation,
    updateMediaMutation,
    deleteMediaMutation,
  } = useMediaMutations();

  const { createMutation: createProjectMutation } = useProjectMutations();

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Determine active default project ID from URL query if valid
  const activeDefaultProjectId = useMemo(() => {
    if (createdProjectId) return createdProjectId;
    if (selectedProjectId === 'all' || !selectedProjectId) return undefined;
    const exists = projects.some((p) => p.id === selectedProjectId);
    return exists ? selectedProjectId : undefined;
  }, [selectedProjectId, createdProjectId, projects]);

  // Next default sort orders
  const nextVideoSortOrder = useMemo(() => {
    if (allVideos.length === 0) return 1;
    const max = Math.max(...allVideos.map((v) => v.sort_order ?? 0));
    return max + 1;
  }, [allVideos]);

  const nextImageSortOrder = useMemo(() => {
    if (allMedia.length === 0) return 1;
    const max = Math.max(...allMedia.map((m) => m.sort_order ?? 0));
    return max + 1;
  }, [allMedia]);

  const nextProjectSortOrder = useMemo(() => {
    return projects.length + 1;
  }, [projects]);

  // Video Handlers
  const handleOpenCreateVideo = () => {
    setVideoToEdit(null);
    setCreatedProjectId(undefined);
    setVideoDrawerOpen(true);
  };

  const handleOpenEditVideo = (video: EnrichedProjectVideo) => {
    setVideoToEdit(video);
    setCreatedProjectId(undefined);
    setVideoDrawerOpen(true);
  };

  const handleSaveVideo = async (formData: VideoFormData, id?: string) => {
    if (id) {
      await updateVideoMutation.mutateAsync({ id, payload: formData });
      showFeedback('success', `Đã cập nhật video "${formData.title}" thành công.`);
    } else {
      await createVideoMutation.mutateAsync(formData);
      showFeedback('success', `Đã thêm video mới "${formData.title}" thành công.`);
    }
    setVideoDrawerOpen(false);
  };

  // Image Handlers
  const handleOpenCreateImage = () => {
    setImageToEdit(null);
    setCreatedProjectId(undefined);
    setImageDrawerOpen(true);
  };

  const handleOpenEditImage = (media: EnrichedProjectMedia) => {
    setImageToEdit(media);
    setCreatedProjectId(undefined);
    setImageDrawerOpen(true);
  };

  const handleSaveImage = async (formData: ImageFormData, id?: string) => {
    if (id) {
      await updateMediaMutation.mutateAsync({ id, payload: formData });
      showFeedback('success', 'Đã cập nhật hình ảnh thành công.');
    } else {
      await createMediaMutation.mutateAsync(formData);
      showFeedback('success', 'Đã thêm hình ảnh mới thành công.');
    }
    setImageDrawerOpen(false);
  };

  // Create Project on-the-fly from Media Form
  const handleSaveNewProjectFromMedia = async (projectData: ProjectFormData) => {
    const newProject = await createProjectMutation.mutateAsync(projectData as any);
    await refetchProjects();
    setCreatedProjectId(newProject.id);
    setIsProjectDrawerOpen(false);
    showFeedback(
      'success',
      `Đã tạo dự án "${newProject.title}" và tự động chọn vào biểu mẫu media.`
    );
  };

  // Status Change Confirmation Handlers
  const handleRequestVideoStatus = (
    video: EnrichedProjectVideo,
    targetStatus: 'published' | 'hidden'
  ) => {
    setStatusConfirmState({
      isOpen: true,
      itemTitle: video.title,
      itemType: 'video',
      currentStatus: video.status as any,
      targetStatus,
      parentProjectStatus: video.project?.status,
      targetId: video.id,
      tab: 'videos',
    });
  };

  const handleRequestImageStatus = (
    media: EnrichedProjectMedia,
    targetStatus: 'published' | 'hidden'
  ) => {
    setStatusConfirmState({
      isOpen: true,
      itemTitle: media.caption || 'Hình ảnh dự án',
      itemType: 'hình ảnh',
      currentStatus: media.status as any,
      targetStatus,
      parentProjectStatus: media.project?.status,
      targetId: media.id,
      tab: 'images',
    });
  };

  const handleConfirmStatusChange = async () => {
    const { targetId, targetStatus, tab } = statusConfirmState;
    try {
      if (tab === 'videos') {
        await updateVideoMutation.mutateAsync({
          id: targetId,
          payload: { status: targetStatus },
        });
        showFeedback('success', `Đã chuyển trạng thái video sang "${targetStatus === 'published' ? 'Đã xuất bản' : 'Đang ẩn'}".`);
      } else {
        await updateMediaMutation.mutateAsync({
          id: targetId,
          payload: { status: targetStatus },
        });
        showFeedback('success', `Đã chuyển trạng thái hình ảnh sang "${targetStatus === 'published' ? 'Đã xuất bản' : 'Đang ẩn'}".`);
      }
      setStatusConfirmState((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi cập nhật trạng thái.');
    }
  };

  // Delete Confirmation Handlers
  const handleRequestDeleteVideo = (video: EnrichedProjectVideo) => {
    setDeleteConfirmState({
      isOpen: true,
      itemTitle: video.title,
      itemType: 'video',
      targetId: video.id,
      tab: 'videos',
    });
  };

  const handleRequestDeleteImage = (media: EnrichedProjectMedia) => {
    setDeleteConfirmState({
      isOpen: true,
      itemTitle: media.caption || 'Hình ảnh dự án',
      itemType: 'hình ảnh',
      targetId: media.id,
      tab: 'images',
    });
  };

  const handleConfirmDelete = async () => {
    const { targetId, tab } = deleteConfirmState;
    try {
      if (tab === 'videos') {
        await deleteVideoMutation.mutateAsync(targetId);
        showFeedback('success', 'Đã xóa liên kết video khỏi dự án thành công.');
      } else {
        await deleteMediaMutation.mutateAsync(targetId);
        showFeedback('success', 'Đã xóa hình ảnh khỏi dự án thành công.');
      }
      setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi xóa tài nguyên media.');
    }
  };

  const isCurrentTabLoading = activeTab === 'videos' ? isVideosLoading : isMediaLoading;
  const isCurrentTabFetching = activeTab === 'videos' ? isVideosFetching : isMediaFetching;
  const isCurrentTabError = activeTab === 'videos' ? isVideosError : isMediaError;
  const currentTabError = activeTab === 'videos' ? videosError : mediaError;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
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

      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase">
              Quản lý Media
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {allVideos.length} Video
              </span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                {allMedia.length} Hình ảnh
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Quản trị video nhúng (YouTube, Vimeo, Drive) và bộ sưu tập hình ảnh liên kết theo từng dự án.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              refetchVideos();
              refetchMedia();
              refetchProjects();
            }}
            disabled={isCurrentTabFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCurrentTabFetching ? 'animate-spin text-sky-600' : ''}`} />
            <span>{isCurrentTabFetching ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          {activeTab === 'videos' ? (
            <button
              type="button"
              onClick={handleOpenCreateVideo}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm video</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateImage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm hình ảnh</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <MediaTabs
        activeTab={activeTab}
        videoCount={allVideos.length}
        imageCount={allMedia.length}
        onTabChange={setActiveTab}
      />

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Project Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Lọc theo Dự án
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all cursor-pointer"
          >
            <option value="all">Tất cả dự án ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.status === 'published' ? 'Xuất bản' : 'Bản nháp'})
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Trạng thái hiển thị
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="hidden">Đang ẩn</option>
          </select>
        </div>

        {/* Provider Dropdown (Videos Only) */}
        {activeTab === 'videos' ? (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Nền tảng Video
            </label>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all cursor-pointer"
            >
              <option value="all">Tất cả nền tảng</option>
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="drive">Google Drive</option>
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Loại tài nguyên
            </label>
            <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500">
              Định dạng Hình ảnh (Image)
            </div>
          </div>
        )}

        {/* Search Box */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Tìm kiếm từ khóa
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tiêu đề, dự án, URL..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:bg-white focus:border-[#0284c7] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isCurrentTabLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-sky-500/20 border-t-sky-600 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Đang tải dữ liệu media...
          </span>
        </div>
      ) : isCurrentTabError ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h4 className="text-sm font-bold">Lỗi tải dữ liệu media</h4>
          </div>
          <p className="text-xs text-rose-700">{currentTabError?.message || 'Không thể kết nối Supabase.'}</p>
        </div>
      ) : activeTab === 'videos' ? (
        <VideoListTable
          videos={allVideos}
          onEdit={handleOpenEditVideo}
          onRequestStatusChange={handleRequestVideoStatus}
          onDelete={handleRequestDeleteVideo}
        />
      ) : (
        <ImageListTable
          mediaList={allMedia}
          onEdit={handleOpenEditImage}
          onRequestStatusChange={handleRequestImageStatus}
          onDelete={handleRequestDeleteImage}
        />
      )}

      {/* Video Drawer */}
      <VideoFormDrawer
        isOpen={videoDrawerOpen}
        videoToEdit={videoToEdit}
        projects={projects}
        defaultProjectId={activeDefaultProjectId}
        defaultSortOrder={nextVideoSortOrder}
        isSaving={createVideoMutation.isPending || updateVideoMutation.isPending}
        onSave={handleSaveVideo}
        onClose={() => setVideoDrawerOpen(false)}
        onCreateNewProject={() => setIsProjectDrawerOpen(true)}
      />

      {/* Image Drawer */}
      <ImageFormDrawer
        isOpen={imageDrawerOpen}
        mediaToEdit={imageToEdit}
        projects={projects}
        defaultProjectId={activeDefaultProjectId}
        defaultSortOrder={nextImageSortOrder}
        isSaving={createMediaMutation.isPending || updateMediaMutation.isPending}
        onSave={handleSaveImage}
        onClose={() => setImageDrawerOpen(false)}
        onCreateNewProject={() => setIsProjectDrawerOpen(true)}
      />

      {/* Embedded Project Form Drawer for creating projects on-the-fly */}
      <ProjectFormDrawer
        isOpen={isProjectDrawerOpen}
        projectToEdit={null}
        defaultSortOrder={nextProjectSortOrder}
        isSaving={createProjectMutation.isPending}
        onSave={handleSaveNewProjectFromMedia}
        onClose={() => setIsProjectDrawerOpen(false)}
      />

      {/* Status Confirm Modal */}
      <MediaStatusConfirmModal
        isOpen={statusConfirmState.isOpen}
        itemTitle={statusConfirmState.itemTitle}
        itemType={statusConfirmState.itemType}
        currentStatus={statusConfirmState.currentStatus}
        targetStatus={statusConfirmState.targetStatus}
        parentProjectStatus={statusConfirmState.parentProjectStatus}
        isSubmitting={updateVideoMutation.isPending || updateMediaMutation.isPending}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Delete Confirm Modal */}
      <MediaDeleteConfirmModal
        isOpen={deleteConfirmState.isOpen}
        itemTitle={deleteConfirmState.itemTitle}
        itemType={deleteConfirmState.itemType}
        isDeleting={deleteVideoMutation.isPending || deleteMediaMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
