import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  Plus, 
  Check, 
  X, 
  FolderGit2
} from 'lucide-react';

import type { ProjectOption } from '../types/media.types';

interface ProjectComboboxProps {
  projects: ProjectOption[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateNewProject?: () => void;
  disabled?: boolean;
  error?: string | null;
  placeholder?: string;
}

const renderStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
          Đã xuất bản
        </span>
      );
    case 'draft':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
          Bản nháp
        </span>
      );
    case 'hidden':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          Đang ẩn
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
          Lưu trữ
        </span>
      );
    default:
      return null;
  }
};

export const ProjectCombobox: React.FC<ProjectComboboxProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateNewProject,
  disabled = false,
  error,
  placeholder = 'Chọn dự án...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  // Filter projects by title, client, or slug
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const term = searchTerm.trim().toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.client && p.client.toLowerCase().includes(term)) ||
        (p.slug && p.slug.toLowerCase().includes(term))
    );
  }, [projects, searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      setHighlightedIndex(-1);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (project: ProjectOption) => {
    onSelectProject(project.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectProject('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredProjects.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProjects.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredProjects.length) {
        handleSelect(filteredProjects[highlightedIndex]);
      } else if (filteredProjects.length === 1) {
        handleSelect(filteredProjects[0]);
      } else if (filteredProjects.length === 0 && onCreateNewProject) {
        onCreateNewProject();
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1.5 text-left">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700">
          Thuộc Dự án <span className="text-rose-500">*</span>
        </label>
        {onCreateNewProject && (
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onCreateNewProject();
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0284c7] hover:text-sky-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo dự án mới</span>
          </button>
        )}
      </div>

      {/* Combobox Trigger */}
      <div
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
          disabled
            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-[#0284c7] ring-2 ring-sky-500/10'
            : error
            ? 'bg-rose-50/40 border-rose-300'
            : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <FolderGit2 className={`w-4 h-4 shrink-0 ${selectedProject ? 'text-sky-600' : 'text-slate-400'}`} />
          {selectedProject ? (
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="font-bold text-xs text-[#0b1329] truncate">
                {selectedProject.title}
              </span>
              {selectedProject.client && (
                <span className="text-[11px] text-slate-400 font-medium truncate hidden sm:inline">
                  • {selectedProject.client}
                </span>
              )}
              <div className="shrink-0">{renderStatusBadge(selectedProject.status)}</div>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-semibold">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedProject && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Bỏ chọn dự án"
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-sky-600' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-scale-up">
          {/* Search Box in Dropdown */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên dự án, khách hàng, slug..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, idx) => {
                const isSelected = project.id === selectedProjectId;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={project.id}
                    onClick={() => handleSelect(project)}
                    className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900 font-bold'
                        : isHighlighted
                        ? 'bg-slate-100/80 text-[#0b1329]'
                        : 'hover:bg-slate-50 text-[#0b1329]'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">
                        {project.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-medium">
                        {project.client && <span className="truncate">{project.client}</span>}
                        {project.slug && (
                          <span className="font-mono text-[10px] text-slate-400">
                            /{project.slug}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {renderStatusBadge(project.status)}
                      {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 px-4 text-center space-y-3">
                <div className="text-xs font-semibold text-slate-500">
                  Không tìm thấy dự án phù hợp.
                </div>
                {onCreateNewProject && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onCreateNewProject();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo dự án mới</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Action */}
          {filteredProjects.length > 0 && onCreateNewProject && (
            <div className="p-2 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNewProject();
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo dự án mới</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
