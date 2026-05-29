import React, { useState, useEffect } from 'react';
import { 
  Play, 
  X, 
  CheckCircle2, 
  ArrowUpRight, 
  Phone, 
  MapPin, 
  Film, 
  Layers, 
  Shield,
  UploadCloud,
  Sparkles,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit3,
  Save,
  LogOut,
  Home,
  RotateCcw
} from 'lucide-react';

interface Project {
  id: number;
  category: 'video' | 'image' | 'regular';
  title: string;
  desc: string;
  img: string;
  vid?: string;
  link?: string; // Optional custom external product link
}

interface SiteContent {
  heroTagline: string;
  heroHeadlineLine1: string;
  heroHeadlineHighlight1: string;
  heroHeadlineLine2: string;
  heroHeadlineHighlight2: string;
  heroSubheadline: string;
  heroCta1Text: string;
  heroCta2Text: string;
  
  partnersIntro: string;
  partnersList: string[];

  aboutHeadline: string;
  aboutDescription: string;
  aboutPrinciples: {
    num: string;
    title: string;
    desc: string;
  }[];
  founderTitle: string;
  founderQuote: string;

  servicesHeadline: string;
  servicesDescription: string;
  servicesList: {
    tag: string;
    title: string;
    icon: 'film' | 'layers' | 'shield';
    desc: string;
    deliverablesLabel: string;
    deliverables: string;
    commitmentLabel: string;
    commitment: string;
  }[];

  processHeadline: string;
  processDescription: string;
  processSteps: {
    step: string;
    title: string;
    desc: string;
  }[];

  contactHeadline: string;
  contactDescription: string;
  contactEmail: string;
  contactRegion: string;
}

// Default Site Content matching the exact B2B copywriting (no trailing periods on headline)
const defaultSiteContent: SiteContent = {
  heroTagline: "Media Production & Operations",
  heroHeadlineLine1: "Sản xuất nội dung",
  heroHeadlineHighlight1: "chuyên nghiệp",
  heroHeadlineLine2: "Vận hành media",
  heroHeadlineHighlight2: "bài bản",
  heroSubheadline: "Vũ Anh Media đồng hành cùng các doanh nghiệp SME giải quyết triệt để khoảng trống về nhân sự và quy trình sản xuất. Chúng tôi không chỉ cung cấp những thước phim, bộ ảnh chuẩn mực mà còn thiết lập hệ thống vận hành để nội dung của bạn ra đều đặn, đúng định hướng và thực sự trở thành tài sản thương hiệu.",
  heroCta1Text: "Yêu cầu tư vấn giải pháp",
  heroCta2Text: "Xem năng lực thực chiến",
  
  partnersIntro: "Doanh nghiệp không cần những thử nghiệm cảm tính. Họ cần sự đảm bảo. Vũ Anh Media là đơn vị đứng sau các chiến dịch hình ảnh, chuỗi nội dung định kỳ và video quy chuẩn của các thương hiệu dẫn đầu:",
  partnersList: [
    "Học Viện Thẩm Mỹ Royal / Phòng khám Royal",
    "Nha Khoa Việt Giáp / Nha Khoa Thuỳ Anh",
    "Adam Eraton",
    "Masan (Núi Pháo)",
    "Sinshung Vina CT",
    "Q-home / Ecocasa",
    "Crescendo International Music Festival & Competition"
  ],

  aboutHeadline: "Định hình lại chuẩn mực Media cho doanh nghiệp",
  aboutDescription: "Phần lớn doanh nghiệp SME tại Việt Nam đang gặp 3 sai lầm lớn khi đầu tư cho Media: Coi chi phí media là khoản tiêu sản dùng một lần, thuê freelancer thiếu tính cam kết dài hạn, hoặc chọn các Marketing Agency lớn với chi phí bị đội lên do các khâu trung gian. Vũ Anh Media thay đổi thực trạng đó bằng 3 nguyên tắc làm việc:",
  aboutPrinciples: [
    { 
      num: '01', 
      title: 'Kiểm soát rủi ro vận hành bằng quy trình', 
      desc: 'Freelancer làm việc dựa trên năng lực cá nhân và không có đội ngũ backup. Vũ Anh Media vận hành theo team có cấu trúc, có cam kết deadline rõ ràng bằng hợp đồng và luôn chủ động hệ thống thiết bị quay dựng chuyên dụng (Sony A7S3, Blackmagic 6K Pro...).' 
    },
    { 
      num: '02', 
      title: 'Biến Media thành tài sản tích lũy', 
      desc: 'Chúng tôi không chỉ giao file video rồi kết thúc hợp tác. Vũ Anh Media xây dựng hệ thống lưu trữ bài bản, giúp doanh nghiệp sở hữu trọn vẹn file gốc, file dự án để có thể tái sử dụng trong vòng 6 - 12 tháng, tối ưu hóa từng đồng chi phí sản xuất.' 
    },
    { 
      num: '03', 
      title: 'Chuyên sâu tối đa, không phân tán nguồn lực', 
      desc: 'Chúng tôi nói KHÔNG với việc nhận chạy ads, booking KOL hay làm marketing tổng thể để tập trung 100% vào phần lõi: Sản xuất và Vận hành Media. Doanh nghiệp nhận được chất lượng sản xuất cao cấp nhất mà không phải gánh chi phí gián tiếp.' 
    }
  ],
  founderTitle: "Kinh nghiệm đúc kết từ chi tiết nhỏ",
  founderQuote: "Kinh nghiệm nằm ở việc chú ý tới brief, dữ liệu hiện trường và cách bàn giao sau cùng để giữ chuẩn lâu dài.",

  servicesHeadline: "Hệ sinh thái dịch vụ Media toàn diện cho SME",
  servicesDescription: "Mỗi doanh nghiệp cần một sự chuẩn bị và giải pháp khác nhau. Vũ Anh Media thiết kế 3 tầng trục năng lực dịch vụ bài bản để hỗ trợ sự phát triển liên tục của bạn:",
  servicesList: [
    {
      tag: "TẦNG 01",
      title: "Media Production — Sản xuất theo dự án",
      icon: 'film',
      desc: "Giải quyết bài toán tạo dấu ấn hình ảnh đột phá trong các chiến dịch ngắn hạn hoặc xây dựng nền tảng nhận diện cốt lõi cho thương hiệu.",
      deliverablesLabel: "Sản phẩm cốt lõi",
      deliverables: "Video TVC doanh nghiệp • Video Profile thương hiệu/sản phẩm • Video quảng cáo cửa hàng • Video ngắn đa nền tảng (TikTok, Reels, Shorts) • Nhiếp ảnh thương mại chuẩn mực.",
      commitmentLabel: "Cam kết B2B",
      commitment: "Quy trình trọn gói từ Brief, kịch bản, storyboard, shot list đến hậu kỳ chuyên sâu (Color Grading 4K, Sound, Motion)."
    },
    {
      tag: "TẦNG 02",
      title: "Monthly Media — Giải pháp nội dung định kỳ",
      icon: 'layers',
      desc: "Giải quyết bài toán đứt gãy mạch nội dung. Duy trì điểm chạm liên tục với khách hàng mục tiêu mà không làm tăng áp lực quản lý cho chủ doanh nghiệp.",
      deliverablesLabel: "Sản phẩm cốt lõi",
      deliverables: "Gói nội dung cam kết số lượng theo tháng cho Spa, Nha khoa, F&B, Doanh nghiệp SME (Video ngắn + Bộ ảnh sản phẩm/nhân vật + Tuyến nội dung viết tương ứng).",
      commitmentLabel: "Cam kết B2B",
      commitment: "Lịch sản xuất cố định, nhân sự phụ trách riêng biệt, output đầu ra đồng đều về mặt visual direction."
    },
    {
      tag: "TẦNG 03",
      title: "Media Operations — Tư vấn & Thiết lập bộ máy nội bộ",
      icon: 'shield',
      desc: "Dành cho các doanh nghiệp muốn tự chủ năng lực sản xuất nhưng đang thiếu quy trình quản trị, khiến tài nguyên bị thất thoát và nhân sự vận hành cảm tính.",
      deliverablesLabel: "Sản phẩm cốt lõi",
      deliverables: "Chuẩn hóa quy trình từ khâu Brief – Sản xuất – Duyệt – Đăng; Phân vai nhân sự media nội bộ; Thiết lập hệ thống lưu trữ và bàn giao tài sản số (file gốc, file dự án) để tái sử dụng dài hạn.",
      commitmentLabel: "Cam kết B2B",
      commitment: "Chỉ tập trung chuyên sâu vào vận hành sản xuất media, chuyển giao một hệ thống tự chạy ổn định sau 3 - 6 tháng."
    }
  ],

  processHeadline: "Quy trình làm việc bài bản",
  processDescription: "Doanh nghiệp rất sợ sự mập mờ và trễ hẹn. Một quy trình rõ ràng thể hiện Vũ Anh Media có năng lực quản trị, điều hành thực chiến và chuyên nghiệp nhất.",
  processSteps: [
    { step: '01', title: 'Nghiên cứu & Định vị', desc: 'Khảo sát thực tế bối cảnh thương hiệu, bóc tách "nỗi đau" truyền thông hiện tại và xác lập tệp khách hàng mục tiêu.' },
    { step: '02', title: 'Kịch bản & Storyboard', desc: 'Lên ý tưởng chi tiết, xây dựng lời thoại đàm thoại tự nhiên (tránh sáo rỗng, công nghiệp), duyệt kỹ lưỡng trước khi bấm máy.' },
    { step: '03', title: 'Sản xuất & Hậu kỳ', desc: 'Bấm máy trực tiếp với thiết bị chuyên dụng và đội ngũ sản xuất thực chiến. Xử lý màu sắc (Color Grading) và âm thanh chuẩn chỉ.' },
    { step: '04', title: 'Bàn giao & Tối ưu', desc: 'Bàn giao sản phẩm đúng cam kết kỳ hạn. Hỗ trợ căn chỉnh định dạng để đạt hiệu quả hiển thị và giữ chân tốt nhất trên đa nền tảng.' }
  ],

  contactHeadline: "Chuẩn hóa tối ưu năng lực Media của bạn ngay hôm nay",
  contactDescription: "Đừng để ngân sách marketing bị lãng phí chỉ vì những hình ảnh lệch chuẩn hoặc một hệ thống nội dung rời rạc. Hãy chia sẻ với Vũ Anh Media về bài toán hiện tại của doanh nghiệp bạn.",
  contactEmail: "hello@vuanhmedia.vn",
  contactRegion: "Thành phố Hồ Chí Minh | Hà Nội"
};

// Brand Logo Component - Fully optimized for premium Futuristic White-Blue Theme
const VALogo: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-black border border-white/20 shadow-[0_0_15px_rgba(2,132,199,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_22px_rgba(2,132,199,0.55)]">
      <img 
        src="/assets/logo-main.png" 
        className="w-full h-full object-contain p-0.5" 
        alt="VŨ ANH MEDIA Logo" 
      />
    </div>
    <div className="flex items-baseline pl-0.5 select-none pointer-events-none whitespace-nowrap">
      <span className="text-[14px] sm:text-[16px] font-black text-[#0284c7] tracking-[0.04em] leading-none uppercase">
        VŨ ANH
      </span>
      <span className="text-[10px] sm:text-[11.5px] font-black tracking-[0.22em] leading-none ml-2 uppercase text-[#0b1329]">
        MEDIA
      </span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeDrawer, setActiveDrawer] = useState<'about' | 'services' | 'projects' | 'process' | 'contact' | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'video' | 'image' | 'regular'>('all');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState('');
  
  // Parallax scroll state
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Contact Form state
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [need, setNeed] = useState('Sản xuất Video & TVC Cinematic');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Client-side CMS routing & session states
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path === '/admin' || hash === '#admin' || search.includes('admin=true') || search.includes('cms=true');
  });

  const [isCmsLoggedIn, setIsCmsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('vuanh_media_cms_session') === 'true';
  });

  const [cmsTab, setCmsTab] = useState<'hero' | 'about' | 'services' | 'process' | 'contact' | 'projects'>('hero');
  const [cmsPasscodeInput, setCmsPasscodeInput] = useState('');
  const [cmsLoginError, setCmsLoginError] = useState(false);
  const [cmsShowToast, setCmsShowToast] = useState(false);
  const [cmsToastMsg, setCmsToastMsg] = useState('');

  // Project Editor State
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'video' | 'image' | 'regular'>('video');
  const [editDesc, setEditDesc] = useState('');
  const [editImg, setEditImg] = useState('');
  const [editVid, setEditVid] = useState('');
  const [editLink, setEditLink] = useState('');

  // Hidden Admin Mode states (For direct on-page widget creator)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('vuanh_media_admin') === 'true';
  });
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Form uploader states (Select product directly from computer)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  // Interactive Drag & Drop states (Only works when isAdmin is true)
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const [newlyAddedProjectId, setNewlyAddedProjectId] = useState<number | null>(null);

  // Quick manually sandbox inputs
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'video' | 'image' | 'regular'>('video');
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

  // Initial projects data from the original website
  const initialProjects: Project[] = [
    { 
      id: 1, 
      category: 'video', 
      title: 'Chiến dịch Clinic - Thẩm mỹ viện Quốc tế', 
      desc: 'Chiến dịch Định Vị Thẩm Mỹ Viện Cao Cấp – Tối ưu hóa hình ảnh tối giản, sang trọng (Minimalist Luxury) để thu hút tệp khách hàng phân khúc cao.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-01.jpg', 
      vid: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4' 
    },
    { 
      id: 2, 
      category: 'video', 
      title: 'Dự án Võ Cổ Truyền Chu Văn An', 
      desc: 'Video Quảng Bá Võ Cổ Truyền – Truyền tải năng lượng trẻ trung, sôi động kết hợp chuyển động kỹ xảo đồ họa để tiếp cận học sinh thế hệ mới.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-02.jpg', 
      vid: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4' 
    },
    { 
      id: 3, 
      category: 'video', 
      title: 'Sự kiện Ra mắt Bộ sưu tập Thời trang', 
      desc: 'Video Reels Đào tạo & Ra mắt – Khung hình chuyển động thời trang đột phá, tạo nhịp điệu kích thích cảm xúc và lượt tiếp cận số.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-03.jpg',
      vid: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4' 
    },
    { 
      id: 4, 
      category: 'image', 
      title: 'Bộ ảnh Không gian Minimalist Clinic', 
      desc: 'Nhiếp ảnh Không gian Clinic – Sử dụng nghệ thuật ánh sáng Chiaroscuro cao cấp, truyền tải cảm giác thư thái và uy tín y khoa.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-04.jpg' 
    },
    { 
      id: 5, 
      category: 'image', 
      title: 'Nhiếp ảnh sản phẩm High-End Cosmetics', 
      desc: 'Nhiếp ảnh Mỹ phẩm Cao cấp – Làm nổi bật chất liệu chai thủy tinh, độ bóng bề mặt và form dáng chân thực 100% qua tư duy duy mỹ khắt khe.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-05.jpg' 
    },
    { 
      id: 6, 
      category: 'image', 
      title: 'Chân dung Editorial Đội ngũ Bác sĩ Nha khoa', 
      desc: 'Hình ảnh Chân dung Bác sĩ – Phong cách chỉn chu, thần thái chuyên nghiệp B2B nâng cao vị thế thương hiệu và sự tin cậy tuyệt đối.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-06.jpg' 
    },
    { 
      id: 7, 
      category: 'regular', 
      title: 'Vận hành Content Fanpage & Tiktok Clinic', 
      desc: 'Giải pháp Content Định kỳ – Thiết lập kịch bản thực tế, kịch bản hội thoại tự nhiên giúp các Clinic, Spa phủ sóng thương hiệu liên tục.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-07.jpg' 
    },
    { 
      id: 8, 
      category: 'regular', 
      title: 'Chiến dịch Lịch Nội dung Multi-channel', 
      desc: 'Duy trì chất lượng sản xuất đều đặn hàng tháng – Giữ vững nhịp điệu tương tác, kết nối đa kênh mà không tốn sức chuẩn bị lại brief.', 
      img: 'https://vuanh-two.vercel.app/assets/products/product-08.jpg' 
    }
  ];

  // Dynamic Site Content loaded from localStorage
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const saved = localStorage.getItem('vuanh_media_site_content');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved site content:', e);
      }
    }
    return defaultSiteContent;
  });

  // Persistent projects state in localStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('vuanh_media_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved projects:', e);
      }
    }
    return initialProjects;
  });

  // Save projects to localStorage on any state changes
  useEffect(() => {
    localStorage.setItem('vuanh_media_projects', JSON.stringify(projects));
  }, [projects]);

  // Client-side router effect to monitor pathname/hash changes
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdminRoute(path === '/admin' || hash === '#admin' || search.includes('admin=true') || search.includes('cms=true'));
    };
    
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      checkRoute();
    };

    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
      window.history.pushState = originalPushState;
    };
  }, []);

  // Check URL query parameters for ?admin=true secret entryway
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('edit') === 'true') {
      setIsAdmin(true);
      localStorage.setItem('vuanh_media_admin', 'true');
      
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // On page Passcode verification
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === 'vuanhmedia' || passcodeInput === '2026') {
      setIsAdmin(true);
      localStorage.setItem('vuanh_media_admin', 'true');
      setIsCmsLoggedIn(true);
      localStorage.setItem('vuanh_media_cms_session', 'true');
      setIsPasscodeModalOpen(false);
      setPasscodeInput('');
      setPasscodeError(false);
      
      // Auto transition to /admin interface
      setIsAdminRoute(true);
      window.history.pushState({}, '', '/admin');
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 600);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('vuanh_media_admin');
  };

  // CMS Login verification
  const handleCmsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (cmsPasscodeInput === 'vuanhmedia' || cmsPasscodeInput === '2026') {
      setIsCmsLoggedIn(true);
      localStorage.setItem('vuanh_media_cms_session', 'true');
      setIsAdmin(true);
      localStorage.setItem('vuanh_media_admin', 'true');
      setCmsPasscodeInput('');
      setCmsLoginError(false);
    } else {
      setCmsLoginError(true);
      setTimeout(() => setCmsLoginError(false), 600);
    }
  };

  const handleCmsLogout = () => {
    setIsCmsLoggedIn(false);
    localStorage.removeItem('vuanh_media_cms_session');
    setIsAdminRoute(false);
    window.history.pushState({}, '', '/');
  };

  const handleViewHome = () => {
    setIsAdminRoute(false);
    window.history.pushState({}, '', '/');
  };

  // Save all site content edits
  const handleSaveCmsContent = () => {
    localStorage.setItem('vuanh_media_site_content', JSON.stringify(siteContent));
    triggerCmsToast('Đã lưu tất cả thay đổi nội dung trang web thành công!');
  };

  // Reset entire website to default content
  const handleResetToDefault = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ nội dung và danh sách dự án về cấu hình B2B mặc định ban đầu không?')) {
      setSiteContent(defaultSiteContent);
      setProjects(initialProjects);
      localStorage.removeItem('vuanh_media_site_content');
      localStorage.removeItem('vuanh_media_projects');
      triggerCmsToast('Đã khôi phục dữ liệu mặc định thành công!');
    }
  };

  const triggerCmsToast = (msg: string) => {
    setCmsToastMsg(msg);
    setCmsShowToast(true);
    setTimeout(() => setCmsShowToast(false), 3000);
  };

  // Dynamic Content editing helper
  const updateContentField = (field: keyof SiteContent, value: any) => {
    setSiteContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updatePrinciple = (index: number, key: 'title' | 'desc', value: string) => {
    const updated = [...siteContent.aboutPrinciples];
    updated[index] = { ...updated[index], [key]: value };
    updateContentField('aboutPrinciples', updated);
  };

  const updateService = (index: number, key: string, value: string) => {
    const updated = [...siteContent.servicesList];
    updated[index] = { ...updated[index], [key]: value };
    updateContentField('servicesList', updated);
  };

  const updateProcessStep = (index: number, key: 'title' | 'desc', value: string) => {
    const updated = [...siteContent.processSteps];
    updated[index] = { ...updated[index], [key]: value };
    updateContentField('processSteps', updated);
  };

  // Project CMS Operations
  const handleDeleteProject = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này khỏi danh mục không?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      triggerCmsToast('Đã xóa dự án thành công!');
    }
  };

  const handleStartEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setEditTitle(p.title);
    setEditCategory(p.category);
    setEditDesc(p.desc);
    setEditImg(p.img);
    setEditVid(p.vid || '');
    setEditLink(p.link || '');
  };

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects(prev => prev.map(p => {
      if (p.id === editingProjectId) {
        return {
          ...p,
          title: editTitle,
          category: editCategory,
          desc: editDesc,
          img: editImg,
          vid: editVid || undefined,
          link: editLink || undefined
        };
      }
      return p;
    }));
    setEditingProjectId(null);
    triggerCmsToast('Đã cập nhật dự án thành công!');
  };

  // Helper to handle local files selected from uploader
  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setUploadFeedback({ type: 'error', msg: 'Chỉ chấp nhận tệp hình ảnh hoặc video!' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setFilePreviewUrl(objectUrl);
    
    setNewCategory(isVideo ? 'video' : 'image');
    setUploadFeedback({ type: 'success', msg: `Đã chọn tệp: "${file.name}"` });
  };

  // Global Drag & Drop Event Handlers (Only active when isAdmin is true)
  const handleGlobalDragEnter = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDragging(true);
  };

  const handleGlobalDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDragging(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.clientX === 0 && e.clientY === 0) {
      setIsGlobalDragging(false);
    }
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setIsGlobalDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    } else {
      const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
      if (droppedText) {
        processDroppedLink(droppedText);
      }
    }
  };

  // Helper to handle drag & dropped local files
  const processUploadedFile = (file: File) => {
    if (!file) return;
    
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setUploadFeedback({ type: 'error', msg: 'Chỉ chấp nhận tệp hình ảnh hoặc video!' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const category = isVideo ? 'video' : 'image';
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = new Date().toLocaleDateString('vi-VN');

    const newProject: Project = {
      id: Date.now(),
      category: category,
      title: isVideo ? `Video Tải Lên ${timestamp}` : `Ảnh Tải Lên ${timestamp}`,
      desc: `Tệp kéo thả nội bộ (${formattedDate}). Hỗ trợ phát xem thử tức thì.`,
      img: isVideo ? 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80' : objectUrl,
      vid: isVideo ? objectUrl : undefined
    };

    setProjects(prev => [newProject, ...prev]);
    setNewlyAddedProjectId(newProject.id);
    setActiveDrawer('projects');
    setActiveCategory(category);
    
    setUploadFeedback({ type: 'success', msg: `Đã nạp tệp: "${file.name}" thành công!` });
    setTimeout(() => {
      setNewlyAddedProjectId(null);
      setUploadFeedback({ type: null, msg: '' });
    }, 4000);
  };

  // Helper to handle drag & dropped URLs
  const processDroppedLink = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUploadFeedback({ type: 'error', msg: 'Đường dẫn liên kết không hợp lệ!' });
      return;
    }

    const lowercaseUrl = url.toLowerCase();
    const isVideo = lowercaseUrl.endsWith('.mp4') || lowercaseUrl.endsWith('.webm') || lowercaseUrl.endsWith('.mov') || lowercaseUrl.includes('cloudfront.net');
    const isImage = lowercaseUrl.endsWith('.jpg') || lowercaseUrl.endsWith('.jpeg') || lowercaseUrl.endsWith('.png') || lowercaseUrl.endsWith('.webp') || lowercaseUrl.endsWith('.gif') || lowercaseUrl.includes('images.unsplash.com');

    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const formattedDate = new Date().toLocaleDateString('vi-VN');
    
    let category: 'video' | 'image' | 'regular' = 'regular';
    let title = `Liên Kết Mới ${timestamp}`;
    let desc = `Đường dẫn liên kết được kéo thả vào trang web (${formattedDate}).`;
    let img = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
    let vid: string | undefined = undefined;

    if (isVideo) {
      category = 'video';
      title = `Video Trực Tuyến ${timestamp}`;
      desc = `Phát video trực tuyến kéo thả (${formattedDate}).`;
      img = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80';
      vid = url;
    } else if (isImage) {
      category = 'image';
      title = `Ảnh Trực Tuyến ${timestamp}`;
      desc = `Tài nguyên ảnh trực tuyến kéo thả (${formattedDate}).`;
      img = url;
    } else {
      category = 'regular';
      title = `Sản Phẩm Trực Tuyến ${timestamp}`;
      let hostname = 'website';
      try {
        hostname = new URL(url).hostname;
      } catch (e) {}
      desc = `Liên kết sản phẩm từ ${hostname}. Click nút bên dưới để chuyển tiếp trang.`;
    }

    const newProject: Project = {
      id: Date.now(),
      category: category,
      title: title,
      desc: desc,
      img: img,
      vid: vid,
      link: category === 'regular' ? url : undefined
    };

    setProjects(prev => [newProject, ...prev]);
    setNewlyAddedProjectId(newProject.id);
    setActiveDrawer('projects');
    setActiveCategory('all');

    setUploadFeedback({ type: 'success', msg: `Đã nạp liên kết thành công!` });
    setTimeout(() => {
      setNewlyAddedProjectId(null);
      setUploadFeedback({ type: null, msg: '' });
    }, 4000);
  };

  // Add custom project manually from the direct file selection form
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setUploadFeedback({ type: 'error', msg: 'Vui lòng nhập tiêu đề dự án!' });
      return;
    }

    if (!selectedFile || !filePreviewUrl) {
      setUploadFeedback({ type: 'error', msg: 'Vui lòng chọn một tệp hình ảnh hoặc video từ máy tính của bạn!' });
      return;
    }

    const isVideo = selectedFile.type.startsWith('video/');

    const newProject: Project = {
      id: Date.now(),
      category: newCategory,
      title: newTitle,
      desc: newDesc || (newCategory === 'regular' ? 'Khách hàng thường xuyên.' : 'Dự án mới cập nhật.'),
      img: isVideo ? 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80' : filePreviewUrl,
      vid: isVideo ? filePreviewUrl : undefined
    };

    setProjects(prev => [newProject, ...prev]);
    setNewlyAddedProjectId(newProject.id);
    setActiveCategory(newCategory);
    
    // Clear uploader & form inputs
    setNewTitle('');
    setNewDesc('');
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setUploadFeedback({ type: 'success', msg: `Đã cập nhật dự án "${newTitle}" lên trang web thành công!` });
    
    setTimeout(() => {
      setNewlyAddedProjectId(null);
      setUploadFeedback({ type: null, msg: '' });
    }, 3000);
  };

  const filteredProjects = activeCategory === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const handleOpenVideo = (url: string) => {
    setVideoModalUrl(url);
    setIsVideoModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
      setCompany('');
      setName('');
      setContact('');
      setMessage('');
    }, 1000);
  };

  // RENDER DYNAMIC ADMIN CMS INTERFACE
  if (isAdminRoute) {
    if (!isCmsLoggedIn) {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#f3f6fb] font-sans antialiased text-[#0b1329] p-4 relative overflow-hidden">
          {/* background orbs & grid */}
          <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-sky-400/20 to-cyan-400/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#0284c7]/15 to-indigo-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(2,132,199,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.15)_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          <div className={`relative w-full max-w-md rounded-3xl glass-panel p-8 sm:p-10 border border-white/80 shadow-2xl text-center space-y-6 animate-scale-up ${cmsLoginError ? 'animate-shake' : ''}`}>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0284c7]/10 text-[#0284c7] mb-1 animate-pulse">
              <Lock className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-[17px] text-[#0b1329] uppercase tracking-wider">CMS Quản Trị Nội Dung</h3>
              <p className="text-[12.5px] text-slate-500 font-semibold leading-relaxed">
                Vui lòng nhập mật mã quản trị của Vũ Anh Media để tự ý chỉnh sửa nội dung và tác phẩm.
              </p>
            </div>
            
            <form onSubmit={handleCmsLogin} className="space-y-4">
              <input 
                type="password" 
                required
                value={cmsPasscodeInput}
                onChange={(e) => setCmsPasscodeInput(e.target.value)}
                placeholder="Mật mã quản trị (vuanhmedia)" 
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white text-[16px] font-bold text-center text-slate-800 focus:outline-none focus:ring-2 transition-all duration-300 ${cmsLoginError ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-[#0284c7]/20 focus:border-[#0284c7]'}`}
                autoFocus
              />
              
              {cmsLoginError && (
                <p className="text-[11px] font-bold text-rose-500">Mật mã chưa chính xác. Vui lòng nhập lại.</p>
              )}
              
              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={handleViewHome}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  Xem trang chủ
                </button>
                <button 
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white bg-[#0284c7] hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-500/15 transition-all cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Mở khóa CMS
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-screen bg-[#f3f6fb] font-sans antialiased text-[#0b1329] overflow-y-auto p-4 sm:p-8 relative pb-20">
        
        {/* Top Header Panel */}
        <header className="max-w-6xl mx-auto glass-panel border border-white/90 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <VALogo />
            <div className="h-6 w-px bg-slate-300 hidden sm:block" />
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-extrabold text-[10.5px] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              CMS Đang hoạt động
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2.5 justify-center">
            <button 
              onClick={handleSaveCmsContent}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu thay đổi
            </button>
            <button 
              onClick={handleViewHome}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              Xem trang chủ
            </button>
            <button 
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 text-rose-500 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset mặc định
            </button>
            <button 
              onClick={handleCmsLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        </header>

        {/* CMS Main Content Area */}
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Category Tabs Menu */}
          <div className="lg:col-span-1 glass-panel border border-white/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block px-2 mb-2">Mục Biên Tập</span>
            {[
              { id: 'hero', label: '1. Khối đầu trang (Hero)' },
              { id: 'about', label: '2. Khối giới thiệu (About)' },
              { id: 'services', label: '3. Khối dịch vụ (Services)' },
              { id: 'process', label: '4. Khối quy trình (Process)' },
              { id: 'contact', label: '5. Khối liên hệ (Contact)' },
              { id: 'projects', label: '6. Quản lý tác phẩm (Projects)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCmsTab(tab.id as any)}
                className={`w-full text-left px-3.5 py-3 rounded-lg text-[12px] font-bold uppercase transition-all cursor-pointer ${cmsTab === tab.id ? 'bg-[#0284c7] text-white' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Editor Panels */}
          <div className="lg:col-span-3 glass-panel border border-white/90 rounded-2xl p-6 sm:p-8 shadow-xs min-h-[500px]">
            
            {/* TAB: HERO */}
            {cmsTab === 'hero' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-[15px] text-[#0b1329] uppercase border-b pb-2 tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0284c7]" />
                  Cấu hình Khối đầu trang (Hero) & Đối tác
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tagline Hero</label>
                    <input 
                      type="text"
                      value={siteContent.heroTagline}
                      onChange={(e) => updateContentField('heroTagline', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Headline dòng 1 (Chữ thường)</label>
                    <input 
                      type="text"
                      value={siteContent.heroHeadlineLine1}
                      onChange={(e) => updateContentField('heroHeadlineLine1', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Headline dòng 1 (Từ nổi bật màu xanh)</label>
                    <input 
                      type="text"
                      value={siteContent.heroHeadlineHighlight1}
                      onChange={(e) => updateContentField('heroHeadlineHighlight1', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Headline dòng 2 (Chữ thường)</label>
                    <input 
                      type="text"
                      value={siteContent.heroHeadlineLine2}
                      onChange={(e) => updateContentField('heroHeadlineLine2', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Headline dòng 2 (Từ nổi bật màu xanh)</label>
                    <input 
                      type="text"
                      value={siteContent.heroHeadlineHighlight2}
                      onChange={(e) => updateContentField('heroHeadlineHighlight2', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Đoạn mô tả chi tiết Hero (Sub-headline)</label>
                  <textarea 
                    rows={4}
                    value={siteContent.heroSubheadline}
                    onChange={(e) => updateContentField('heroSubheadline', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Chữ nút CTA 1 (Nổi bật - Yêu cầu tư vấn)</label>
                    <input 
                      type="text"
                      value={siteContent.heroCta1Text}
                      onChange={(e) => updateContentField('heroCta1Text', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Chữ nút CTA 2 (Outline - Xem năng lực)</label>
                    <input 
                      type="text"
                      value={siteContent.heroCta2Text}
                      onChange={(e) => updateContentField('heroCta2Text', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t">
                  <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block">Cấu hình Khối đối tác thực chiến (Social Proof)</label>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Đoạn dẫn đối tác</label>
                    <textarea 
                      rows={3}
                      value={siteContent.partnersIntro}
                      onChange={(e) => updateContentField('partnersIntro', e.target.value)}
                      className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Danh sách đối tác (Mỗi đối tác ghi trên 1 dòng)</label>
                  <textarea 
                    rows={6}
                    value={siteContent.partnersList.join('\n')}
                    onChange={(e) => updateContentField('partnersList', e.target.value.split('\n').filter(x => x.trim()))}
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7] resize-y"
                    placeholder="Học Viện Thẩm Mỹ Royal&#10;Masam (Núi Pháo)..."
                  />
                </div>
              </div>
            )}

            {/* TAB: ABOUT */}
            {cmsTab === 'about' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-[15px] text-[#0b1329] uppercase border-b pb-2 tracking-wide flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0284c7]" />
                  Cấu hình Khối giới thiệu (About) & Triết lý khác biệt
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tiêu đề khối giới thiệu</label>
                  <input 
                    type="text"
                    value={siteContent.aboutHeadline}
                    onChange={(e) => updateContentField('aboutHeadline', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Đoạn mô tả dẫn dắt</label>
                  <textarea 
                    rows={4}
                    value={siteContent.aboutDescription}
                    onChange={(e) => updateContentField('aboutDescription', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                  />
                </div>

                {/* 3 Principles inputs */}
                <div className="space-y-4 pt-4 border-t">
                  <span className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block">Biên tập 3 Nguyên tắc làm việc khác biệt:</span>
                  
                  {siteContent.aboutPrinciples.map((pr, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                      <span className="text-[10.5px] font-black text-[#0284c7] uppercase">Nguyên tắc {pr.num}</span>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase">Tiêu đề nguyên tắc</label>
                          <input 
                            type="text"
                            value={pr.title}
                            onChange={(e) => updatePrinciple(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none focus:border-[#0284c7]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase">Mô tả nguyên tắc</label>
                          <textarea 
                            rows={3}
                            value={pr.desc}
                            onChange={(e) => updatePrinciple(idx, 'desc', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Founder Info Section */}
                <div className="space-y-4 pt-4 border-t">
                  <span className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block">Biên tập Thông tin người sáng lập:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tiêu đề khối Founder</label>
                      <input 
                        type="text"
                        value={siteContent.founderTitle}
                        onChange={(e) => updateContentField('founderTitle', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Câu nói vàng của Founder</label>
                      <input 
                        type="text"
                        value={siteContent.founderQuote}
                        onChange={(e) => updateContentField('founderQuote', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SERVICES */}
            {cmsTab === 'services' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-[15px] text-[#0b1329] uppercase border-b pb-2 tracking-wide flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#0284c7]" />
                  Cấu hình Hệ sinh thái dịch vụ 3 tầng
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tiêu đề chính dịch vụ</label>
                  <input 
                    type="text"
                    value={siteContent.servicesHeadline}
                    onChange={(e) => updateContentField('servicesHeadline', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Mô tả dẫn dịch vụ</label>
                  <textarea 
                    rows={3}
                    value={siteContent.servicesDescription}
                    onChange={(e) => updateContentField('servicesDescription', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                  />
                </div>

                {/* 3 Services Cards */}
                <div className="space-y-6 pt-4 border-t">
                  {siteContent.servicesList.map((sv, idx) => (
                    <div key={idx} className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                      <span className="text-[10.5px] font-black text-white bg-[#0284c7] px-2.5 py-0.5 rounded-md w-fit block">{sv.tag}</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase">Tên dịch vụ</label>
                          <input 
                            type="text"
                            value={sv.title}
                            onChange={(e) => updateService(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-bold outline-none focus:border-[#0284c7]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase">Mô tả ngắn dịch vụ</label>
                          <input 
                            type="text"
                            value={sv.desc}
                            onChange={(e) => updateService(idx, 'desc', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none focus:border-[#0284c7]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase">Sản phẩm cung cấp cốt lõi</label>
                          <textarea 
                            rows={3}
                            value={sv.deliverables}
                            onChange={(e) => updateService(idx, 'deliverables', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase">Cam kết dịch vụ</label>
                          <textarea 
                            rows={3}
                            value={sv.commitment}
                            onChange={(e) => updateService(idx, 'commitment', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PROCESS */}
            {cmsTab === 'process' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-[15px] text-[#0b1329] uppercase border-b pb-2 tracking-wide flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0284c7]" />
                  Cấu hình Lộ trình làm việc (4 Bước)
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tiêu đề quy trình chính</label>
                  <input 
                    type="text"
                    value={siteContent.processHeadline}
                    onChange={(e) => updateContentField('processHeadline', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Mô tả dẫn dắt</label>
                  <textarea 
                    rows={3}
                    value={siteContent.processDescription}
                    onChange={(e) => updateContentField('processDescription', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                  />
                </div>

                {/* 4 steps */}
                <div className="space-y-4 pt-4 border-t">
                  <span className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block">Biên tập chi tiết 4 bước:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {siteContent.processSteps.map((st, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                        <span className="text-[10.5px] font-black text-[#0284c7] uppercase">Bước {st.step}</span>
                        <div className="space-y-1.5">
                          <input 
                            type="text"
                            value={st.title}
                            onChange={(e) => updateProcessStep(idx, 'title', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] font-bold outline-none focus:border-[#0284c7]"
                            placeholder="Tiêu đề bước..."
                          />
                          <textarea 
                            rows={3}
                            value={st.desc}
                            onChange={(e) => updateProcessStep(idx, 'desc', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11.5px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                            placeholder="Mô tả bước..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONTACT */}
            {cmsTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-[15px] text-[#0b1329] uppercase border-b pb-2 tracking-wide flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0284c7]" />
                  Cấu hình Khối Liên Hệ (Contact & CTA Footer)
                </h3>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tiêu đề khối liên hệ</label>
                  <input 
                    type="text"
                    value={siteContent.contactHeadline}
                    onChange={(e) => updateContentField('contactHeadline', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Mô tả khối liên hệ</label>
                  <textarea 
                    rows={4}
                    value={siteContent.contactDescription}
                    onChange={(e) => updateContentField('contactDescription', e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7] resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Email liên hệ công việc</label>
                    <input 
                      type="email"
                      value={siteContent.contactEmail}
                      onChange={(e) => updateContentField('contactEmail', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Khu vực hoạt động</label>
                    <input 
                      type="text"
                      value={siteContent.contactRegion}
                      onChange={(e) => updateContentField('contactRegion', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12.5px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROJECTS (FULL DYNAMIC PORTFOLIO CMS CRUD) */}
            {cmsTab === 'projects' && (
              <div className="space-y-8">
                
                {/* Section A: Edit Existing Project Form (Modal look) */}
                {editingProjectId ? (
                  <div className="p-5 rounded-2xl border border-amber-500/25 bg-amber-50/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        Đang biên tập dự án (ID: {editingProjectId})
                      </span>
                      <button 
                        onClick={() => setEditingProjectId(null)}
                        className="text-[11.5px] font-bold text-slate-500 hover:text-slate-700 uppercase cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditProject} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Tiêu đề dự án</label>
                          <input 
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-bold outline-none focus:border-[#0284c7]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Danh mục</label>
                          <select 
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as any)}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-extrabold text-slate-700 outline-none focus:border-[#0284c7]"
                          >
                            <option value="video">Video</option>
                            <option value="image">Hình ảnh</option>
                            <option value="regular">Định kỳ</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Đoạn mô tả ngắn (Chiến dịch B2B)</label>
                        <input 
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none focus:border-[#0284c7]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Đường dẫn ảnh nền (Thumbnail URL)</label>
                          <input 
                            type="text"
                            value={editImg}
                            onChange={(e) => setEditImg(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Đường dẫn Video phát thử (MP4 URL)</label>
                          <input 
                            type="text"
                            value={editVid}
                            onChange={(e) => setEditVid(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none"
                            placeholder="Để trống nếu là hình ảnh"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Đường dẫn sản phẩm tùy chọn (External Link URL)</label>
                        <input 
                          type="text"
                          value={editLink}
                          onChange={(e) => setEditLink(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-semibold outline-none"
                          placeholder="Link ngoài (Shopee, Web, Facebook) nếu có"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cập nhật thay đổi dự án
                      </button>
                    </form>
                  </div>
                ) : (
                  
                  /* Section B: Create New Project Block */
                  <div className="p-5 rounded-2xl border border-white/80 bg-white/40 shadow-xs space-y-4">
                    <span className="text-[11.5px] font-black text-[#0284c7] uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Thêm dự án tác phẩm mới
                    </span>
                    
                    <form onSubmit={handleAddProject} className="space-y-4">
                      
                      {/* Direct Computer File Selector Uploader */}
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-widest">Tệp sản phẩm từ máy tính (Ảnh / Video)</label>
                        
                        {!selectedFile ? (
                          <div 
                            onClick={() => document.getElementById('cms-file-input')?.click()}
                            className="border-2 border-dashed border-slate-200 hover:border-[#0284c7]/40 rounded-xl p-5 bg-white/40 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2"
                          >
                            <input 
                              type="file" 
                              id="cms-file-input" 
                              className="hidden" 
                              accept="image/*,video/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileSelect(e.target.files[0]);
                                }
                              }}
                            />
                            <UploadCloud className="w-7 h-7 text-[#0284c7] animate-pulse" />
                            <p className="text-[12px] font-bold text-slate-700">Chọn ảnh hoặc video từ máy tính của bạn</p>
                            <p className="text-[10.5px] text-slate-400 font-semibold">Tự động nhận diện và thiết lập xem thử</p>
                          </div>
                        ) : (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white/60 p-4 flex items-center gap-4 transition-all">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                              {selectedFile.type.startsWith('video/') ? (
                                <video 
                                  src={filePreviewUrl!} 
                                  autoPlay 
                                  loop 
                                  muted 
                                  playsInline 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img 
                                  src={filePreviewUrl!} 
                                  className="w-full h-full object-cover" 
                                  alt="Preview" 
                                />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-[12px] font-bold text-slate-800 truncate" title={selectedFile.name}>
                                {selectedFile.name}
                              </p>
                              <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type.startsWith('video/') ? 'Video' : 'Hình ảnh'}
                              </p>
                            </div>

                            <button 
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setFilePreviewUrl(null);
                                setUploadFeedback({ type: null, msg: '' });
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Tiêu đề tác phẩm</label>
                          <input 
                            type="text" 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Phim TVC nha khoa..." 
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/60 text-[12px] font-semibold outline-none focus:border-[#0284c7]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Danh mục gợi ý</label>
                          <select 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-slate-700 outline-none focus:border-[#0284c7]"
                          >
                            <option value="video">Video</option>
                            <option value="image">Hình ảnh</option>
                            <option value="regular">Định kỳ</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9.5px] font-extrabold text-slate-500 uppercase">Đoạn mô tả ngắn</label>
                        <input 
                          type="text" 
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="Chiến dịch định vị phân khúc cao cấp..." 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white/60 text-[12px] font-semibold outline-none focus:border-[#0284c7]"
                        />
                      </div>

                      {uploadFeedback.type && (
                        <div className={`p-3 rounded-lg text-[11.5px] font-semibold text-left ${uploadFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                          {uploadFeedback.msg}
                        </div>
                      )}

                      <button 
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0284c7] hover:bg-sky-500 text-white rounded-lg text-[11px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm dự án này
                      </button>
                    </form>
                  </div>
                )}

                {/* Section C: Portfolio Table List */}
                <div className="space-y-4">
                  <span className="text-[11.5px] font-black text-slate-500 uppercase tracking-wider block">Danh sách dự án hiện có ({projects.length} dự án)</span>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white/80">
                    <table className="w-full text-[12px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="p-3.5">Ảnh</th>
                          <th className="p-3.5">Tiêu đề tác phẩm</th>
                          <th className="p-3.5">Danh mục</th>
                          <th className="p-3.5">Mô tả</th>
                          <th className="p-3.5 text-center">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(p => (
                          <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="p-3">
                              <div className="w-12 h-9 rounded bg-slate-100 overflow-hidden border border-slate-200 relative flex items-center justify-center shrink-0">
                                <img src={p.img} className="w-full h-full object-cover" alt="Thumbnail" />
                                {p.vid && (
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-extrabold text-[#0b1329] uppercase min-w-[150px]">{p.title}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${p.category === 'video' ? 'bg-sky-50 text-[#0284c7] border border-sky-100' : p.category === 'image' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {p.category === 'video' ? 'Video' : p.category === 'image' ? 'Hình ảnh' : 'Định kỳ'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-semibold truncate max-w-[200px]" title={p.desc}>{p.desc}</td>
                            <td className="p-3 text-center min-w-[120px]">
                              <div className="inline-flex gap-1.5">
                                <button 
                                  onClick={() => handleStartEditProject(p)}
                                  className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 border border-amber-200/40 cursor-pointer"
                                  title="Sửa"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProject(p.id)}
                                  className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 border border-rose-200/40 cursor-pointer"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>

        {/* Global CMS Toast notification popup */}
        {cmsShowToast && (
          <div className="fixed bottom-6 right-6 z-[120] bg-slate-900 border border-white/10 text-white rounded-xl py-3 px-5 shadow-2xl flex items-center gap-2 animate-scale-up font-bold text-[12.5px]">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            {cmsToastMsg}
          </div>
        )}

      </div>
    );
  }

  // RENDER MAIN WEBSITE INTERFACE
  return (
    <div 
      onDragEnter={handleGlobalDragEnter}
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className="relative h-screen w-screen overflow-hidden font-sans antialiased text-[#0b1329] bg-[#f3f6fb] select-none"
    >
      
      {/* FUTURISTIC PREMIUM IMAGE BACKGROUND WITH MOTION */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        
        {/* Parallax Container */}
        <div 
          className="w-full h-full transform will-change-transform"
          style={{
            transform: `translateY(${scrollY * 0.15}px) translateZ(0)`,
            backfaceVisibility: 'hidden'
          }}
        >
          {/* Zoom breathing animated Image */}
          <img 
            src="/assets/hero/hero-future-bg.jpg" 
            alt="Vũ Anh Media Futuristic VR Background" 
            className="w-full h-full object-cover object-[80%_center] animate-hero-zoom will-change-transform scale-[1.04]"
            style={{
              backfaceVisibility: 'hidden',
              filter: 'blur(0)'
            }}
          />
        </div>
        
        {/* Soft elegant white-blue frosted overlays (Ensures 100% legibility on left, displays VR subject on right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/98 via-white/80 to-transparent sm:from-white/96 sm:via-white/60 sm:to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent sm:from-white/70 sm:via-transparent sm:to-transparent pointer-events-none" />
        
        {/* Slow moving Light Streak Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45">
          <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent animate-light-streak absolute top-0 left-0" />
        </div>

        {/* Futuristic Floating Ambient Orbs (Trôi nhẹ, tạo chiều sâu cho luồng sáng) */}
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#0284c7]/20 to-sky-400/10 blur-[130px] pointer-events-none animate-float-light" />
        <div className="absolute top-[10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-sky-300/15 to-transparent blur-[120px] pointer-events-none" />
        
        {/* Futuristic Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(2,132,199,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.15)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      </div>

      {/* FLOATING PILL NAVBAR - DOUBLE CAPSULE PATTERN */}
      <nav className="fixed top-0 left-0 w-full z-30 flex items-center justify-center pt-5 sm:pt-7 px-4 sm:px-8 gap-2 sm:gap-3 pointer-events-none">
        
        {/* LEFT PILL: Brand Logo Capsule */}
        <div 
          className="flex items-center rounded-full pl-3.5 pr-5 py-2 sm:py-2.5 shrink-0 shadow-lg shadow-sky-950/5 border border-white/85 backdrop-blur-xl bg-white/65 hover:scale-[1.01] transition-all duration-300 pointer-events-auto"
        >
          <a 
            href="#top" 
            onClick={(e) => { e.preventDefault(); setActiveDrawer(null); }}
            className="cursor-pointer"
          >
            <VALogo />
          </a>
        </div>

        {/* RIGHT PILL: Menu links capsule */}
        <div 
          className="flex items-center gap-4 sm:gap-9 rounded-full px-5 sm:px-8 py-3.5 sm:py-4 bg-white/65 backdrop-blur-xl border border-white/85 shadow-lg shadow-sky-950/5 pointer-events-auto"
        >
          <button 
            onClick={() => setActiveDrawer('about')}
            className={`text-[11px] sm:text-[12.5px] font-extrabold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${activeDrawer === 'about' ? 'text-[#0284c7]' : 'text-slate-600 hover:text-[#0284c7]'}`}
          >
            Giới thiệu
          </button>
          <button 
            onClick={() => setActiveDrawer('services')}
            className={`text-[11px] sm:text-[12.5px] font-extrabold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${activeDrawer === 'services' ? 'text-[#0284c7]' : 'text-slate-600 hover:text-[#0284c7]'}`}
          >
            Dịch vụ
          </button>
          <button 
            onClick={() => setActiveDrawer('projects')}
            className={`text-[11px] sm:text-[12.5px] font-extrabold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${activeDrawer === 'projects' ? 'text-[#0284c7]' : 'text-slate-600 hover:text-[#0284c7]'}`}
          >
            Dự án
          </button>
          <button 
            onClick={() => setActiveDrawer('process')}
            className={`text-[11px] sm:text-[12.5px] font-extrabold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${activeDrawer === 'process' ? 'text-[#0284c7]' : 'text-slate-600 hover:text-[#0284c7]'}`}
          >
            Quy trình
          </button>
          <button 
            onClick={() => setActiveDrawer('contact')}
            className={`text-[11px] sm:text-[12.5px] font-extrabold uppercase tracking-widest transition-colors duration-200 cursor-pointer ${activeDrawer === 'contact' ? 'text-[#0284c7]' : 'text-slate-600 hover:text-[#0284c7]'}`}
          >
            Liên hệ
          </button>
        </div>
      </nav>

      {/* HERO CONTENT - BOTTOM-LEFT ALIGNED (READING DYNAMIC CONTENT) */}
      <main className="absolute top-[20%] sm:top-[22%] md:top-[24%] left-6 sm:left-12 lg:left-24 z-20 max-w-3xl text-left pointer-events-none px-4">
        <div className="space-y-6 sm:space-y-7 pointer-events-auto select-none animate-fade-in">
          
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 border border-white/95 backdrop-blur-md rounded-full shadow-xs text-[10px] font-black tracking-widest text-[#0284c7] uppercase">
            <span className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-pulse" />
            {siteContent.heroTagline}
          </div>
          
          {/* Headline - Dynamic and custom styled to match original highlight structure */}
          <h1 className="text-3xl sm:text-4.5xl lg:text-[2.85rem] font-black text-[#0b1329] tracking-tight uppercase leading-[1.3] drop-shadow-xs">
            {siteContent.heroHeadlineLine1} <span className="text-[#0284c7]">{siteContent.heroHeadlineHighlight1}</span> <br />
            {siteContent.heroHeadlineLine2} <span className="text-[#0284c7]">{siteContent.heroHeadlineHighlight2}</span>
          </h1>
          
          {/* Sub-headline */}
          <div className="max-w-2xl">
            <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed font-semibold animate-fade-in">
              {siteContent.heroSubheadline}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveDrawer('contact')}
              className="inline-flex items-center gap-2 px-7 py-4 text-[10.5px] font-extrabold uppercase tracking-widest text-white bg-[#0284c7] hover:bg-sky-500 rounded-full shadow-lg shadow-sky-500/20 transition-all duration-300 hover:-translate-y-0.5 group cursor-pointer"
            >
              {siteContent.heroCta1Text}
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button 
              onClick={() => setActiveDrawer('projects')}
              className="inline-flex items-center gap-2 px-7 py-4 text-[10.5px] font-extrabold uppercase tracking-widest text-[#0b1329] bg-white/80 hover:bg-white border border-[#0b1329]/15 rounded-full transition-all duration-300 hover:shadow-lg cursor-pointer"
            >
              {siteContent.heroCta2Text}
            </button>
          </div>
        </div>
      </main>

      {/* SOCIAL PROOF SECTION - DYNAMIC VALUE READ */}
      <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-12 lg:left-24 right-6 sm:right-12 lg:right-24 z-20 pointer-events-auto select-none space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-slate-200/50 pt-5">
          
          <div className="max-w-xl shrink-0">
            <span className="text-[10px] font-black tracking-widest text-[#0284c7] uppercase">Đối tác thực chiến</span>
            <p className="text-[11.5px] text-slate-500 font-bold leading-relaxed mt-1">
              {siteContent.partnersIntro}
            </p>
          </div>
          
          {/* Dynamic sliding partners marquee */}
          <div className="flex-1 overflow-hidden mask-gradient py-2">
            <div className="flex gap-6 whitespace-nowrap animate-marquee">
              {siteContent.partnersList.concat(siteContent.partnersList).map((partner, idx) => (
                <div 
                  key={idx} 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 border border-white/95 backdrop-blur-md text-[11px] font-extrabold text-slate-700 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
                  {partner}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* TECH TAGS IN CORNER */}
      <footer className="absolute bottom-6 left-6 sm:left-12 lg:left-24 right-6 sm:right-12 lg:right-24 z-20 flex items-center justify-between text-[9.5px] font-mono tracking-widest text-slate-400 select-none pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.2 h-1.2 bg-[#0284c7] rounded-full animate-pulse" />
          <span>MEDIA PRODUCTION & OPERATIONS</span>
        </div>
        <div>VŨ ANH MEDIA © 2026</div>
      </footer>

      {/* DRAWER OVERLAY */}
      {activeDrawer && (
        <div 
          onClick={() => setActiveDrawer(null)}
          className="absolute inset-0 z-40 bg-slate-900/10 backdrop-blur-xs transition-all duration-500 animate-fade-in"
        />
      )}

      {/* LIQUID-GLASS DRAWER PANEL */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full md:w-[620px] lg:w-[680px] z-50 glass-panel border-l border-white/80 p-8 sm:p-12 overflow-y-auto transform transition-transform duration-500 ease-in-out ${activeDrawer ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={() => setActiveDrawer(null)}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200 hover:scale-105 text-slate-600 transition-all duration-300 border border-slate-200/40 cursor-pointer shadow-xs z-10"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* DRAWER CONTENT: ABOUT (DYNAMIC VALUE READ) */}
        {activeDrawer === 'about' && (
          <div className="space-y-16 animate-slide-in pb-12 pt-4">
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                <Sparkles className="w-3 h-3 text-[#0284c7]" />
                Định vị cốt lõi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-[1.3] text-[#0b1329]">
                {siteContent.aboutHeadline}
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />
            
            <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 leading-relaxed font-semibold">
              {siteContent.aboutDescription}
            </p>

            {/* Spaced principles list */}
            <div className="space-y-6">
              {siteContent.aboutPrinciples.map((card, idx) => (
                <div 
                  key={idx} 
                  className="glass-card rounded-2xl p-6 sm:p-8 border border-white/80 bg-white/40 shadow-xs space-y-4 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-mono font-black tracking-wider text-[#0284c7] bg-[#0284c7]/5 px-2.5 py-0.5 rounded-lg border border-[#0284c7]/10">
                      {card.num}.principle
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]/30" />
                  </div>
                  <h3 className="font-extrabold text-[15px] sm:text-[16px] text-[#0b1329] leading-tight uppercase tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-slate-500 leading-relaxed font-semibold">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* EXQUISITE FOUNDER PROFILE SECTION */}
            <div className="pt-12 border-t border-slate-200/50 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest text-[#0284c7] uppercase">Về người sáng lập</span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase leading-[1.3]">
                  {siteContent.founderTitle}
                </h3>
              </div>

              {/* Elegant Founder Grid Card */}
              <div className="glass-card rounded-2xl overflow-hidden border border-white/80 bg-white/45 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start transition-all duration-300 hover:bg-white/80">
                <div className="w-36 h-48 sm:w-40 sm:h-52 rounded-xl overflow-hidden bg-slate-900 border border-white/90 shadow-lg shrink-0 relative group">
                  <img 
                    src="/assets/founder.png" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="Founder Vũ Anh" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                
                <div className="flex flex-col justify-center space-y-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0284c7]/10 text-[9px] font-black text-[#0284c7] uppercase tracking-widest leading-none">
                      Founder / Media Director
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-[#0b1329] uppercase tracking-wider">VŨ ANH</h4>
                  </div>
                  
                  <div className="relative">
                    <p className="text-[13px] sm:text-[13.5px] text-slate-600 font-semibold italic border-l-3 border-[#0284c7] pl-4 leading-relaxed text-left">
                      "{siteContent.founderQuote}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DRAWER CONTENT: SERVICES (DYNAMIC VALUE READ) */}
        {activeDrawer === 'services' && (
          <div className="space-y-16 animate-slide-in pb-12 pt-4">
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                Hệ sinh thái toàn diện
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-[1.3] text-[#0b1329]">
                {siteContent.servicesHeadline}
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />
            
            <p className="text-[13.5px] sm:text-[14px] text-slate-600 leading-relaxed font-semibold">
              {siteContent.servicesDescription}
            </p>

            {/* Service Columns */}
            <div className="space-y-6">
              {siteContent.servicesList.map((sv, idx) => (
                <div key={idx} className={`glass-card rounded-2xl p-6 sm:p-8 border shadow-lg space-y-5 transition-transform duration-300 hover:-translate-y-1 ${idx === 1 ? 'border-[#0284c7]/30 bg-[#0284c7]/5' : 'border-white/80 bg-white/40'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className={`text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg w-fit block ${idx === 1 ? 'bg-[#0284c7] text-white' : 'bg-[#0284c7]/5 text-[#0284c7] border border-[#0284c7]/10'}`}>
                        {sv.tag}
                      </span>
                      <h3 className="font-extrabold text-[16px] sm:text-[17px] text-[#0b1329] uppercase tracking-tight">
                        {sv.title}
                      </h3>
                    </div>
                    <div className={`p-2.5 rounded-xl ${idx === 1 ? 'bg-[#0284c7]/10' : 'bg-slate-100'}`}>
                      {sv.icon === 'film' ? <Film className="w-5 h-5 text-[#0284c7]" /> : sv.icon === 'layers' ? <Layers className="w-5 h-5 text-[#0284c7]" /> : <Shield className="w-5 h-5 text-[#0284c7]" />}
                    </div>
                  </div>
                  
                  <p className="text-[13px] text-slate-600 leading-relaxed font-semibold">
                    {sv.desc}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-200/40 space-y-3">
                    <div>
                      <span className="text-[10px] font-black text-[#0284c7] uppercase tracking-widest">{sv.deliverablesLabel}</span>
                      <p className="text-[12.5px] text-slate-600 font-semibold leading-relaxed mt-0.5">
                        {sv.deliverables}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-[#0284c7] uppercase tracking-widest">{sv.commitmentLabel}</span>
                      <p className="text-[12.5px] text-slate-600 font-semibold leading-relaxed mt-0.5">
                        {sv.commitment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRAWER CONTENT: PROJECTS (DYNAMIC VALUE READ) */}
        {activeDrawer === 'projects' && (
          <div className="space-y-16 animate-slide-in pb-12 pt-4">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                  Bộ sưu tập
                </span>
                {isAdmin && (
                  <span className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-widest bg-[#0284c7] text-white rounded-md flex items-center gap-1 animate-pulse">
                    <Unlock className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-[1.3] text-[#0b1329]">
                Tác phẩm đã thực hiện
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />

            {/* Dynamic on-page admin creator sandbox widget */}
            {isAdmin ? (
              <div className="glass-card rounded-2xl p-6 border border-[#0284c7]/25 bg-white/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#0284c7]" />
                    <h3 className="font-extrabold text-[12.5px] text-[#0b1329] uppercase tracking-wider">
                      Trình biên tập nhanh (Sandbox Creator)
                    </h3>
                  </div>
                  <button 
                    onClick={handleLogoutAdmin}
                    className="text-[10px] font-black text-[#0284c7] hover:text-sky-600 transition-colors uppercase cursor-pointer"
                  >
                    Thoát Admin
                  </button>
                </div>
                
                <form onSubmit={handleAddProject} className="space-y-4 pt-1">
                  
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest">Tệp sản phẩm từ máy tính (Ảnh / Video)</label>
                    
                    {!selectedFile ? (
                      <div 
                        onClick={() => document.getElementById('form-file-input')?.click()}
                        className="border border-dashed border-slate-200 hover:border-[#0284c7]/40 rounded-xl p-6 bg-white/40 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2"
                      >
                        <input 
                          type="file" 
                          id="form-file-input" 
                          className="hidden" 
                          accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileSelect(e.target.files[0]);
                            }
                          }}
                        />
                        <UploadCloud className="w-8 h-8 text-[#0284c7] animate-pulse" />
                        <p className="text-[12.5px] font-bold text-slate-700">Chọn ảnh hoặc video từ máy tính của bạn</p>
                        <p className="text-[11px] text-slate-400 font-semibold">Tự động phát hiện loại tệp cực nhanh</p>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200/80 bg-white/60 p-4 flex items-center gap-4 transition-all duration-300">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                          {selectedFile.type.startsWith('video/') ? (
                            <video 
                              src={filePreviewUrl!} 
                              autoPlay 
                              loop 
                              muted 
                              playsInline 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img 
                              src={filePreviewUrl!} 
                              className="w-full h-full object-cover" 
                              alt="Preview" 
                            />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[12.5px] font-bold text-slate-800 truncate" title={selectedFile.name}>
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type.startsWith('video/') ? 'Video' : 'Hình ảnh'}
                          </p>
                        </div>

                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreviewUrl(null);
                            setUploadFeedback({ type: null, msg: '' });
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Tiêu đề tác phẩm</label>
                      <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ví dụ: Phim quảng bá thương hiệu..." 
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12px] font-semibold outline-none focus:border-[#0284c7]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Danh mục</label>
                      <select 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-slate-700 outline-none focus:border-[#0284c7] cursor-pointer"
                      >
                        <option value="video">Video</option>
                        <option value="image">Hình ảnh</option>
                        <option value="regular">Định kỳ</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Mô tả dự án (Chiến dịch B2B)</label>
                    <input 
                      type="text" 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Ví dụ: Chiến dịch Định Vị Thẩm Mỹ Viện..." 
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12px] font-semibold outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  {uploadFeedback.type && (
                    <div className={`p-3 rounded-lg text-[11.5px] font-semibold text-left ${uploadFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
                      {uploadFeedback.msg}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white bg-[#0284c7] hover:bg-sky-500 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      Cập nhật vào web
                    </button>
                    {projects.length !== initialProjects.length && (
                      <button 
                        type="button"
                        onClick={handleResetToDefault}
                        className="px-4 py-2.5 text-[11px] font-bold uppercase text-slate-500 hover:text-rose-500 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer"
                      >
                        Reset Danh mục
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : null}

            {/* CATEGORY FILTER CAPSULES */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'video', label: 'Video' },
                { key: 'image', label: 'Hình ảnh' },
                { key: 'regular', label: 'Định kỳ' }
              ].map(cat => (
                <button 
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as any)}
                  className={`px-4.5 py-2 text-[11px] font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 border cursor-pointer ${activeCategory === cat.key ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200/50 hover:scale-[1.02]'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* PROJECTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {filteredProjects.map(proj => (
                <div 
                  key={proj.id}
                  className={`group relative rounded-2xl overflow-hidden bg-white border shadow-xs transition-all duration-500 ${newlyAddedProjectId === proj.id ? 'border-[#0284c7] shadow-[0_0_18px_rgba(2,132,199,0.45)] scale-[1.01] animate-pulse-border' : 'border-slate-200/50'}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                    <img 
                      src={proj.img} 
                      alt={proj.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      {proj.vid ? (
                        <button 
                          onClick={() => handleOpenVideo(proj.vid!)}
                          className="w-12 h-12 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300 cursor-pointer"
                        >
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </button>
                      ) : (
                        <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-slate-900/90 backdrop-blur-md rounded-full border border-white/10">
                          Xem ảnh
                        </span>
                      )}
                    </div>

                    <span className="absolute top-4 left-4 px-2.5 py-1 text-[8.5px] font-extrabold uppercase tracking-widest bg-slate-900/80 backdrop-blur-md text-white rounded-md border border-slate-200/40">
                      {proj.category === 'video' ? 'VIDEO' : proj.category === 'image' ? 'HÌNH ẢNH' : 'ĐỊNH KỲ'}
                    </span>
                  </div>

                  <div className="p-5 bg-white border-t border-slate-100 space-y-2">
                    <h3 className="font-extrabold text-[13.5px] text-[#0b1329] tracking-tight leading-tight group-hover:text-[#0284c7] transition-colors duration-300 uppercase">
                      {proj.title}
                    </h3>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed font-semibold">
                      {proj.desc}
                    </p>
                    
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {proj.vid && (
                        <button 
                          onClick={() => handleOpenVideo(proj.vid!)}
                          className="text-[11px] font-extrabold text-[#0284c7] hover:text-[#0284c7]/80 underline uppercase tracking-wider block cursor-pointer"
                        >
                          Xem video
                        </button>
                      )}
                      
                      {proj.link && (
                        <a 
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-500 underline uppercase tracking-wider block cursor-pointer"
                        >
                          Ghé thăm sản phẩm →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer with secret lock - completely redirects to full CMS */}
            <div className="pt-8 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400 font-semibold select-none">
              <span>VŨ ANH MEDIA © 2026</span>
              <div className="flex items-center">
                <button 
                  onClick={() => setIsPasscodeModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-slate-400 transition-colors cursor-pointer"
                  title="Nhập mật mã quản lý"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Hệ thống CMS Quản trị
                </button>
              </div>
            </div>

          </div>
        )}

        {/* DRAWER CONTENT: PROCESS (DYNAMIC VALUE READ) */}
        {activeDrawer === 'process' && (
          <div className="space-y-16 animate-slide-in pb-12 pt-4">
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                Lộ trình triển khai
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-[1.3] text-[#0b1329]">
                {siteContent.processHeadline}
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />

            <p className="text-[13.5px] sm:text-[14px] text-slate-600 leading-relaxed font-semibold">
              {siteContent.processDescription}
            </p>

            {/* Glowing vertical timeline */}
            <div className="relative border-l-2 border-sky-100/80 pl-8 ml-4 space-y-8">
              {siteContent.processSteps.map((timeline, idx) => (
                <div key={idx} className="relative group transition-all duration-300">
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#0284c7] flex items-center justify-center shadow-[0_0_10px_rgba(2,132,199,0.3)] z-10 transition-transform duration-300 group-hover:scale-110">
                    <span className="w-2.5 h-2.5 bg-[#0284c7] rounded-full" />
                  </div>
                  
                  <div className="glass-card rounded-2xl p-6 border border-white/80 bg-white/40 shadow-xs space-y-2 transition-all duration-300 hover:bg-white/80 hover:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[11.5px] font-mono font-bold text-[#0284c7] bg-[#0284c7]/5 px-2.5 py-0.5 rounded-lg border border-[#0284c7]/10">
                        {timeline.step}
                      </span>
                      <h3 className="font-extrabold text-[14.5px] text-[#0b1329] uppercase tracking-tight">
                        {timeline.title}
                      </h3>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed font-semibold pl-[48px]">
                      {timeline.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRAWER CONTENT: CONTACT (DYNAMIC VALUE READ) */}
        {activeDrawer === 'contact' && (
          <div className="space-y-16 animate-slide-in pb-12 pt-4">
            
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                Gửi yêu cầu
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-[1.3] text-[#0b1329]">
                {siteContent.contactHeadline}
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />

            <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 leading-relaxed font-semibold">
              {siteContent.contactDescription}
            </p>

            {formState !== 'success' ? (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-[#0284c7] uppercase tracking-widest">Tên doanh nghiệp của anh/chị</label>
                  <input 
                    type="text" 
                    required 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ví dụ: Công ty Cổ phần Vũ Anh..." 
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-[#0284c7] uppercase tracking-widest">Người đại diện liên hệ</label>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A..." 
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300 text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-extrabold text-[#0284c7] uppercase tracking-widest">Điện thoại / Zalo</label>
                    <input 
                      type="text" 
                      required 
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Ví dụ: 093 186 xxxx..." 
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-[#0284c7] uppercase tracking-widest">Gói giải pháp quan tâm</label>
                  <select 
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-bold transition-all duration-300 text-slate-800 cursor-pointer"
                  >
                    <option>Sản xuất theo dự án (Media Production)</option>
                    <option>Nội dung cam kết tháng (Monthly Media)</option>
                    <option>Tư vấn & Thiết lập bộ máy (Media Operations)</option>
                    <option>Chưa rõ, cần khảo sát tư vấn kịch bản</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-[#0284c7] uppercase tracking-widest">Mô tả ngắn bối cảnh</label>
                  <textarea 
                    rows={3} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả bối cảnh hiện tại, lịch bấm máy mong muốn của doanh nghiệp..." 
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300 resize-none text-slate-800"
                  />
                </div>

                <div className="space-y-3">
                  <button 
                    type="submit" 
                    disabled={formState === 'submitting'}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white bg-[#0284c7] hover:bg-[#0284c7]/90 rounded-xl shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
                  >
                    {formState === 'submitting' ? (
                      'Đang gửi yêu cầu...'
                    ) : (
                      <>
                        Đăng ký nhận tư vấn và khảo sát kênh Media miễn phí
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-[11px] font-semibold text-slate-400 text-center leading-relaxed">
                    *Lưu ý: Vũ Anh Media chỉ ưu tiên tiếp nhận các dự án có phạm vi công việc rõ ràng để đảm bảo tiêu chuẩn chất lượng đầu ra tốt nhất cho đối tác.
                  </p>
                </div>

              </form>
            ) : (
              <div className="p-8 rounded-2xl bg-sky-50/40 border border-sky-100 text-center space-y-5 animate-scale-up">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0284c7]/10 text-[#0284c7]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-[15px] text-[#0b1329] uppercase tracking-tight">Kết Nối Thành Công!</h3>
                  <p className="text-[12.5px] text-slate-600 leading-relaxed font-semibold">
                    Cảm ơn bạn đã tin tưởng. Yêu cầu giải pháp của doanh nghiệp bạn đã được gửi thẳng tới Vũ Anh Media. Chúng tôi sẽ phản hồi lại ngay cùng đề xuất kịch bản sơ bộ phù hợp nhất.
                  </p>
                </div>
                <button 
                  onClick={() => setFormState('idle')}
                  className="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-[#0284c7] bg-white border border-[#0284c7]/20 hover:bg-[#0284c7]/5 rounded-xl transition-colors duration-300 cursor-pointer"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            )}

            {/* DIRECT CONTACT INFO */}
            <div className="pt-8 border-t border-slate-200/50 space-y-4 text-[12.5px] text-slate-500 font-semibold">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-[#0b1329]">Email liên hệ:</span> {siteContent.contactEmail}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-[#0b1329]">Vùng hoạt động:</span> {siteContent.contactRegion}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIDEO LIGHTBOX MODAL */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 transition-all duration-300"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <button 
            onClick={() => setIsVideoModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div 
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <video 
              src={videoModalUrl} 
              autoPlay 
              controls 
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* PASSCODE ENTRY MODAL (SECURE LOCK) */}
      {isPasscodeModalOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setIsPasscodeModalOpen(false)}
        >
          <div 
            className={`relative w-full max-w-sm rounded-3xl glass-panel p-8 border border-white/80 shadow-2xl text-center space-y-6 animate-scale-up ${passcodeError ? 'animate-shake' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsPasscodeModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0284c7]/10 text-[#0284c7] mb-1 animate-pulse">
              <Lock className="w-5 h-5" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-[15px] text-[#0b1329] uppercase tracking-widest">Xác thực Quản trị</h3>
              <p className="text-[12px] text-slate-500 font-semibold leading-relaxed">
                Vui lòng nhập mật mã quản trị để mở khóa Trình biên tập nhanh và hệ thống CMS của Vũ Anh Media.
              </p>
            </div>
            
            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <input 
                type="password" 
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="••••••••" 
                className={`w-full px-4 py-3.5 rounded-xl border bg-slate-50 focus:bg-white text-[16px] font-bold text-center text-slate-800 focus:outline-none focus:ring-2 transition-all duration-300 ${passcodeError ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-[#0284c7]/20 focus:border-[#0284c7]'}`}
                autoFocus
              />
              
              {passcodeError && (
                <p className="text-[11px] font-bold text-rose-500">Mật mã chưa chính xác. Vui lòng nhập lại.</p>
              )}
              
              <button 
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-white bg-[#0284c7] hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-500/15 transition-all duration-300 cursor-pointer"
              >
                Mở khóa quản trị & CMS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL DRAG AND DROP SCREEN INDICATOR */}
      {isGlobalDragging && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl border-4 border-dashed border-[#0284c7] m-4 rounded-3xl transition-all duration-300 animate-fade-in pointer-events-none animate-pulse-border"
        >
          <div className="p-6 rounded-full bg-[#0284c7]/10 text-[#0284c7] mb-4 shadow-[0_0_30px_rgba(2,132,199,0.15)] animate-bounce">
            <UploadCloud className="w-16 h-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase tracking-widest">
            Thả để cập nhật nhanh
          </h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 font-bold mt-2 max-w-sm text-center leading-relaxed px-4">
            Chấp nhận tệp ảnh, tệp video (MP4) từ máy tính, hoặc đường dẫn sản phẩm trực tuyến (Shopee, TikTok, Youtube...)
          </p>
        </div>
      )}

    </div>
  );
};

export default App;
