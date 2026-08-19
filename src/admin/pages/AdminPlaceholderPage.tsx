import React from 'react';
import { 
  FileText, 
  Activity, 
  Settings, 
  Clock, 
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AdminPlaceholderPageProps {
  moduleKey: 'content' | 'activity' | 'settings';
  onNavigateOverview: () => void;
}

const moduleConfig = {
  content: {
    title: 'Quản lý Nội dung Website',
    subtitle: 'Trình biên tập nội dung từng chuyên mục (Hero, Giới thiệu, Triết lý, Dịch vụ, Quy trình và Liên hệ) cùng cơ chế Xem trước bản nháp và Xuất bản thời gian thực.',
    icon: FileText,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    plannedFeatures: [
      'Chỉnh sửa nội dung Hero, Giới thiệu, Triết lý, Dịch vụ, Quy trình và Liên hệ',
      'Cơ chế xem trước bản nháp (Draft Preview) trước khi xuất bản lên website',
      'Xuất bản một chạm với cập nhật thời gian thực tức thì',
      'Lịch sử thay đổi và khả năng hoàn tác nội dung an toàn',
    ],
  },
  activity: {
    title: 'Nhật ký Hoạt động Chi tiết',
    subtitle: 'Theo dõi toàn bộ lịch sử thao tác của các quản trị viên, nhật ký sửa đổi dữ liệu và giám sát an toàn hệ thống.',
    icon: Activity,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    plannedFeatures: [
      'Xem chi tiết metadata của từng thay đổi dữ liệu trong hệ thống',
      'Bộ lọc nâng cao theo quản trị viên, loại thực thể và khoảng thời gian',
      'Xuất báo cáo hoạt động tuân thủ tiêu chuẩn quản trị doanh nghiệp',
    ],
  },
  settings: {
    title: 'Cài đặt Hệ thống & Tài khoản Quản trị',
    subtitle: 'Quản lý danh sách tài khoản quản trị viên, phân quyền vai trò và cấu hình thông tin doanh nghiệp.',
    icon: Settings,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-50',
    plannedFeatures: [
      'Mời và kích hoạt tài khoản quản trị viên mới qua email',
      'Phân quyền chi tiết theo vai trò: super_admin, admin, editor',
      'Cấu hình thông tin liên hệ B2B và kênh tiếp nhận biểu mẫu liên hệ',
    ],
  },
};

export const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({
  moduleKey,
  onNavigateOverview,
}) => {
  const config = moduleConfig[moduleKey] || moduleConfig.content;
  const Icon = config.icon;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 animate-scale-up">
      <button
        type="button"
        onClick={onNavigateOverview}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Bảng điều khiển Tổng quan</span>
      </button>

      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200/90 bg-white shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
              <Clock className="w-3 h-3" />
              <span>Sắp triển khai</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase">
              {config.title}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {config.subtitle}
        </p>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Các tính năng dự kiến trong module này:
          </h4>
          <ul className="space-y-2.5">
            {config.plannedFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Hạ tầng Supabase & RLS đã sẵn sàng</span>
          </div>

          <button
            type="button"
            onClick={onNavigateOverview}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            Về trang Tổng quan
          </button>
        </div>
      </div>
    </div>
  );
};
