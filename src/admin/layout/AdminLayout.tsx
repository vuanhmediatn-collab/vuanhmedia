import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  FileText,
  Activity,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  User,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

export type AdminRouteKey =
  | 'overview'
  | 'projects'
  | 'media'
  | 'content'
  | 'activity'
  | 'settings';

interface AdminLayoutProps {
  currentRoute: AdminRouteKey;
  onNavigate: (route: AdminRouteKey) => void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

interface NavItem {
  key: AdminRouteKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Tổng quan Mission Control', icon: LayoutDashboard, path: '/admin' },
  { key: 'projects', label: 'Quản lý Dự án (Projects)', icon: FolderKanban, path: '/admin/projects' },
  { key: 'media', label: 'Kho Media DAM 50MB', icon: ImageIcon, path: '/admin/media' },
  { key: 'content', label: 'Nội dung Website', icon: FileText, path: '/admin/content' },
  { key: 'activity', label: 'Nhật ký Hoạt động', icon: Activity, path: '/admin/activity' },
  { key: 'settings', label: 'Cấu hình Hệ thống', icon: Settings, path: '/admin/settings' },
];

const getRoleBadgeStyle = (role: string | null) => {
  switch (role) {
    case 'super_admin':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'admin':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'editor':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentRoute,
  onNavigate,
  onNavigateHome,
  onLogout,
  children,
}) => {
  const { user, adminRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (key: AdminRouteKey) => {
    onNavigate(key);
    setMobileMenuOpen(false);
  };

  const currentNav = navItems.find((item) => item.key === currentRoute) || navItems[0];

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] flex flex-col md:flex-row overflow-x-hidden">
      {/* -------------------- DESKTOP SIDEBAR (PRISTINE AGENCY WHITE) -------------------- */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200/90 text-slate-800 shrink-0 select-none z-30 shadow-[1px_0_12px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] via-sky-500 to-cyan-400 flex items-center justify-center text-white font-black text-base shadow-md shadow-sky-500/20 shrink-0">
              VA
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-[15px] text-slate-900 tracking-tight uppercase truncate">
                Vũ Anh Media
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 block truncate">
                STUDIO PRO · AGENCY CMS
              </span>
            </div>
          </div>
        </div>

        {/* Live Visual Page Builder Quick Launcher */}
        <div className="p-3 mx-3 my-2 rounded-xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold text-sky-950 block leading-tight truncate">
                Visual Page Builder
              </span>
              <span className="text-[9.5px] font-semibold text-sky-700/80 block leading-tight">
                Soạn thảo trực quan 11 Sections
              </span>
            </div>
          </div>
          <a
            href="https://www.vuanhmedia.com/admin/page-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white shadow-2xs hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-200 transition-all shrink-0 cursor-pointer"
            title="Mở trình soạn thảo trực quan"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Hạ tầng Điều hành
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0284c7] text-white shadow-sm shadow-sky-500/25 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile & Logout */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700 font-bold shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {user?.email || 'Admin'}
              </span>
              <span
                className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${getRoleBadgeStyle(
                  adminRole
                )}`}
              >
                {adminRole || 'admin'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 border border-slate-200/80 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* -------------------- MAIN CONTENT & TOPBAR (LIGHT MODE) -------------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-400">CMS Quản Trị</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-slate-900 font-extrabold">{currentNav.label}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            {/* Supabase 50MB Active Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase 50MB Sẵn Sàng</span>
            </div>

            {/* Direct Link to Visual Page Builder */}
            <a
              href="https://www.vuanhmedia.com/admin/page-builder"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Studio Visual Pro</span>
            </a>

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Xem Website</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 text-slate-800 space-y-3 z-30 shadow-lg">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavClick(item.key)}
                    className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-[#0284c7] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                {user?.email}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
