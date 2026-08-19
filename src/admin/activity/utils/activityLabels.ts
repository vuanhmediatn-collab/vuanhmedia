export interface ActionDisplayConfig {
  label: string;
  badgeClass: string;
}

export const ACTION_CONFIGS: Record<string, ActionDisplayConfig> = {
  CREATE: {
    label: 'Tạo mới',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  UPDATE: {
    label: 'Cập nhật',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  PUBLISH: {
    label: 'Xuất bản',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  UNPUBLISH: {
    label: 'Ẩn / Gỡ xuất bản',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  ARCHIVE: {
    label: 'Lưu trữ',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  REORDER: {
    label: 'Đổi thứ tự',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  DELETE: {
    label: 'Xóa',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const getActionDisplay = (action: string): ActionDisplayConfig => {
  const upper = action?.toUpperCase() || '';
  if (ACTION_CONFIGS[upper]) {
    return ACTION_CONFIGS[upper];
  }
  return {
    label: action ? action.charAt(0).toUpperCase() + action.slice(1).toLowerCase() : 'Thao tác',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };
};

export const ENTITY_LABELS: Record<string, string> = {
  project: 'Dự án',
  projects: 'Dự án',
  project_video: 'Video Clip',
  project_videos: 'Video Clip',
  project_media: 'Hình ảnh',
  site_content: 'Nội dung Website',
  auth: 'Xác thực / Phiên làm việc',
};

export const getEntityDisplay = (entityType: string): string => {
  const lower = entityType?.toLowerCase() || '';
  if (ENTITY_LABELS[lower]) {
    return ENTITY_LABELS[lower];
  }
  return entityType ? entityType.replace(/_/g, ' ') : 'Đối tượng';
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Bản nháp',
  published: 'Đã xuất bản',
  hidden: 'Đang ẩn',
  archived: 'Lưu trữ',
};

export const formatStatusName = (status: string): string => {
  const lower = status?.toLowerCase() || '';
  return STATUS_LABELS[lower] || status;
};

/**
 * Formats status change transition e.g. "Bản nháp → Đã xuất bản"
 */
export const formatStatusTransition = (metadata: any): string | null => {
  if (!metadata || typeof metadata !== 'object') return null;
  const oldStatus = metadata.old_status || metadata.previous_status;
  const newStatus = metadata.new_status || metadata.target_status;


  if (oldStatus && newStatus) {
    return `${formatStatusName(oldStatus)} → ${formatStatusName(newStatus)}`;
  }
  if (newStatus) {
    return `Chuyển sang: ${formatStatusName(newStatus)}`;
  }
  return null;
};

/**
 * Returns human-readable actor name, defaulting to "Hệ thống"
 */
export const formatActor = (email: string | null | undefined): string => {
  if (email && email.trim()) {
    return email.trim();
  }
  return 'Hệ thống';
};

/**
 * Safe Vietnamese DateTime formatter
 */
export const formatLogDateTime = (isoString: string): string => {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
};
