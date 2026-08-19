import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AdminForgotPasswordProps {
  onNavigateLogin: () => void;
}

export const AdminForgotPassword: React.FC<AdminForgotPasswordProps> = ({ onNavigateLogin }) => {
  const [email, setEmail] = useState('vuanhmediatn@gmail.com');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email quản trị.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Determine redirectTo dynamically based on current origin
      const redirectTo = `${window.location.origin}/admin/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        setErrorMsg(error.message || 'Không thể gửi email khôi phục. Vui lòng thử lại.');
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Đã xảy ra lỗi không xác định.');
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
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            VŨ ANH MEDIA
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            Khôi phục mật khẩu quản trị
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/50">
          {isSuccess ? (
            <div className="text-center space-y-5 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">
                  Đã gửi email khôi phục!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong className="text-sky-400">{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc mục Thư rác/Spam).
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại Đăng nhập
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                Nhập địa chỉ email quản trị của bạn. Chúng tôi sẽ gửi đường dẫn an toàn để thiết lập mật khẩu mới.
              </p>

              {/* Email input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Email quản trị viên
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@vuanhmedia.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
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
                    <Send className="w-3.5 h-3.5" />
                    Gửi liên kết khôi phục
                  </>
                )}
              </button>

              {/* Back to login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Quay lại trang Đăng nhập
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
