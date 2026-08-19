import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  RefreshCw, 
  Eye, 
  Layers, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { useSiteContentAdmin } from '../hooks/useSiteContentAdmin';
import { useContentMutations } from '../hooks/useContentMutations';
import { ContentSectionTabs } from '../components/ContentSectionTabs';
import { ContentFieldEditor } from '../components/ContentFieldEditor';
import { ContentPublishConfirmModal, type ContentConfirmActionType } from '../components/ContentPublishConfirmModal';
import { AdminContentPreviewPage } from './AdminContentPreviewPage';
import type { SiteContentSection, EnrichedSiteContentRow } from '../types/content.types';
import { SECTION_LABELS } from '../utils/contentLabels';

export const AdminContentPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SiteContentSection>('hero');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Confirm Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    actionType: ContentConfirmActionType;
    title: string;
    targetId?: string;
    section?: SiteContentSection;
    count?: number;
  }>({
    isOpen: false,
    actionType: 'publish_field',
    title: '',
  });

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { rows, summary, isLoading, isError, error, refetch, isFetching } = useSiteContentAdmin();

  const {
    saveDraftMutation,
    publishFieldMutation,
    publishSectionMutation,
    publishAllMutation,
    discardDraftMutation,
  } = useContentMutations();

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Filter rows belonging to the active section
  const currentSectionRows = useMemo(() => {
    return rows.filter((r) => r.section === activeSection);
  }, [rows, activeSection]);

  const currentSectionMeta = SECTION_LABELS[activeSection];
  const currentSectionSummary = summary.sections.find((s) => s.section === activeSection);
  const currentSectionPendingCount = currentSectionSummary?.pending ?? 0;

  // Single Save Draft Handler
  const handleSaveDraft = async (id: string, value: any) => {
    try {
      await saveDraftMutation.mutateAsync({ id, draftValue: value });
      showFeedback('success', 'Đã lưu bản nháp thành công.');
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi lưu bản nháp.');
    }
  };

  // Request Single Field Publish
  const handleRequestPublishField = (row: EnrichedSiteContentRow) => {
    setConfirmModalState({
      isOpen: true,
      actionType: 'publish_field',
      title: row.humanLabel,
      targetId: row.id,
      count: 1,
    });
  };

  // Request Section Publish
  const handleRequestPublishSection = () => {
    if (currentSectionPendingCount === 0) return;
    setConfirmModalState({
      isOpen: true,
      actionType: 'publish_section',
      title: currentSectionMeta.name,
      section: activeSection,
      count: currentSectionPendingCount,
    });
  };

  // Request Publish All
  const handleRequestPublishAll = () => {
    if (summary.pendingChanges === 0) return;
    setConfirmModalState({
      isOpen: true,
      actionType: 'publish_all',
      title: 'Toàn bộ website',
      count: summary.pendingChanges,
    });
  };

  // Request Discard Draft
  const handleRequestDiscardDraft = (row: EnrichedSiteContentRow) => {
    setConfirmModalState({
      isOpen: true,
      actionType: 'discard',
      title: row.humanLabel,
      targetId: row.id,
      count: 1,
    });
  };

  // Execute Confirmed Modal Action
  const handleExecuteConfirmedAction = async () => {
    const { actionType, targetId, section, count } = confirmModalState;
    try {
      if (actionType === 'publish_field' && targetId) {
        await publishFieldMutation.mutateAsync(targetId);
        showFeedback('success', 'Đã xuất bản nội dung lên website chính thức.');
      } else if (actionType === 'publish_section' && section) {
        await publishSectionMutation.mutateAsync(section);
        showFeedback('success', `Đã xuất bản toàn bộ thay đổi trong mục "${currentSectionMeta.name}".`);
      } else if (actionType === 'publish_all') {
        const updatedCount = await publishAllMutation.mutateAsync();
        showFeedback('success', `Đã xuất bản thành công ${updatedCount || count} trường nội dung lên website.`);
      } else if (actionType === 'discard' && targetId) {
        await discardDraftMutation.mutateAsync(targetId);
        showFeedback('success', 'Đã hoàn tác bản nháp về nội dung đang xuất bản.');
      }
      setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      showFeedback('error', err.message || 'Lỗi xử lý yêu cầu.');
    }
  };

  // If in Preview Mode, render AdminContentPreviewPage
  if (isPreviewOpen) {
    return <AdminContentPreviewPage onBackToEditor={() => setIsPreviewOpen(false)} />;
  }

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

      {/* Top Header Summary Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase">
              Nội dung Website
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {summary.totalFields} Trường
              </span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  summary.pendingChanges > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {summary.pendingChanges > 0
                  ? `${summary.pendingChanges} Thay đổi chưa xuất bản`
                  : 'Đã đồng bộ 100%'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Chỉnh sửa bản nháp, xem trước an toàn và xuất bản tức thì mà không cần biên dịch lại mã nguồn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-sky-600' : ''}`} />
            <span>{isFetching ? 'Đang tải...' : 'Làm mới'}</span>
          </button>

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Xem trước (Preview)</span>
          </button>

          {/* Publish All Changes Button */}
          <button
            type="button"
            disabled={summary.pendingChanges === 0 || publishAllMutation.isPending}
            onClick={handleRequestPublishAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-emerald-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Globe className="w-4 h-4" />
            <span>
              {publishAllMutation.isPending
                ? 'Đang xuất bản...'
                : `Xuất bản tất cả (${summary.pendingChanges})`}
            </span>
          </button>
        </div>
      </div>

      {/* Main Section Tabs */}
      <ContentSectionTabs
        sections={summary.sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Section Header & Section Publish Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-[#0b1329]">
              Chuyên mục: {currentSectionMeta.name}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {currentSectionRows.length} trường
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentSectionMeta.description}
          </p>
        </div>

        {/* Section Publish Button */}
        <button
          type="button"
          disabled={currentSectionPendingCount === 0 || publishSectionMutation.isPending}
          onClick={handleRequestPublishSection}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-emerald-600 disabled:shadow-none disabled:cursor-not-allowed self-start sm:self-auto shrink-0"
        >
          <Layers className="w-4 h-4" />
          <span>
            {publishSectionMutation.isPending
              ? 'Đang xuất bản...'
              : `Xuất bản mục này (${currentSectionPendingCount})`}
          </span>
        </button>
      </div>

      {/* Content Field Editors */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-sky-500/20 border-t-sky-600 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Đang tải dữ liệu nội dung...
          </span>
        </div>
      ) : isError ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h4 className="text-sm font-bold">Lỗi tải dữ liệu nội dung website</h4>
          </div>
          <p className="text-xs text-rose-700">{error?.message || 'Không thể kết nối Supabase.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentSectionRows.map((row) => (
            <ContentFieldEditor
              key={row.id}
              row={row}
              isSaving={saveDraftMutation.isPending}
              isPublishing={publishFieldMutation.isPending}
              isDiscarding={discardDraftMutation.isPending}
              onSaveDraft={handleSaveDraft}
              onRequestPublish={handleRequestPublishField}
              onRequestDiscard={handleRequestDiscardDraft}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ContentPublishConfirmModal
        isOpen={confirmModalState.isOpen}
        actionType={confirmModalState.actionType}
        title={confirmModalState.title}
        count={confirmModalState.count}
        isSubmitting={
          publishFieldMutation.isPending ||
          publishSectionMutation.isPending ||
          publishAllMutation.isPending ||
          discardDraftMutation.isPending
        }
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
