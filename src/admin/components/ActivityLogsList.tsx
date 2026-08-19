import React from 'react';
import { History, ShieldCheck, FileEdit, Database, Layers } from 'lucide-react';

import type { AdminActivityLogItem } from '../services/dashboard.service';

interface ActivityLogsListProps {
  logs: AdminActivityLogItem[];
}

const getActivityIcon = (entityType: string) => {
  switch (entityType?.toLowerCase()) {
    case 'project':
    case 'projects':
      return <Layers className="w-3.5 h-3.5 text-sky-500" />;
    case 'site_content':
    case 'content':
      return <FileEdit className="w-3.5 h-3.5 text-amber-500" />;
    case 'auth':
    case 'admin_users':
      return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />;
    default:
      return <Database className="w-3.5 h-3.5 text-slate-500" />;
  }
};

const formatTime = (isoString: string) => {
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

export const ActivityLogsList: React.FC<ActivityLogsListProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="py-10 text-center space-y-2">
        <History className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Chưa có nhật ký hoạt động nào được ghi lại.</p>
        <span className="text-[10px] text-slate-400">Các thao tác chỉnh sửa dữ liệu và đăng nhập sẽ được ghi tự động vào bảng activity_logs.</span>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {logs.map((log) => {
        const actor = log.user_email ? log.user_email : 'Hệ thống';

        return (
          <div key={log.id} className="py-3 px-4 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              {getActivityIcon(log.entity_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-bold text-[#0b1329] truncate">
                  {log.action}
                </span>
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {formatTime(log.created_at)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                <span className="font-semibold text-slate-700">{log.entity_type}</span>
                {log.entity_title && <span>: {log.entity_title}</span>}
                <span className="text-slate-400 font-medium"> • Thực hiện bởi: <strong className="text-slate-600 font-semibold">{actor}</strong></span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
