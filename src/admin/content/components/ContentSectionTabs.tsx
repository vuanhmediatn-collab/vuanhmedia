import React from 'react';
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Layers, 
  Users, 
  Mail
} from 'lucide-react';

import type { SiteContentSection, SectionSummary } from '../types/content.types';

interface ContentSectionTabsProps {
  sections: SectionSummary[];
  activeSection: SiteContentSection;
  onSectionChange: (section: SiteContentSection) => void;
}

const SECTION_ICONS: Record<SiteContentSection, React.FC<{ className?: string }>> = {
  hero: Sparkles,
  about: FileText,
  services: Briefcase,
  process: Layers,
  partners: Users,
  contact: Mail,
};

export const ContentSectionTabs: React.FC<ContentSectionTabsProps> = ({
  sections,
  activeSection,
  onSectionChange,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 no-scrollbar">
      {sections.map((sec) => {
        const Icon = SECTION_ICONS[sec.section] || FileText;
        const isActive = activeSection === sec.section;

        return (
          <button
            key={sec.section}
            type="button"
            onClick={() => onSectionChange(sec.section)}
            className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
            <span>{sec.label}</span>

            {/* Total / Pending Badge */}
            <div className="flex items-center gap-1">
              {sec.pending > 0 && (
                <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-amber-400" />
              )}
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                  isActive
                    ? 'bg-slate-800 text-slate-200'
                    : sec.pending > 0
                    ? 'bg-amber-100 text-amber-800 font-extrabold'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {sec.pending > 0 ? `${sec.pending} đổi` : sec.total}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
