import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, KeyRound, ArrowRight } from 'lucide-react';

interface AdminResetPasswordProps {
  onNavigateLogin: () => void;
}

export const AdminResetPassword: React.FC<AdminResetPasswordProps> = ({ onNavigateLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isRecoveryValid, setIsRecoveryValid] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if recovery token exists in hash or session
    const checkRecoverySession = async () => {
      try {
        const hash = window.location.hash;
        const search = window.location.search;
        const isRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token=') || search.includes('type=recovery');

        // Check current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();

        if (isMounted) {
          if (session || isRecoveryHash) {
            setIsRecoveryValid(true);
          } else {
            setIsRecoveryValid(false);
          }
          setCheckingSession(false);
        }
      } catch (e) {
        if (isMounted) {
          setIsRecoveryValid(false);
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    // Listen to Supabase Auth state changes for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setIsRecoveryValid(true);
        setCheckingSession(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các trường mật khẩu.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Securely update user password without logging
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
      } else {
        setIsSuccess(true);
        // Clear plaintext passwords from state immediately
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Đã xảy ra lỗi khi cập nhật mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1329] px-4 py-8 select-none text-slate-100 font-sans">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-4 shadow-[0_0_30px_rgba(2,132,199,0.25)]">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            VŨ ANH MEDIA
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Thiết lập mật khẩu mới
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
          {checkingSession ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-3 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Đang xác thực liên kết bảo mật...</p>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-5 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  Cập nhật mật khẩu thành công!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mật khẩu tài khoản quản trị của bạn đã được thay đổi an toàn. Bạn có thể sử dụng mật khẩu mới để đăng nhập ngay bây giờ.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Truy cập Quản trị CMS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : !isRecoveryValid ? (
            <div className="text-center space-y-5 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  Liên kết không hợp lệ hoặc đã hết hạn
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Đường dẫn khôi phục mật khẩu này đã được sử dụng hoặc đã hết thời gian hiệu lực. Vui lòng yêu cầu liên kết mới.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Yêu cầu liên kết khôi phục mới
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                Vui lòng nhập mật khẩu mới bảo mật (tối thiểu 8 ký tự).
              </p>

              {/* New Password input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0284c7] to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/25 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Lưu mật khẩu mới
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
