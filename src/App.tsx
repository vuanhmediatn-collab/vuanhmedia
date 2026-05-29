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
  Unlock
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

// Brand Logo Component - Uncropped rounded-xl with blue glowing drop shadow and single-line brand name
const VALogo: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <div className="flex items-center gap-3">
    {/* Monogram VA image - uncropped with a highly premium glowing cyber-blue drop shadow */}
    <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-black border border-white/20 shadow-[0_0_15px_rgba(2,132,199,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_22px_rgba(2,132,199,0.55)]">
      <img 
        src="/assets/logo-main.png" 
        className="w-full h-full object-contain p-0.5" 
        alt="VŨ ANH MEDIA Logo" 
      />
    </div>
    
    {/* Elegant Single-Line Text Brand Signature with correct spelling "VŨ ANH" */}
    <div className="flex items-baseline pl-0.5 select-none pointer-events-none whitespace-nowrap">
      <span className="text-[14px] sm:text-[16px] font-black text-[#0284c7] tracking-[0.04em] leading-none uppercase">
        VŨ ANH
      </span>
      <span className={`text-[10px] sm:text-[11.5px] font-black tracking-[0.22em] leading-none ml-2 uppercase ${light ? 'text-white/80' : 'text-[#0b1329]'}`}>
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
  
  // Contact Form state
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [need, setNeed] = useState('Sản xuất Video & TVC Cinematic');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Hidden Admin Mode states
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

  // Check URL query parameters for ?admin=true secret entryway
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('edit') === 'true') {
      setIsAdmin(true);
      localStorage.setItem('vuanh_media_admin', 'true');
      
      // Clean query parameter for seamless look & security
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Passcode verification
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === 'vuanhmedia' || passcodeInput === '2026') {
      setIsAdmin(true);
      localStorage.setItem('vuanh_media_admin', 'true');
      setIsPasscodeModalOpen(false);
      setPasscodeInput('');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      // Auto reset error after 600ms (matching the shake animation)
      setTimeout(() => setPasscodeError(false), 600);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('vuanh_media_admin');
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
    
    // Auto-detect and set appropriate category
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
    let img = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'; // Product showcase visual
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
    
    // Auto clear highlights after 3 seconds
    setTimeout(() => {
      setNewlyAddedProjectId(null);
      setUploadFeedback({ type: null, msg: '' });
    }, 3000);
  };

  // Restore defaults
  const handleRestoreDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục danh mục dự án về mặc định ban đầu không?')) {
      setProjects(initialProjects);
      localStorage.removeItem('vuanh_media_projects');
      setUploadFeedback({ type: 'success', msg: 'Đã khôi phục danh mục dự án mặc định!' });
      setTimeout(() => setUploadFeedback({ type: null, msg: '' }), 3000);
    }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDrawer(null);
        setIsVideoModalOpen(false);
        setIsPasscodeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      onDragEnter={handleGlobalDragEnter}
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
      className="relative h-screen w-screen overflow-hidden font-sans antialiased text-[#0b1329] bg-[#f4f7fb] select-none"
    >
      
      {/* SHOWREEL VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover filter brightness-[0.92] contrast-[1.02]"
        />
        
        {/* Soft elegant cool white-blue frosted overlays (NO BLACKS) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/90 via-sky-50/70 to-white/40 pointer-events-none backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.92),transparent_75%)] pointer-events-none" />
        
        {/* Futuristic Floating Ambient Orbs */}
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-400/20 to-cyan-400/15 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#0284c7]/15 to-indigo-500/5 blur-[150px] pointer-events-none" />
        
        {/* Futuristic Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(2,132,199,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(2,132,199,0.15)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
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
            <VALogo light={false} />
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

      {/* HERO CONTENT - BOTTOM-LEFT ALIGNED */}
      <main className="absolute bottom-12 sm:bottom-16 lg:bottom-20 left-8 sm:left-16 lg:left-24 z-20 max-w-2xl text-left pointer-events-none">
        <div className="space-y-5 sm:space-y-6 pointer-events-auto select-none animate-fade-in">
          
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 border border-white/95 backdrop-blur-md rounded-full shadow-xs text-[10px] font-black tracking-widest text-[#0284c7] uppercase">
            <span className="w-1.5 h-1.5 bg-[#0284c7] rounded-full animate-pulse" />
            VŨ ANH MEDIA
          </div>
          
          {/* Headline - Đập tan sự phân vân trong 3 giây đầu */}
          <h1 className="text-2xl sm:text-3.5xl lg:text-[2.25rem] font-black text-[#0b1329] tracking-tight uppercase leading-[1.38] drop-shadow-xs">
            Nâng Tầm Thương Hiệu <br />
            Bằng Thước Phim Điện Ảnh <br />
            <span className="text-[#0284c7]">& Hình Ảnh Đột Phá</span>
          </h1>
          
          {/* Sub-headline */}
          <div className="space-y-3 max-w-xl">
            <p className="text-slate-600 text-[13.5px] sm:text-[14.5px] leading-relaxed font-semibold">
              Chúng tôi đồng hành cùng các doanh nghiệp, clinic và nhãn hàng để tối ưu hóa hình ảnh, biến ý tưởng sáng tạo thành những chiến dịch media có tỷ lệ chuyển đổi cao. Không chỉ là đẹp, đó là câu chuyện chạm đến cảm xúc.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveDrawer('contact')}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-widest text-white bg-[#0284c7] hover:bg-sky-500 rounded-full shadow-lg shadow-sky-500/15 transition-all duration-300 group cursor-pointer"
            >
              Nhận Báo Giá & Tư Vấn Ngay
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button 
              onClick={() => setActiveDrawer('contact')}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[10.5px] font-extrabold uppercase tracking-widest text-[#0b1329] bg-white/80 hover:bg-white border border-[#0b1329]/15 rounded-full transition-all duration-300 hover:shadow-xs cursor-pointer"
            >
              Kết Nối Với Chuyên Gia
            </button>
          </div>
        </div>
      </main>

      {/* TECH TAGS IN CORNER */}
      <footer className="absolute bottom-6 sm:bottom-8 right-8 sm:right-12 z-20 hidden md:flex items-center gap-6 text-[9.5px] font-mono tracking-widest text-slate-500 select-none pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-1.2 h-1.2 bg-[#0284c7] rounded-full animate-pulse" />
          <span>FUTURISTIC WHITE-BLUE</span>
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
        className={`fixed top-0 right-0 h-screen w-full md:w-[620px] lg:w-[680px] z-50 glass-panel border-l border-white/40 p-8 sm:p-12 overflow-y-auto transform transition-transform duration-500 ease-in-out ${activeDrawer ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={() => setActiveDrawer(null)}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200 hover:scale-105 text-slate-600 transition-all duration-300 border border-slate-200/40 cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* DRAWER CONTENT: ABOUT (GIỚI THIỆU & TRIẾT LÝ) */}
        {activeDrawer === 'about' && (
          <div className="space-y-10 animate-slide-in pb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                <Sparkles className="w-3 h-3 text-[#0284c7]" />
                Giới thiệu & Triết lý
              </span>
              <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight uppercase leading-[1.3] bg-gradient-to-r from-[#0b1329] via-slate-800 to-[#0284c7] bg-clip-text text-transparent">
                Duy trì chất lượng đều trong nhiều tháng
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />
            
            <p className="text-[13.5px] sm:text-[14.5px] text-slate-600 leading-relaxed font-semibold">
              Điều doanh nghiệp cần về lâu dài là một cách làm việc giúp hình ảnh, nội dung và đội ngũ có thể phối hợp ổn định theo thời gian.
            </p>

            {/* Grid of 4 philosophy cards - exact text restored */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { num: '01.briefing', title: 'Rõ việc trước khi quay', desc: 'Làm rõ nội dung phục vụ việc gì, nói với ai và phần tư liệu nào cần giữ lại.' },
                { num: '02.workflow', title: 'Phối hợp có nhịp', desc: 'Lịch quay, shotlist, vai trò, mốc duyệt và phản hồi được thống nhất.' },
                { num: '03.quality', title: 'Giữ chuẩn qua từng lần', desc: 'Khung hình, màu sắc, âm thanh và nhịp dựng được giữ cùng một chuẩn.' },
                { num: '04.operation', title: 'Làm lâu không mất nhịp', desc: 'Giữ lại kinh nghiệm sau mỗi lần làm để chuẩn bị nhanh hơn và ít hao sức.' }
              ].map((card, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-6 border border-white/80 bg-white/40 shadow-xs space-y-3 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-mono font-bold tracking-wider text-[#0284c7]">{card.num}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]/50" />
                  </div>
                  <h3 className="font-extrabold text-[14px] sm:text-[14.5px] text-[#0b1329] leading-tight uppercase tracking-tight">{card.title}</h3>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed font-semibold">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* EXQUISITE FOUNDER PROFILE SECTION */}
            <div className="pt-10 border-t border-slate-200/50 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest text-[#0284c7] uppercase">Về người sáng lập</span>
                <h3 className="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight uppercase leading-[1.3] bg-gradient-to-r from-[#0b1329] via-slate-800 to-[#0284c7] bg-clip-text text-transparent">
                  Kinh nghiệm đúc kết từ chi tiết nhỏ
                </h3>
              </div>

              {/* Elegant Founder Grid Card */}
              <div className="glass-card rounded-2xl overflow-hidden border border-white/80 bg-white/45 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start transition-all duration-300 hover:bg-white/80">
                {/* 4:5 Artistic Portrait container */}
                <div className="w-36 h-48 sm:w-40 sm:h-52 rounded-xl overflow-hidden bg-slate-900 border border-white/90 shadow-lg shrink-0 relative group">
                  <img 
                    src="/assets/founder.png" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="Founder Vũ Anh" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                
                {/* Info and quote - exact text restored */}
                <div className="flex flex-col justify-center space-y-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0284c7]/10 text-[9px] font-black text-[#0284c7] uppercase tracking-widest leading-none">
                      Founder / Media Director
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-[#0b1329] uppercase tracking-wider">VŨ ANH</h4>
                  </div>
                  
                  <div className="relative">
                    <p className="text-[13px] sm:text-[13.5px] text-slate-600 font-semibold italic border-l-3 border-[#0284c7] pl-4 leading-relaxed text-left">
                      "Kinh nghiệm nằm ở việc chú ý tới brief, dữ liệu hiện trường và cách bàn giao sau cùng để giữ chuẩn lâu dài."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DRAWER CONTENT: SERVICES (DỊCH VỤ) */}
        {activeDrawer === 'services' && (
          <div className="space-y-10 animate-slide-in pb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                Phân loại dịch vụ
              </span>
              <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight uppercase leading-[1.3] bg-gradient-to-r from-[#0b1329] via-slate-800 to-[#0284c7] bg-clip-text text-transparent">
                Đóng gói chuyên nghiệp, chạm đúng nỗi đau
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />
            
            <p className="text-[13.5px] sm:text-[14px] text-slate-600 leading-relaxed font-semibold">
              Mỗi doanh nghiệp cần một sự chuẩn bị khác nhau. Chúng tôi thiết kế các gói cấu trúc dịch vụ thiết thực để đáp ứng đúng quy mô dự án của bạn:
            </p>

            {/* Service Grid - kịch bản texts updated */}
            <div className="space-y-6">
              
              {/* SERVICE 1 */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/80 bg-white/40 shadow-xs space-y-4 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11.5px] font-mono font-bold text-[#0284c7] bg-[#0284c7]/5 px-2 py-0.5 rounded">01.cinematic</span>
                    <h3 className="font-extrabold text-[15px] sm:text-[15.5px] text-[#0b1329] uppercase tracking-tight">Sản Xuất Video Thước Phim Ngắn & TVC Cinematic</h3>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0284c7]/5">
                    <Film className="w-5 h-5 text-[#0284c7]" />
                  </div>
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed font-semibold">
                  Biến thông điệp cốt lõi của thương hiệu thành những thước phim chuẩn điện ảnh, có nhịp điệu (tempo) cuốn hút, tối ưu giữ chân người xem (Retention rate) trên Tiktok, YouTube Reels để tăng chuyển đổi tự nhiên.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-200/40 text-[12px] text-slate-500 font-semibold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    Kịch bản phân cảnh & shotlist rõ ràng
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    Hậu kỳ màu sắc & âm thanh chuẩn điện ảnh
                  </li>
                </ul>
              </div>

              {/* SERVICE 2 */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-[#0284c7]/20 bg-sky-50/20 shadow-xs space-y-4 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11.5px] font-mono font-bold text-[#0284c7] bg-[#0284c7]/5 px-2 py-0.5 rounded">02.photography</span>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[15px] sm:text-[15.5px] text-[#0b1329] uppercase tracking-tight">Nhiếp Ảnh Sản Phẩm & Nhận Diện Cao Cấp</h3>
                      <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-[#0284c7] text-white rounded-full tracking-wider uppercase">Khuyên dùng</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0284c7]/10">
                    <Layers className="w-5 h-5 text-[#0284c7]" />
                  </div>
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed font-semibold">
                  Cam kết độ chân thực 100%, giữ trọn vẹn đặc tính sản phẩm nhưng được nâng tầm qua tư duy duy mỹ, nghệ thuật ánh sáng (Chiaroscuro) và quy trình xử lý hậu kỳ khắt khe nhất.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-sky-100/40 text-[12px] text-slate-500 font-semibold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    Ánh sáng Chiaroscuro tôn vinh chất liệu
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    Hậu kỳ khắt khe, chân thực 100%
                  </li>
                </ul>
              </div>

              {/* SERVICE 3 */}
              <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/80 bg-white/40 shadow-xs space-y-4 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[11.5px] font-mono font-bold text-[#0284c7] bg-[#0284c7]/5 px-2 py-0.5 rounded">03.operations</span>
                    <h3 className="font-extrabold text-[15px] sm:text-[15.5px] text-[#0b1329] uppercase tracking-tight">Giải Pháp Vận Hành Content & Livestream Hệ Thống</h3>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0284c7]/5">
                    <Shield className="w-5 h-5 text-[#0284c7]" />
                  </div>
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-slate-600 leading-relaxed font-semibold">
                  Thiết lập kịch bản thực tế, hội thoại tự nhiên (không công nghiệp, không sáo rỗng), giúp các Clinic, Spa, Nhãn hàng, Hệ thống đào tạo phủ sóng thương hiệu liên tục và giữ lửa tương tác.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-200/40 text-[12px] text-slate-500 font-semibold">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    Lịch nội dung định kỳ tháng hệ thống
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    Kịch bản đàm thoại thực, tỷ lệ tương tác cao
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* DRAWER CONTENT: PROJECTS (DỰ ÁN) */}
        {activeDrawer === 'projects' && (
          <div className="space-y-10 animate-slide-in pb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                Bộ sưu tập
              </span>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight uppercase leading-[1.3] bg-gradient-to-r from-[#0b1329] via-slate-800 to-[#0284c7] bg-clip-text text-transparent">
                  Tác phẩm đã thực hiện
                </h2>
                
                {/* Admin Mode indicator Banner */}
                {isAdmin && (
                  <span className="px-2.5 py-1 text-[8.5px] font-black uppercase tracking-widest bg-emerald-500 text-white rounded-md flex items-center gap-1 animate-pulse">
                    <Unlock className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
              </div>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />

            {/* DYNAMIC SANDBOX BUILDER - DIRECT COMPUTER FILE UPLOADER (Only visible in ADMIN MODE) */}
            {isAdmin ? (
              <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-50/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#0284c7]" />
                    <h3 className="font-extrabold text-[12.5px] text-[#0b1329] uppercase tracking-wider">
                      Trình biên tập nhanh (Sandbox Creator)
                    </h3>
                  </div>
                  <button 
                    onClick={handleLogoutAdmin}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors uppercase cursor-pointer"
                  >
                    Thoát Admin
                  </button>
                </div>
                
                {/* Visual Direct Computer File Uploader Field */}
                <form onSubmit={handleAddProject} className="space-y-4 pt-1">
                  
                  {/* File Selector Zone */}
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest">Tệp sản phẩm từ máy tính (Ảnh / Video)</label>
                    
                    {!selectedFile ? (
                      <div 
                        onClick={() => document.getElementById('form-file-input')?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#0284c7]/40 rounded-xl p-6 bg-white/40 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center space-y-2"
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
                        <p className="text-[11px] text-slate-400 font-semibold">Hỗ trợ các định dạng hình ảnh và video MP4</p>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200/80 bg-white/60 p-4 flex items-center gap-4 transition-all duration-300">
                        {/* Selected File Miniature Preview */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative flex items-center justify-center">
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
                        
                        {/* File Meta Info */}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[12.5px] font-bold text-slate-800 truncate" title={selectedFile.name}>
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type.startsWith('video/') ? 'Video' : 'Hình ảnh'}
                          </p>
                        </div>

                        {/* Remove Selected File Button */}
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreviewUrl(null);
                            setUploadFeedback({ type: null, msg: '' });
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Chọn tệp khác"
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
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-[12px] font-bold text-slate-700 outline-none focus:border-[#0284c7] cursor-pointer"
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
                      placeholder="Ví dụ: Chiến dịch Định Vị Thẩm Mỹ Viện – Tối ưu hóa hình ảnh Minimalist Luxury..." 
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
                        onClick={handleRestoreDefaults}
                        className="px-4 py-2.5 text-[11px] font-bold uppercase text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer"
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
                  className={`px-4.5 py-2 text-[11px] font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 border cursor-pointer ${activeCategory === cat.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200/50 hover:scale-[1.02]'}`}
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
                  className={`group relative rounded-2xl overflow-hidden bg-slate-900 border shadow-sm transition-all duration-500 ${newlyAddedProjectId === proj.id ? 'border-[#0284c7] shadow-[0_0_18px_rgba(2,132,199,0.45)] scale-[1.01] animate-pulse-border' : 'border-slate-200/40'}`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-800 relative">
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
                        <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-slate-900/90 backdrop-blur-md rounded-full">
                          Xem ảnh
                        </span>
                      )}
                    </div>

                    <span className="absolute top-4 left-4 px-2.5 py-1 text-[8.5px] font-extrabold uppercase tracking-widest bg-slate-900/80 backdrop-blur-md text-white rounded-md">
                      {proj.category === 'video' ? 'VIDEO' : proj.category === 'image' ? 'HÌNH ẢNH' : 'ĐỊNH KỲ'}
                    </span>
                  </div>

                  <div className="p-5 bg-white space-y-2">
                    <h3 className="font-extrabold text-[13.5px] text-[#0b1329] tracking-tight leading-tight group-hover:text-[#0284c7] transition-colors duration-300 uppercase">{proj.title}</h3>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed font-semibold">{proj.desc}</p>
                    
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {proj.vid && (
                        <button 
                          onClick={() => handleOpenVideo(proj.vid!)}
                          className="text-[11px] font-extrabold text-[#0284c7] hover:text-sky-500 underline uppercase tracking-wider block cursor-pointer"
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

            {/* Drawer Footer with secret lock - completely hides admin panels from normal users */}
            <div className="pt-8 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400 font-semibold select-none">
              <span>VŨ ANH MEDIA © 2026</span>
              <div className="flex items-center">
                {isAdmin ? (
                  <button 
                    onClick={handleLogoutAdmin}
                    className="inline-flex items-center gap-1.5 text-[#0284c7] hover:text-sky-600 transition-colors cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    Thoát Admin
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPasscodeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-slate-300 hover:text-slate-400 transition-colors cursor-pointer"
                    title="Nhập mật mã quản lý"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Quản trị
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* DRAWER CONTENT: PROCESS (QUY TRÌNH) */}
        {activeDrawer === 'process' && (
          <div className="space-y-10 animate-slide-in pb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                Lộ trình triển khai
              </span>
              <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight uppercase leading-[1.3] bg-gradient-to-r from-[#0b1329] via-slate-800 to-[#0284c7] bg-clip-text text-transparent">
                Quy trình làm việc bài bản
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />

            <p className="text-[13.5px] sm:text-[14px] text-slate-600 leading-relaxed font-semibold">
              Doanh nghiệp rất sợ sự mập mờ và trễ hẹn. Một quy trình rõ ràng thể hiện Vũ Anh Media có năng lực quản trị, điều hành thực chiến và chuyên nghiệp nhất.
            </p>

            {/* Glowing vertical timeline with 4-step glass card steps - expert kịch bản restored */}
            <div className="relative border-l-2 border-sky-100/60 pl-8 ml-4 space-y-8">
              {[
                { step: '01', title: 'Nghiên cứu & Định vị', desc: 'Khảo sát thực tế bối cảnh thương hiệu, bóc tách "nỗi đau" truyền thông hiện tại và xác lập tệp khách hàng mục tiêu.' },
                { step: '02', title: 'Kịch bản & Storyboard', desc: 'Lên ý tưởng chi tiết, xây dựng lời thoại đàm thoại tự nhiên (tránh sáo rỗng, công nghiệp), duyệt kỹ lưỡng trước khi bấm máy.' },
                { step: '03', title: 'Sản xuất & Hậu kỳ', desc: 'Bấm máy trực tiếp với thiết bị chuyên dụng và đội ngũ sản xuất thực chiến. Xử lý màu sắc (Color Grading) và âm thanh chuẩn chỉ.' },
                { step: '04', title: 'Bàn giao & Tối ưu', desc: 'Bàn giao sản phẩm đúng cam kết kỳ hạn. Hỗ trợ căn chỉnh định dạng để đạt hiệu quả hiển thị và giữ chân tốt nhất trên đa nền tảng.' }
              ].map((timeline, idx) => (
                <div key={idx} className="relative group transition-all duration-300">
                  {/* Timeline dot with glowing neon pulse */}
                  <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#0284c7] flex items-center justify-center shadow-[0_0_10px_rgba(2,132,199,0.3)] z-10 transition-transform duration-300 group-hover:scale-110">
                    <span className="w-2.5 h-2.5 bg-[#0284c7] rounded-full" />
                  </div>
                  
                  {/* Timeline content glass card */}
                  <div className="glass-card rounded-2xl p-6 border border-white/80 bg-white/40 shadow-xs space-y-2 transition-all duration-300 hover:bg-white/85 hover:border-white hover:-translate-y-1">
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

        {/* DRAWER CONTENT: CONTACT (LIÊN HỆ) */}
        {activeDrawer === 'contact' && (
          <div className="space-y-10 animate-slide-in pb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0284c7]/10 rounded-full text-[10px] font-extrabold tracking-widest text-[#0284c7] uppercase">
                Gửi yêu cầu
              </span>
              <h2 className="text-2xl sm:text-3.5xl font-black tracking-tight uppercase leading-[1.3] bg-gradient-to-r from-[#0b1329] via-slate-800 to-[#0284c7] bg-clip-text text-transparent">
                Bắt đầu số hóa thương hiệu của bạn ngay hôm nay
              </h2>
            </div>
            
            <div className="w-16 h-1 bg-gradient-to-r from-[#0284c7] to-cyan-400 rounded-full" />

            <p className="text-[13.5px] sm:text-[14px] text-slate-600 leading-relaxed font-semibold">
              Nhận tư vấn kịch bản & Giải pháp Media miễn phí cho doanh nghiệp của bạn.
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300"
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-[#0284c7] uppercase tracking-widest">Gói giải pháp quan tâm</label>
                  <select 
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-bold transition-all duration-300 text-[#0b1329] cursor-pointer"
                  >
                    <option>Sản xuất Video & TVC Cinematic</option>
                    <option>Nhiếp ảnh sản phẩm cao cấp</option>
                    <option>Vận hành Content & Livestream</option>
                    <option>Chưa rõ, cần tư vấn giải pháp</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-[#0284c7] uppercase tracking-widest">Mô tả ngắn bối cảnh</label>
                  <textarea 
                    rows={3} 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả bối cảnh hiện tại, lịch bấm máy mong muốn của doanh nghiệp..." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/20 focus:border-[#0284c7] text-[13px] font-semibold transition-all duration-300 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={formState === 'submitting'}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-white bg-[#0284c7] hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-500/15 transition-all duration-300 disabled:opacity-50 cursor-pointer hover:-translate-y-0.5"
                >
                  {formState === 'submitting' ? (
                    'Đang gửi yêu cầu...'
                  ) : (
                    <>
                      Nhận Báo Giá & Tư Vấn Ngay
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <p className="text-[11px] font-semibold text-slate-400 text-center">
                  Chúng tôi phản hồi thông tin với sự bảo mật và cam kết hỗ trợ tối đa cho doanh nghiệp của bạn.
                </p>
              </form>
            ) : (
              <div className="p-8 rounded-2xl bg-sky-50/40 border border-[#0284c7]/15 text-center space-y-5 animate-scale-up">
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
            <div className="pt-6 border-t border-slate-200/60 space-y-4 text-[12.5px] text-slate-500 font-semibold">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-[#0b1329]">Email liên hệ:</span> hello@vuanhmedia.vn
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-[#0b1329]">Vùng hoạt động:</span> Thành phố Hồ Chí Minh | Hà Nội
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
                Vui lòng nhập mật mã quản trị để mở khóa Trình biên tập nhanh của Vũ Anh Media.
              </p>
            </div>
            
            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <input 
                type="password" 
                required
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="••••••••" 
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white text-[16px] font-bold text-center focus:outline-none focus:ring-2 transition-all duration-300 ${passcodeError ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-[#0284c7]/20 focus:border-[#0284c7]'}`}
                autoFocus
              />
              
              {passcodeError && (
                <p className="text-[11px] font-bold text-rose-500">Mật mã chưa chính xác. Vui lòng nhập lại.</p>
              )}
              
              <button 
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[11px] font-black uppercase tracking-widest text-white bg-[#0284c7] hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-500/15 transition-all duration-300 cursor-pointer"
              >
                Mở khóa quản trị
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL DRAG AND DROP SCREEN INDICATOR */}
      {isGlobalDragging && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/75 backdrop-blur-xl border-4 border-dashed border-[#0284c7] m-4 rounded-3xl transition-all duration-300 animate-fade-in pointer-events-none animate-pulse-border"
        >
          <div className="p-6 rounded-full bg-[#0284c7]/10 text-[#0284c7] mb-4 shadow-[0_0_30px_rgba(2,132,199,0.15)] animate-bounce">
            <UploadCloud className="w-16 h-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0b1329] uppercase tracking-widest">
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
