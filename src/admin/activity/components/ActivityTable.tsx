import React from 'react';
import { 
  Activity, 
  Eye, 
  ArrowRight, 
  Layers, 
  FileText, 
  Video, 
  Image as ImageIcon,
  History
} from 'lucide-react';
import type { ActivityLogRow } from '../types/activity.types';
import { 
  getActionDisplay, 
  getEntityDisplay, 
  formatActor, 
  formatLogDateTime,
  formatStatusTransition
} from '../utils/activityLabels';

interface ActivityTableProps {
  logs: ActivityLogRow[];
  onSelectLog: (log: ActivityLogRow) => void;
}

const getEntityIcon = (entityType: string) => {
  switch (entityType?.toLowerCase()) {
    case 'project':
    case 'projects':
      return <Layers className="w-3.5 h-3.5 text-sky-600" />;
    case 'project_video':
    case 'project_videos':
      return <Video className="w-3.5 h-3.5 text-indigo-600" />;
    case 'project_media':
      return <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />;
    case 'site_content':
      return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    default:
      return <Activity className="w-3.5 h-3.5 text-slate-500" />;
  }
};

export const ActivityTable: React.FC<ActivityTableProps> = ({ logs, onSelectLog }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
        <History className="w-10 h-10 text-slate-300 mx-auto" />
        <h4 className="text-sm font-bold text-[#0b1329]">
          Không tìm thấy nhật ký hoạt động phù hợp
        </h4>
        <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
          Thử thay đổi bộ lọc tìm kiếm, loại đối tượng hoặc hành động để xem các hoạt động khác.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-4 sm:px-6">Thời gian</th>
              <th className="py-3.5 px-4">Người thực hiện</th>
              <th className="py-3.5 px-4">Hành động</th>
              <th className="py-3.5 px-4">Đối tượng</th>
              <th className="py-3.5 px-4">Nội dung / Tiêu đề</th>
              <th className="py-3.5 px-4 text-right pr-6">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {logs.map((log) => {
              const actionDisplay = getActionDisplay(log.action);
              const entityName = getEntityDisplay(log.entity_type);
              const actorName = formatActor(log.user_email);
              const statusTransition = formatStatusTransition(log.metadata);

              return (
                <tr
                  key={log.id}
                  onClick={() => onSelectLog(log)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Thời gian */}
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatLogDateTime(log.created_at)}
                  </td>

                  {/* Người thực hiện */}
                  <td className="py-3.5 px-4 font-semibold text-[#0b1329] whitespace-nowrap">
                    <span className={log.user_email ? 'text-slate-800' : 'text-slate-500 italic'}>
                      {actorName}
                    </span>
                  </td>

                  {/* Hành động */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${actionDisplay.badgeClass}`}
                    >
                      {actionDisplay.label}
                    </span>
                  </td>

                  {/* Đối tượng */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-[10.5px] font-bold text-slate-700">
                      {getEntityIcon(log.entity_type)}
                      <span>{entityName}</span>
                    </div>
                  </td>

                  {/* Nội dung / Tiêu đề */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-[#0b1329] truncate block">
                        {log.entity_title || 'Không có tiêu đề'}
                      </span>
                      {statusTransition && (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-sky-700">
                          <ArrowRight className="w-3 h-3 shrink-0" />
                          <span>{statusTransition}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Chi tiết Button */}
                  <td className="py-3.5 px-4 text-right pr-6 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLog(log);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
