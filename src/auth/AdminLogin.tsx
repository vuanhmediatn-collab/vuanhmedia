import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ArrowRight, Home, AlertCircle } from 'lucide-react';
import { useAuth } from './useAuth';

interface AdminLoginProps {
  onNavigateHome?: () => void;
  onNavigateForgotPassword?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigateHome, onNavigateForgotPassword }) => {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      console.warn('Sign-in failed:', error.message);
      setErrorMsg('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    } else {
      window.history.replaceState({}, '', '/admin');
    }
  };


  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#f3f6fb] font-sans antialiased text-[#0b1329] p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-sky-400/20 to-cyan-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#0284c7]/15 to-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(2,132,199,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.15)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative w-full max-w-md rounded-3xl glass-panel p-8 sm:p-10 border border-white/80 shadow-2xl text-center space-y-6 animate-scale-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0284c7]/10 text-[#0284c7] mb-1">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-extrabold text-[18px] text-[#0b1329] uppercase tracking-wider">
            Vũ Anh Media — CMS Admin
          </h2>
          <p className="text-[12.5px] text-slate-500 font-semibold leading-relaxed">
            Hệ thống quản trị nội dung doanh nghiệp. Vui lòng đăng nhập bằng tài khoản Quản trị viên được cấp quyền.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 text-[12px] font-bold flex items-center gap-2 text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
              Email Quản trị
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vuanhmedia.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-[13px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                Mật khẩu
              </label>
              {onNavigateForgotPassword && (
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-[14px] font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
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
              type="submit"
              disabled={submitting || loading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-white bg-[#0284c7] hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-500/15 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                'Đang xác thực...'
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-200/50 text-[11px] text-slate-400 font-semibold">
          VŨ ANH MEDIA Enterprise Security • Supabase Auth & RLS Protected
        </div>
      </div>
    </div>
  );
};
