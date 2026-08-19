import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  FileText, 
  Video, 
  Activity, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

export type AdminRouteKey = 
  | 'overview' 
  | 'projects' 
  | 'content' 
  | 'media' 
  | 'activity' 
  | 'settings';

interface AdminLayoutProps {
  currentRoute: AdminRouteKey;
  onNavigate: (route: AdminRouteKey) => void;
  onNavigateHome?: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

interface NavItemConfig {
  key: AdminRouteKey;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItemConfig[] = [
  { key: 'overview', label: 'Tổng quan', icon: LayoutDashboard, path: '/admin' },
  { key: 'projects', label: 'Dự án', icon: FolderGit2, path: '/admin/projects' },
  { key: 'content', label: 'Nội dung Website', icon: FileText, path: '/admin/content' },
  { key: 'media', label: 'Media', icon: Video, path: '/admin/media' },
  { key: 'activity', label: 'Nhật ký hoạt động', icon: Activity, path: '/admin/activity' },
  { key: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin/settings' },
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
    <div className="min-h-screen w-screen bg-[#f3f6fb] font-sans antialiased text-[#0b1329] flex flex-col md:flex-row overflow-x-hidden">
      {/* -------------------- DESKTOP SIDEBAR -------------------- */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 text-slate-200 shrink-0 select-none z-30">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-cyan-400 flex items-center justify-center text-white font-black text-base shadow-lg shadow-sky-500/20 shrink-0">
            VA
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-[15px] text-white tracking-tight uppercase truncate">
              Vũ Anh Media
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block truncate">
              Enterprise CMS
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0284c7] text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">
                {user?.email || 'Admin'}
              </span>
              <span
                className={`inline-block text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 ${getRoleBadgeStyle(
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
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* -------------------- MAIN CONTENT & TOPBAR -------------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
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
              <span className="text-slate-400">CMS Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[#0b1329] font-black">{currentNav.label}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem website</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 text-slate-200 space-y-3 z-30 animate-fade-in">
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
                      isActive ? 'bg-[#0284c7] text-white' : 'text-slate-400 hover:bg-slate-800'
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

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="text-xs font-bold text-white truncate max-w-[180px]">
                {user?.email}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300"
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
