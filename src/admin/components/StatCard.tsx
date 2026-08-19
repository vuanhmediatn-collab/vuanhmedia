import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatBreakdownItem {
  label: string;
  count: number;
  colorClass?: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
  subtitle?: string;
  breakdown?: StatBreakdownItem[];
  highlightBadge?: {
    text: string;
    variant: 'neutral' | 'success' | 'warning' | 'info';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgClass = 'bg-sky-500/10',
  iconColorClass = 'text-sky-600',
  subtitle,
  breakdown,
  highlightBadge,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 bg-white/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
            {title}
          </span>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0b1329] tracking-tight">
              {value}
            </span>
            {highlightBadge && (
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  highlightBadge.variant === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : highlightBadge.variant === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : highlightBadge.variant === 'info'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {highlightBadge.text}
              </span>
            )}
          </div>
        </div>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass} ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
          {breakdown.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/60 font-semibold text-slate-600"
            >
              <span>{item.label}:</span>
              <strong className={`font-black ${item.colorClass || 'text-slate-800'}`}>{item.count}</strong>
            </div>
          ))}
        </div>
      )}

      {subtitle && !breakdown && (
        <p className="mt-3 text-[11px] text-slate-500 font-semibold leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
