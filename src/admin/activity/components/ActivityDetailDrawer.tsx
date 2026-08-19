import React from 'react';
import { 
  X, 
  Activity, 
  Clock, 
  User, 
  Tag, 
  Database,
  ArrowRight
} from 'lucide-react';

import type { ActivityLogRow } from '../types/activity.types';
import { 
  getActionDisplay, 
  getEntityDisplay, 
  formatActor, 
  formatLogDateTime,
  formatStatusTransition
} from '../utils/activityLabels';

interface ActivityDetailDrawerProps {
  log: ActivityLogRow | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityDetailDrawer: React.FC<ActivityDetailDrawerProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !log) return null;

  const actionDisplay = getActionDisplay(log.action);
  const entityName = getEntityDisplay(log.entity_type);
  const actorName = formatActor(log.user_email);
  const statusTransition = formatStatusTransition(log.metadata);

  const renderMetadataEntries = () => {
    if (!log.metadata || Object.keys(log.metadata).length === 0) {
      return (
        <span className="text-xs font-semibold text-slate-400 italic">
          Không có thông tin bổ sung (Metadata rỗng).
        </span>
      );
    }

    return (
      <div className="space-y-2">
        {Object.entries(log.metadata).map(([key, val]) => {
          let displayVal = '';
          if (typeof val === 'object' && val !== null) {
            displayVal = JSON.stringify(val, null, 2);
          } else {
            displayVal = String(val ?? '');
          }

          return (
            <div
              key={key}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
            >
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider shrink-0">
                {key}
              </span>
              <span className="text-xs font-mono font-semibold text-[#0b1329] whitespace-pre-wrap break-all text-left sm:text-right">
                {displayVal}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#0b1329] tracking-tight">
                Chi tiết Nhật ký Hoạt động
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Log ID: {log.id}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Top Key Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${actionDisplay.badgeClass}`}>
                  {actionDisplay.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700">
                  {entityName}
                </span>
              </div>

              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatLogDateTime(log.created_at)}
              </span>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Tiêu đề đối tượng
              </span>
              <h4 className="text-sm font-extrabold text-[#0b1329] mt-0.5">
                {log.entity_title || 'Không có tiêu đề'}
              </h4>
            </div>

            {statusTransition && (
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-bold text-xs flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Chuyển đổi trạng thái: {statusTransition}</span>
              </div>
            )}
          </div>

          {/* Structured Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Actor */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3" />
                Người thực hiện
              </span>
              <span className="font-bold text-[#0b1329] block">
                {actorName}
              </span>
              {log.user_id && (
                <span className="text-[10px] font-mono text-slate-400 block truncate">
                  UID: {log.user_id}
                </span>
              )}
            </div>

            {/* Entity ID */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3" />
                Mã đối tượng (Entity ID)
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 block truncate">
                {log.entity_id || '—'}
              </span>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0b1329]">
                Thông tin bổ sung (Metadata)
              </h4>
            </div>

            {renderMetadataEntries()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
