import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, Home } from 'lucide-react';
import { useAuth } from './useAuth';
import { AdminLogin } from './AdminLogin';
import { AdminShell } from './AdminShell';
import { AdminForgotPassword } from './AdminForgotPassword';
import { AdminResetPassword } from './AdminResetPassword';

type AdminViewMode = 'login' | 'forgot-password' | 'reset-password';

export const AdminGuard: React.FC<{ onNavigateHome?: () => void }> = ({ onNavigateHome }) => {
  const { session, user, loading, isAdmin, adminRole, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<AdminViewMode>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();

    if (path.includes('/admin/reset-password') || hash.includes('type=recovery') || search.includes('type=recovery')) {
      return 'reset-password';
    }
    if (path.includes('/admin/forgot-password') || search.includes('forgot=true')) {
      return 'forgot-password';
    }
    return 'login';
  });

  // Listen to browser navigation within /admin sub-routes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.includes('/admin/reset-password') || hash.includes('type=recovery') || search.includes('type=recovery')) {
        setViewMode('reset-password');
      } else if (path.includes('/admin/forgot-password') || search.includes('forgot=true')) {
        setViewMode('forgot-password');
      } else {
        setViewMode('login');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Strict Routing Enforcements:
  useEffect(() => {
    if (loading) return;

    const currentPath = window.location.pathname.toLowerCase();

    // 1. Authenticated admin on /admin/login or sub-login -> Redirect to /admin
    if (session && user && isAdmin && adminRole) {
      if (currentPath === '/admin/login' || currentPath === '/admin/login/') {
        window.history.replaceState({}, '', '/admin');
      }
    }

    // 2. Unauthenticated user on any protected /admin route -> Redirect to /admin/login
    if (!session || !user) {
      if (
        currentPath.startsWith('/admin') &&
        !currentPath.includes('/admin/login') &&
        !currentPath.includes('/admin/forgot-password') &&
        !currentPath.includes('/admin/reset-password')
      ) {
        window.history.replaceState({}, '', '/admin/login');
      }
    }
  }, [loading, session, user, isAdmin, adminRole]);


  const navigateTo = (mode: AdminViewMode) => {
    setViewMode(mode);
    if (mode === 'forgot-password') {
      window.history.pushState({}, '', '/admin/forgot-password');
    } else if (mode === 'reset-password') {
      window.history.pushState({}, '', '/admin/reset-password');
    } else {
      window.history.pushState({}, '', '/admin/login');
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.history.replaceState({}, '', '/admin/login');
    setViewMode('login');
  };

  // Explicit sub-routes handling
  if (viewMode === 'forgot-password' && (!session || !user)) {
    return <AdminForgotPassword onNavigateLogin={() => navigateTo('login')} />;
  }

  if (viewMode === 'reset-password' && (!session || !user)) {
    return <AdminResetPassword onNavigateLogin={() => navigateTo('login')} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[#f3f6fb] font-sans antialiased text-[#0b1329]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0284c7]/20 border-t-[#0284c7] rounded-full animate-spin" />
          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
            Đang xác thực bảo mật...
          </span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated -> Render Admin Login
  if (!session || !user) {
    return (
      <AdminLogin 
        onNavigateHome={onNavigateHome} 
        onNavigateForgotPassword={() => navigateTo('forgot-password')} 
      />
    );
  }

  // 2. Authenticated but NOT in admin_users or is_active = false -> Access Denied
  if (!isAdmin || !adminRole) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-[#f3f6fb] font-sans antialiased text-[#0b1329] p-4">
        <div className="relative w-full max-w-md rounded-3xl glass-panel p-8 sm:p-10 border border-white/80 shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 text-rose-600 mb-1">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-extrabold text-[18px] text-[#0b1329] uppercase tracking-wider">
              Truy cập Bị từ chối
            </h2>
            <p className="text-[12.5px] text-slate-500 font-semibold leading-relaxed">
              Tài khoản <span className="font-bold text-slate-800 font-mono">{user.email}</span> đã đăng nhập nhưng chưa được cấp quyền Quản trị viên trong hệ thống cơ sở dữ liệu.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11.5px] font-semibold text-left">
            Vui lòng liên hệ Founder Vũ Anh Media để kích hoạt quyền Quản trị viên cho tài khoản này.
          </div>

          <div className="flex gap-2.5 pt-2">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                Về trang chủ
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Admin -> Render Admin Shell
  return <AdminShell onNavigateHome={onNavigateHome} onLogout={handleLogout} />;
};
