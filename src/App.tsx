import React, { useState, useEffect, useMemo, useRef } from 'react';
import Lenis from 'lenis';
import { useProjects } from './hooks/useProjects';
import { useSiteContent } from './hooks/useSiteContent';
import { SANITIZED_PUBLIC_PROJECTS_FALLBACK } from './data/sanitizedPublicFallback';
import { AdminGuard } from './auth/AdminGuard';
import { 
  Play, 
  X, 
  CheckCircle2, 
  ArrowUpRight, 
  Phone, 
  MapPin, 
  Mail, 
  ArrowRight,
  ChevronRight,
  Menu
} from 'lucide-react';

interface Project {
  id: string | number;
  category: 'video' | 'image' | 'regular';
  title: string;
  client?: string;
  desc: string;
  img: string;
  vid?: string;
  role?: string;
  scope?: string;
  link?: string;
}

// Helper function to extract YouTube ID
const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];
  
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
    if (parsed.hostname.includes('youtu.be')) {
      const pathId = parsed.pathname.replace(/^\//, '');
      if (pathId.length === 11) return pathId;
    }
  } catch (e) {}
  return null;
};

// Helper function to extract Vimeo ID
const getVimeoId = (url: string): string | null => {
  if (!url) return null;
  const match = url.trim().match(/(?:vimeo\.com\/)(?:.*\/)?(\d+)/);
  return match ? match[1] : null;
};

// Helper function to extract Google Drive file ID
const getGoogleDriveId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([^\/\?]+)/) || url.match(/[?&]id=([^&]+)/);
  return match ? match[1] : null;
};

// Brand Logo Component - Refined Minimal Monogram
const VALogo: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md overflow-hidden bg-black border border-slate-300 transition-all duration-200">
      <img 
        src="/assets/logo-main.png" 
        className="w-full h-full object-contain p-0.5" 
        alt="VŨ ANH MEDIA" 
      />
    </div>
    <div className="flex items-baseline select-none pointer-events-none whitespace-nowrap">
      <span className="text-[14px] font-bold text-[#0284c7] tracking-tight leading-none uppercase">
        VŨ ANH
      </span>
      <span className="text-[10px] font-bold tracking-[0.2em] leading-none ml-1.5 uppercase text-[#070d1e]">
        MEDIA
      </span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalUrl, setVideoModalUrl] = useState('');
  const [activeImageModal, setActiveImageModal] = useState<{ img: string; title: string; desc: string; category: string } | null>(null);
  
  // Contact Form state
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [need, setNeed] = useState<'Media Production' | 'Monthly Media' | 'Media Ops'>('Media Production');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll and handle Escape key for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  // Client-side CMS routing & session states (internal handling, zero public UI links)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return path.startsWith('/admin') || hash.startsWith('#admin') || search.includes('admin=true') || search.includes('cms=true');
  });

  const lenisRef = useRef<Lenis | null>(null);

  // =========================================================================
  // SUPABASE PRODUCTION DATA ACCESS
  // =========================================================================
  const { data: supabaseProjects } = useProjects();
  const { content: siteContent } = useSiteContent();

  // Primary Source: Supabase published projects with reliable sanitized fallback
  const projects: Project[] = useMemo(() => {
    if (supabaseProjects && supabaseProjects.length > 0) {
      return supabaseProjects.map((p) => {
        const cat = (p.category || '').toLowerCase();
        const categoryType: 'video' | 'image' | 'regular' = 
          cat.includes('film') || cat.includes('video') || cat.includes('tvc') || cat.includes('commercial') 
            ? 'video' 
            : cat.includes('photo') || cat.includes('image') || cat.includes('ảnh') 
            ? 'image' 
            : 'regular';

        const mainVideo = p.videos && p.videos.length > 0 ? p.videos[0] : null;

        return {
          id: p.id,
          category: categoryType,
          title: p.title,
          client: p.client || undefined,
          desc: p.short_description || p.full_description || '',
          img: p.cover_image || p.thumbnail || mainVideo?.thumbnail || 'https://img.youtube.com/vi/162H3RVsW7s/hqdefault.jpg',
          vid: mainVideo?.video_url,
          role: p.role_played || undefined,
          scope: p.scope_of_work || undefined,
          link: `/project/${p.slug}`,
        };
      });
    }

    return SANITIZED_PUBLIC_PROJECTS_FALLBACK as Project[];
  }, [supabaseProjects]);

  // Initialize Lenis Smooth Scroll & Scroll Reveal Observer
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      lenisRef.current = lenis;

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    }

    const handleReveal = () => {
      const elements = document.querySelectorAll('.reveal-headline, .reveal-media, .reveal-body, .reveal-section');
      const windowHeight = window.innerHeight;
      
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.94) {
          el.classList.add('is-visible');
        }
      });
    };

    handleReveal();
    window.addEventListener('scroll', handleReveal, { passive: true });

    if (lenisRef.current) {
      lenisRef.current.on('scroll', handleReveal);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '60px 0px 60px 0px'
    });

    const elements = document.querySelectorAll('.reveal-headline, .reveal-media, .reveal-body, .reveal-section');
    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleReveal);
      observer.disconnect();
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, [isAdminRoute, projects]);

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdminRoute(
        path.startsWith('/admin') || 
        hash.startsWith('#admin') || 
        search.includes('admin=true') || 
        search.includes('cms=true')
      );
    };

    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const handleViewHome = () => {
    setIsAdminRoute(false);
    window.history.pushState({}, '', '/');
  };

  const handleOpenVideo = (url?: string) => {
    if (!url) return;
    setVideoModalUrl(url);
    setIsVideoModalOpen(true);
  };

  const handleOpenImageModal = (proj: Project) => {
    setActiveImageModal({
      img: proj.img,
      title: proj.title,
      desc: proj.desc,
      category: proj.category
    });
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
    }, 800);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, { offset: -70 });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isAdminRoute) {
    return <AdminGuard onNavigateHome={handleViewHome} />;
  }

  return (
    <div className="min-h-screen w-full font-sans antialiased text-[#070d1e] bg-[#f8fafc] relative selection:bg-[#0284c7] selection:text-white">

      {/* ========================================================================= */}
      {/* COMPACT REFINED NAVIGATION (STICKY HEADER AREA) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 left-0 w-full z-40 bg-[#f8fafc]/92 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-10 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Monogram */}
          <a 
            href="#top" 
            onClick={(e) => { e.preventDefault(); scrollToSection('top'); }}
            className="flex items-center gap-2 group"
          >
            <VALogo />
          </a>

          {/* Desktop & Tablet Navigation Links (hidden on mobile <= 640px) */}
          <nav className="hidden sm:flex items-center gap-4 sm:gap-7 md:gap-9 text-[12px] font-semibold tracking-tight uppercase">
            <button 
              onClick={() => scrollToSection('projects')}
              className="text-slate-600 hover:text-[#0284c7] transition-colors cursor-pointer whitespace-nowrap"
            >
              Dự án
            </button>
            <button 
              onClick={() => scrollToSection('services')}
              className="text-slate-600 hover:text-[#0284c7] transition-colors cursor-pointer whitespace-nowrap"
            >
              Năng lực
            </button>
            <button 
              onClick={() => scrollToSection('media-ops')}
              className="text-[#0284c7] hover:text-sky-600 font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Media Ops
            </button>
            <button 
              onClick={() => scrollToSection('team')}
              className="text-slate-600 hover:text-[#0284c7] transition-colors cursor-pointer whitespace-nowrap"
            >
              Đội ngũ
            </button>
            <button 
              onClick={() => scrollToSection('partners')}
              className="text-slate-600 hover:text-[#0284c7] transition-colors cursor-pointer whitespace-nowrap"
            >
              Đối tác
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-slate-900 hover:text-[#0284c7] font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              Liên hệ
            </button>
          </nav>

          {/* Mobile Menu Trigger (visible only on <= 640px) */}
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
              className="p-1.5 text-slate-700 hover:text-[#0284c7] focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Panel (Solid opaque slide-down overlay) */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[57px] z-50 bg-[#f8fafc] w-full h-[calc(100vh-57px)] flex flex-col p-6 sm:hidden border-b border-slate-200 overflow-y-auto transition-all duration-300">
            <nav className="flex flex-col space-y-3 pt-2 text-left">
              {[
                { id: 'projects', label: 'Dự án' },
                { id: 'services', label: 'Năng lực' },
                { id: 'media-ops', label: 'Media Ops', highlight: true },
                { id: 'team', label: 'Đội ngũ' },
                { id: 'partners', label: 'Đối tác' },
                { id: 'contact', label: 'Liên hệ', bold: true }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection(item.id);
                  }}
                  className={`text-[16.5px] font-bold tracking-tight uppercase py-3 border-b border-slate-200/70 text-left transition-colors cursor-pointer ${item.highlight ? 'text-[#0284c7]' : item.bold ? 'text-[#070d1e]' : 'text-slate-700 hover:text-[#0284c7]'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>


      {/* ========================================================================= */}
      {/* 01. HERO SECTION (EDITORIAL ASYMMETRIC ~85vh + REAL PROJECT CINEMATIC FRAME) */}
      {/* ========================================================================= */}
      <section id="top" className="relative min-h-[85vh] flex items-center py-16 sm:py-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9] overflow-hidden">
        
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-14 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
            
            {/* LEFT COLUMN: 55% Desktop - Controlled Typography & CTAs */}
            <div className="lg:col-span-7 space-y-7 text-left">
              
              {/* Layer 1: Headline & Eyebrow */}
              <div className="reveal-headline space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-md shadow-2xs text-[10.5px] font-mono font-bold tracking-widest text-[#0284c7] uppercase">
                  <span className="w-1.5 h-1.5 bg-[#0284c7] rounded-full" />
                  MEDIA PRODUCTION & OPERATIONS
                </div>
                
                <h1 className="font-display text-2.5xl sm:text-3.5xl md:text-4xl lg:text-[2.65rem] xl:text-[2.85rem] font-bold text-[#070d1e] tracking-tight uppercase leading-[1.14]">
                  <span className="block">SẢN XUẤT & TƯ VẤN</span>
                  <span className="block">VẬN HÀNH MEDIA</span>
                  <span className="block text-slate-900 sm:whitespace-nowrap">CHO DOANH NGHIỆP VỪA VÀ NHỎ</span>
                </h1>
              </div>
              
              {/* Layer 3: Body Copy & CTAs */}
              <div className="reveal-body space-y-6 max-w-xl">
                <p className="text-slate-600 text-[15px] sm:text-[16px] leading-relaxed font-normal">
                  Vũ Anh Media triển khai dự án sản xuất, nội dung định kỳ và tư vấn vận hành Media cho doanh nghiệp vừa và nhỏ. Với Media Ops, chúng tôi rà soát hệ thống đang có, xác định điểm nghẽn và xử lý theo phạm vi cụ thể, gồm quy trình làm việc, cách phối hợp và training chuyên môn.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-3.5">
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-[11.5px] font-bold uppercase tracking-wider text-white bg-[#0284c7] hover:bg-sky-500 rounded-lg shadow-sm transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
                  >
                    TRAO ĐỔI DỰ ÁN
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                  <button 
                    onClick={() => scrollToSection('projects')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 text-[11.5px] font-bold uppercase tracking-wider text-[#070d1e] bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    XEM DỰ ÁN ĐÃ THỰC HIỆN
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: 45% Desktop - Real Published Project Cinematic Frame (Layer 2, ~35-40% larger) */}
            <div className="lg:col-span-5 reveal-media">
              {projects[0] && (
                <div 
                  onClick={() => {
                    if (projects[0].vid) {
                      handleOpenVideo(projects[0].vid);
                    } else {
                      handleOpenImageModal(projects[0]);
                    }
                  }}
                  className="group relative cursor-pointer aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] xl:aspect-[16/11] w-full rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-200/90"
                >
                  <img 
                    src={projects[0].img} 
                    alt={projects[0].title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest bg-black/80 backdrop-blur-md text-white rounded border border-white/20">
                      FEATURED // TVC
                    </span>
                  </div>

                  {/* Centered Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-lg transform scale-95 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Text */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1 text-left">
                    {projects[0].client && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 block">
                        {projects[0].client}
                      </span>
                    )}
                    <h3 className="font-display font-bold text-[15px] sm:text-[17px] uppercase tracking-tight leading-tight line-clamp-1">
                      {projects[0].title}
                    </h3>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 02. PROJECTS SECTION (SURFACE: WHITE - MOVING-IMAGE DOMINANCE) */}
      {/* ========================================================================= */}
      <section id="projects" className="py-20 sm:py-28 relative z-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 space-y-16">
          
          {/* Section Header */}
          <div className="reveal-headline flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-5">
            <h2 className="font-display text-2xl sm:text-3.5xl font-bold tracking-tight uppercase text-[#070d1e]">
              DỰ ÁN ĐÃ THỰC HIỆN
            </h2>
            <span className="text-[11.5px] font-mono text-slate-400 font-medium">
              PUBLISHED WORKS (02)
            </span>
          </div>

          {/* Editorial Showcase */}
          <div className="space-y-24">
            
            {/* Project 01: Dominant Cinematic Frame (Near Full Width) */}
            {projects[0] && (
              <div 
                onClick={() => {
                  if (projects[0].vid) {
                    handleOpenVideo(projects[0].vid);
                  } else {
                    handleOpenImageModal(projects[0]);
                  }
                }}
                className="reveal-media group cursor-pointer space-y-4"
              >
                <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-950 shadow-lg border border-slate-200/80">
                  <img 
                    src={projects[0].img} 
                    alt={projects[0].title} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  {/* Category & Client Badge */}
                  <div className="absolute top-5 left-5 flex items-center gap-3">
                    <span className="px-3 py-1 text-[9.5px] font-mono font-bold uppercase tracking-widest bg-black/80 backdrop-blur-md text-white rounded border border-white/20">
                      TVC // COMMERCIAL
                    </span>
                    {projects[0].client && (
                      <span className="hidden sm:inline-block px-3 py-1 text-[9.5px] font-mono font-medium uppercase tracking-wider bg-white/20 backdrop-blur-md text-white rounded">
                        KHÁCH HÀNG: {projects[0].client}
                      </span>
                    )}
                  </div>

                  {/* Centered Play Trigger */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xl transform scale-95 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </div>
                  </div>

                  {/* Bottom Metadata */}
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white space-y-1.5 text-left">
                    <h3 className="font-display text-xl sm:text-3xl font-bold uppercase tracking-tight leading-tight group-hover:text-sky-300 transition-colors">
                      {projects[0].title}
                    </h3>
                    <p className="text-white/80 text-[13px] sm:text-[14.5px] font-normal max-w-2xl">
                      {projects[0].desc}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Project 02: Tall Intentional Portrait 9:16 Editorial Showcase (Height ~60vh) */}
            {projects[1] && (
              <div 
                onClick={() => {
                  if (projects[1].vid) {
                    handleOpenVideo(projects[1].vid);
                  } else {
                    handleOpenImageModal(projects[1]);
                  }
                }}
                className="reveal-section group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-14 items-center pt-10 border-t border-slate-200"
              >
                {/* Native 9:16 Portrait Frame (Prominent ~60vh height) */}
                <div className="md:col-span-5 flex justify-center md:justify-start">
                  <div className="relative aspect-[9/16] w-64 sm:w-80 max-h-[65vh] overflow-hidden rounded-2xl bg-slate-950 shadow-xl border border-slate-200">
                    <img 
                      src={projects[1].img} 
                      alt={projects[1].title} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest bg-black/80 backdrop-blur-md text-white rounded border border-white/15">
                        9:16 SHORT-FORM
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-lg transform scale-95 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="md:col-span-7 space-y-5 text-left">
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] font-mono font-bold text-[#0284c7] uppercase tracking-widest block">
                      NỘI DUNG ĐỊNH KỲ
                    </span>
                    {projects[1].client && (
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                        Khách hàng: {projects[1].client}
                      </span>
                    )}
                    <h3 className="font-display text-xl sm:text-2.5xl font-bold text-[#070d1e] tracking-tight uppercase leading-snug group-hover:text-[#0284c7] transition-colors">
                      {projects[1].title}
                    </h3>
                  </div>
                  
                  <p className="text-slate-600 text-[14.5px] sm:text-[15.5px] leading-relaxed font-normal max-w-xl">
                    {projects[1].desc}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-[12px] font-bold text-[#0284c7] uppercase tracking-wider">
                    <span>Xem nội dung vận hành</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 03. BUSINESS LINES (SURFACE: LIGHT NEUTRAL - ASYMMETRIC STUDIO FOCUS) */}
      {/* ========================================================================= */}
      <section id="services" className="py-20 sm:py-28 relative z-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 space-y-12">
          
          <div className="reveal-headline max-w-3xl space-y-1">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              DỊCH VỤ & PHẠM VI
            </span>
            <h2 className="font-display text-2xl sm:text-3.5xl font-bold tracking-tight uppercase text-[#070d1e]">
              NĂNG LỰC TRIỂN KHAI
            </h2>
          </div>

          {/* Asymmetric Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-6 border-t border-slate-200">
            
            {/* Primary Focus: Media Production (5 cols) */}
            <div className="reveal-section lg:col-span-5 space-y-5">
              <div className="space-y-1.5">
                <span className="text-3xl font-mono font-bold text-[#0284c7] block">01</span>
                <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  SẢN XUẤT THEO DỰ ÁN
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#070d1e] uppercase tracking-tight">
                  MEDIA PRODUCTION
                </h3>
              </div>

              <p className="text-[14.5px] text-slate-600 font-normal leading-relaxed">
                Vũ Anh Media phụ trách các dự án sản xuất theo phạm vi đã thống nhất, từ khâu chuẩn bị đến bàn giao thành phẩm.
              </p>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Dịch vụ triển khai</span>
                <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                  TVC, Corporate Film, Advertising Content, Short-form Video, Commercial Photography
                </p>
              </div>
            </div>

            {/* Supporting Focus: Monthly Media & Media Ops (7 cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:border-l lg:border-slate-200 lg:pl-10">
              
              {/* Line 2: Monthly Media */}
              <div className="reveal-section delay-100 space-y-4">
                <div className="space-y-1">
                  <span className="text-2xl font-mono font-bold text-slate-400 block">02</span>
                  <span className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    NỘI DUNG ĐỊNH KỲ
                  </span>
                  <h4 className="font-display text-xl font-bold text-[#070d1e] uppercase tracking-tight">
                    MONTHLY MEDIA
                  </h4>
                </div>

                <p className="text-[13.5px] text-slate-600 font-normal leading-relaxed">
                  Dành cho doanh nghiệp cần duy trì đầu ra Media theo tháng với lịch sản xuất, số lượng sản phẩm và quy trình duyệt được thống nhất trước.
                </p>

                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Dịch vụ triển khai</span>
                  <p className="text-[12px] text-slate-700 font-medium leading-relaxed">
                    Short-form Content, Social Content, Photo Content, Recurring Production
                  </p>
                </div>
              </div>

              {/* Line 3: Media Ops */}
              <div className="reveal-section delay-200 space-y-4 sm:border-l sm:border-slate-200 sm:pl-8">
                <div className="space-y-1">
                  <span className="text-2xl font-mono font-bold text-[#0284c7] block">03</span>
                  <span className="text-[10.5px] font-mono font-bold text-[#0284c7] uppercase tracking-widest block">
                    TƯ VẤN VẬN HÀNH
                  </span>
                  <h4 className="font-display text-xl font-bold text-[#070d1e] uppercase tracking-tight">
                    MEDIA OPS
                  </h4>
                </div>

                <p className="text-[13.5px] text-slate-600 font-normal leading-relaxed">
                  Dành cho doanh nghiệp đã có đội Media nội bộ nhưng đang gặp vấn đề trong quá trình vận hành. Vũ Anh Media rà soát hiện trạng, xác định điểm nghẽn và xử lý theo phạm vi thực tế.
                </p>

                <div className="pt-3 border-t border-slate-200">
                  <button 
                    onClick={() => scrollToSection('media-ops')}
                    className="inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-[#0284c7] hover:text-sky-600 cursor-pointer"
                  >
                    TÌM HIỂU MEDIA OPS
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 04. MEDIA OPS & SCROLL STORYTELLING (SURFACE: WHITE - STICKY EDITORIAL) */}
      {/* ========================================================================= */}
      <section id="media-ops" className="py-20 sm:py-28 relative z-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Sticky Left Column: Introduction (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 text-left">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0284c7]/10 rounded text-[10.5px] font-mono font-bold tracking-widest text-[#0284c7] uppercase">
                  MEDIA OPS
                </div>
                
                <h2 className="font-display text-2xl sm:text-3.5xl font-bold tracking-tight uppercase leading-[1.18] text-[#070d1e]">
                  XỬ LÝ ĐIỂM NGHẼN TRONG ĐỘI MEDIA NỘI BỘ
                </h2>
              </div>

              <div className="space-y-4 text-slate-600 text-[14.5px] leading-relaxed font-normal">
                <p>
                  Media Ops được triển khai cho những doanh nghiệp đã có đội Media nhưng hiệu quả vận hành chưa đạt yêu cầu. Vũ Anh Media xem trực tiếp cách team nhận việc, lập kế hoạch, sản xuất, hậu kỳ, duyệt và quản lý tài nguyên để xác định vấn đề đang nằm ở đâu.
                </p>
                <p>
                  Sau bước đánh giá, phạm vi xử lý mới được chốt. Có thể là workflow, cách phân vai, tiền kỳ, hậu kỳ, quản lý file hoặc năng lực chuyên môn của một số vị trí. Team Vũ Anh Media chỉ tham gia vào những hạng mục cần thiết.
                </p>
              </div>
            </div>

            {/* Right Column: Progressive Diagnostic Bottlenecks Editorial Rows (7 cols) */}
            <div className="lg:col-span-7 space-y-1">
              <div className="pb-4 border-b border-slate-200">
                <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                  DIAGNOSTIC
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase text-[#070d1e]">
                  CÁC ĐIỂM NGHẼN THƯỜNG GẶP
                </h3>
              </div>

              {[
                { num: '01', title: 'LẬP KẾ HOẠCH', desc: 'Mục tiêu chưa đủ rõ trước khi chuyển sang sản xuất. Thông tin thay đổi qua nhiều người.' },
                { num: '02', title: 'QUY TRÌNH', desc: 'Các bước nhận việc, sản xuất, duyệt và bàn giao chưa có một luồng thống nhất.' },
                { num: '03', title: 'SẢN XUẤT', desc: 'Quay mất nhiều thời gian, thiếu phương án tiền kỳ hoặc số lượng tư liệu sử dụng được thấp.' },
                { num: '04', title: 'HẬU KỲ', desc: 'Deadline khó kiểm soát, chất lượng phụ thuộc nhiều vào từng editor và chưa có tiêu chuẩn QC rõ.' },
                { num: '05', title: 'NHÂN SỰ', desc: 'Khó xác định vấn đề nằm ở năng lực chuyên môn, cách giao việc hay cách phân vai trong team.' },
                { num: '06', title: 'TÀI NGUYÊN SỐ', desc: 'Footage, project file và tài nguyên cũ khó tìm, khó bàn giao và khó tái sử dụng.' }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="reveal-section py-5 border-b border-slate-200/80 transition-colors group text-left pl-1"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-[#0284c7] font-mono font-bold text-sm">0{idx + 1}</span>
                    <h4 className="font-display text-base sm:text-[17px] font-bold text-[#070d1e] uppercase tracking-tight group-hover:text-[#0284c7] transition-colors">
                      — {item.title}
                    </h4>
                  </div>
                  <p className="text-[14px] text-slate-600 font-normal leading-relaxed pl-7 pt-1">
                    {item.desc}
                  </p>
                </div>
              ))}

            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 05. PROCESS (SURFACE: LIGHT NEUTRAL - HORIZONTAL SEQUENCE) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 relative z-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 space-y-12">
          
          <div className="reveal-headline max-w-3xl space-y-1">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              WORKING SEQUENCE
            </span>
            <h3 className="font-display text-2xl sm:text-3.5xl font-bold tracking-tight uppercase text-[#070d1e]">
              QUY TRÌNH MEDIA OPS
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-200">
            {[
              { num: '01', title: 'RÀ SOÁT HIỆN TRẠNG', desc: 'Làm việc với người phụ trách và các vị trí liên quan để xem cách team đang nhận việc, sản xuất, duyệt, lưu trữ và phối hợp.' },
              { num: '02', title: 'CHỐT PHẠM VI XỬ LÝ', desc: 'Sau khi xác định nguyên nhân, Vũ Anh Media đề xuất phần việc cần chỉnh, người tham gia, thời gian thực hiện và đầu ra cần bàn giao.' },
              { num: '03', title: 'TRIỂN KHAI & TRAINING', desc: 'Làm trực tiếp trên workflow, tài liệu hoặc công việc thực tế của team. Training chuyên môn được thực hiện ở những vị trí đang thiếu năng lực cần thiết.' },
              { num: '04', title: 'BÀN GIAO', desc: 'Sau khi hoàn thành, Vũ Anh Media bàn giao tài liệu, workflow, checklist và các tiêu chuẩn đã được thống nhất. Đội ngũ nội bộ tiếp tục sử dụng trong công việc hằng ngày.' }
            ].map((step, idx) => (
              <div key={idx} className="reveal-section space-y-3 text-left">
                <span className={`text-2xl font-mono font-bold block ${idx === 0 || idx === 3 ? 'text-[#0284c7]' : 'text-slate-400'}`}>
                  {step.num}
                </span>
                <h4 className="font-display text-base font-bold text-[#070d1e] uppercase tracking-tight">{step.title}</h4>
                <p className="text-[13.5px] text-slate-600 font-normal leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-[12px] text-slate-500 font-mono font-medium pt-2 text-left">
            * Review định kỳ có thể được thực hiện riêng theo nhu cầu của doanh nghiệp.
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 06. SCOPE OF WORK (SURFACE: WHITE - STRUCTURED 2-COL INDEX) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 relative z-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 space-y-10">
          
          <div className="reveal-headline max-w-3xl space-y-1 text-left">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              MODULES
            </span>
            <h3 className="font-display text-2xl sm:text-3.5xl font-bold tracking-tight uppercase text-[#070d1e]">
              PHẠM VI CÔNG VIỆC
            </h3>
          </div>

          {/* Structured 2-Column Professional Index */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 border-t border-slate-200">
            {[
              { num: '01', title: 'QUY TRÌNH & TRÁCH NHIỆM' },
              { num: '02', title: 'BRIEF & KẾ HOẠCH' },
              { num: '03', title: 'SẢN XUẤT' },
              { num: '04', title: 'HẬU KỲ' },
              { num: '05', title: 'PHỐI HỢP NỘI DUNG' },
              { num: '06', title: 'ĐỊNH DẠNG KÊNH' },
              { num: '07', title: 'QUẢN LÝ TÀI SẢN SỐ' },
              { num: '08', title: 'TIÊU CHUẨN QC' },
              { num: '09', title: 'TRAINING CHUYÊN MÔN' },
              { num: '10', title: 'RÀ SOÁT VAI TRÒ & KPI' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between py-4 border-b border-slate-200 text-slate-800"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[11.5px] font-mono font-bold text-[#0284c7]">{item.num}</span>
                  <span className="font-bold text-[13.5px] sm:text-[14px] uppercase tracking-tight">{item.title}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[12.5px] text-slate-500 font-medium text-left">
            Hạng mục thực hiện được xác định sau khi rà soát hiện trạng. Mỗi doanh nghiệp có phạm vi khác nhau.
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 07. TEAM CAPABILITY (SURFACE: LIGHT NEUTRAL - HIGH HUMAN PRESENCE 48%) */}
      {/* ========================================================================= */}
      <section id="team" className="py-20 sm:py-28 relative z-20 border-t border-slate-200 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 space-y-16">
          
          <div className="reveal-headline max-w-3xl space-y-1 text-left">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              ORGANIZATION
            </span>
            <h2 className="font-display text-2xl sm:text-3.5xl font-bold tracking-tight uppercase text-[#070d1e]">
              NĂNG LỰC CHUYÊN MÔN
            </h2>
          </div>

          {/* Desktop Grid: Founder occupies ~48% on left, Disciplines on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-t border-slate-200 pt-10">
            
            {/* Founder Profile (~48% desktop) */}
            <div className="reveal-media lg:col-span-6 flex flex-col sm:flex-row lg:flex-col gap-6 items-start">
              <div className="w-44 h-56 sm:w-52 sm:h-64 lg:w-64 lg:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 shadow-lg shrink-0">
                <img 
                  src="/assets/founder.png" 
                  className="w-full h-full object-cover" 
                  alt="Founder Vũ Anh" 
                />
              </div>

              <div className="space-y-2 text-left">
                <div className="space-y-0.5">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#070d1e] uppercase tracking-tight">
                    VŨ ANH
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-[#0284c7] uppercase tracking-widest block">
                    Creative & Operations Director
                  </span>
                </div>

                <p className="text-[14px] text-slate-600 font-normal leading-relaxed max-w-md pt-1">
                  Kinh nghiệm điều phối trực tiếp các dự án TVC, truyền thông thương hiệu và tổ chức bộ máy sản xuất Media doanh nghiệp.
                </p>
              </div>
            </div>

            {/* 5 Core Disciplines Editorial Index (6 cols desktop) */}
            <div className="lg:col-span-6 space-y-6 lg:border-l lg:border-slate-200 lg:pl-10 text-left">
              {[
                { title: 'Creative & Operations', desc: 'Định hướng sản xuất, lập kế hoạch, chuẩn hóa quy trình và tổ chức phối hợp.' },
                { title: 'Production', desc: 'Đạo diễn, quay phim, ánh sáng, âm thanh và kỹ thuật trường quay.' },
                { title: 'Post-production', desc: 'Dựng phim, chỉnh màu, đồ họa chuyển động và kiểm soát tiêu chuẩn QC.' },
                { title: 'Brand & Communication', desc: 'Nghiên cứu định vị, bám sát ngôn ngữ thương hiệu và thông điệp truyền thông.' },
                { title: 'Social Channel', desc: 'Quy chuẩn định dạng video ngắn, phân phối đa nền tảng và lịch phát hành.' }
              ].map((cap, idx) => (
                <div key={idx} className="reveal-section space-y-1 pb-4 border-b border-slate-200/70 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono font-bold text-[#0284c7]">0{idx + 1}</span>
                    <h4 className="font-display font-bold text-[15px] text-[#070d1e] uppercase tracking-tight">
                      {cap.title}
                    </h4>
                  </div>
                  <p className="text-[13px] text-slate-600 font-normal leading-relaxed pl-7">
                    {cap.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 08. PARTNERS (SURFACE: WHITE - QUIET TYPOGRAPHIC LISTING) */}
      {/* ========================================================================= */}
      <section id="partners" className="py-20 sm:py-24 relative z-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 space-y-8 text-left">
          
          <div className="reveal-headline max-w-3xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight uppercase text-[#070d1e]">
              ĐỐI TÁC ĐÃ ĐỒNG HÀNH
            </h2>
          </div>

          {/* Quiet Typographic Listing with Clean Dot Markers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 border-t border-slate-200 pt-6">
            {siteContent.partnersList.map((partner, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2.5 text-slate-800 font-medium text-[13.5px] leading-snug"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0 mt-2" />
                <span className="break-words">{partner}</span>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 09. CONTACT (SURFACE: DEEP BRAND NAVY - PROFESSIONAL INTAKE) */}
      {/* ========================================================================= */}
      <section id="contact" className="py-20 sm:py-28 relative z-20 border-t border-slate-800 bg-[#070d1e] text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start text-left">
            
            {/* Left Column: Direct Channels & Context (4 cols) */}
            <div className="reveal-section lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <span className="text-[10.5px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
                  PROJECT INTAKE
                </span>
                <h2 className="font-display text-2xl sm:text-3.5xl font-bold tracking-tight uppercase leading-[1.2] text-white">
                  TRAO ĐỔI CÔNG VIỆC
                </h2>
                <p className="text-[14px] sm:text-[15px] text-slate-300 font-normal leading-relaxed">
                  Cho Vũ Anh Media biết nhu cầu hiện tại và phần việc đang cần xử lý. Chúng tôi sẽ trao đổi dựa trên phạm vi thực tế.
                </p>
              </div>

              {/* Direct Channels */}
              <div className="space-y-3.5 pt-4 border-t border-slate-800 text-[13px] text-slate-300 font-normal">
                <div className="flex items-start gap-3">
                  <Mail className="w-4.5 h-4.5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Email:</span>
                    <span>{siteContent.contactEmail}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4.5 h-4.5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Hotline / Zalo:</span>
                    <span>{siteContent.contactPhone}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4.5 h-4.5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Khu vực hoạt động:</span>
                    <span>{siteContent.contactRegion}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a 
                  href={`tel:${siteContent.contactPhone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-bold uppercase tracking-widest text-white hover:border-sky-400 hover:text-sky-400 transition-all shadow-sm"
                >
                  LIÊN HỆ TRỰC TIẾP
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Column: Intake Form (8 cols) */}
            <div className="reveal-section delay-100 lg:col-span-8 bg-[#0b1329] rounded-2xl p-7 sm:p-9 border border-slate-800 shadow-xl">
              {formState !== 'success' ? (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  
                  {/* Understated Service Selector */}
                  <div className="space-y-2">
                    <label className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Nhu cầu hợp tác
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { key: 'Media Production', label: 'Media Production' },
                        { key: 'Monthly Media', label: 'Monthly Media' },
                        { key: 'Media Ops', label: 'Media Ops' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setNeed(item.key as any)}
                          className={`px-3.5 py-2.5 rounded-lg text-[12px] font-bold text-center border transition-all cursor-pointer ${need === item.key ? 'bg-[#0284c7] text-white border-[#0284c7]' : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-900'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Tên doanh nghiệp / Đơn vị
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Ví dụ: Công ty Cổ phần / Thương hiệu..." 
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 text-[13.5px] font-medium transition-all text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Người phụ trách
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Họ và tên..." 
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 text-[13.5px] font-medium transition-all text-white placeholder-slate-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Số điện thoại / Zalo
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Số liên lạc..." 
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 text-[13.5px] font-medium transition-all text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Mô tả hiện trạng hoặc nội dung cần làm
                    </label>
                    <textarea 
                      rows={3} 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Mục tiêu, vấn đề đang gặp phải hoặc thời gian mong muốn triển khai..." 
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 text-[13.5px] font-medium transition-all resize-none text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="pt-1">
                    <button 
                      type="submit" 
                      disabled={formState === 'submitting'}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[11.5px] font-bold uppercase tracking-widest text-white bg-[#0284c7] hover:bg-sky-500 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {formState === 'submitting' ? (
                        'Đang gửi thông tin...'
                      ) : (
                        <>
                          GỬI THÔNG TIN
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20 text-sky-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-xl text-white uppercase tracking-tight">Thông Tin Đã Được Tiếp Nhận</h3>
                    <p className="text-[13.5px] text-slate-300 font-normal leading-relaxed">
                      Vũ Anh Media sẽ phản hồi trực tiếp dựa trên phạm vi công việc cần xử lý.
                    </p>
                  </div>
                  <button 
                    onClick={() => setFormState('idle')}
                    className="px-5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-sky-400 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* FOOTER (SURFACE: DEEP BRAND NAVY - CLEAN & RESTRAINED) */}
      {/* ========================================================================= */}
      <footer className="py-8 relative z-20 border-t border-slate-800/80 bg-[#050a17] text-slate-400">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11.5px] font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
            <span className="font-bold text-white uppercase tracking-wider">VŨ ANH MEDIA</span>
            <span>— Media Production & Operations</span>
          </div>

          <div>
            <span>© 2026 VŨ ANH MEDIA. All rights reserved.</span>
          </div>
        </div>
      </footer>


      {/* ========================================================================= */}
      {/* LIGHTBOX MODALS */}
      {/* ========================================================================= */}

      {/* SMART VIDEO LIGHTBOX MODAL */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/92 backdrop-blur-md p-3 sm:p-6 transition-all duration-300"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-30">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Đóng (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div 
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {getYouTubeId(videoModalUrl) ? (
              <iframe 
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(videoModalUrl)}?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`} 
                title="Vũ Anh Media Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : getVimeoId(videoModalUrl) ? (
              <iframe 
                src={`https://player.vimeo.com/video/${getVimeoId(videoModalUrl)}?autoplay=1`} 
                title="Vimeo Video Player"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : getGoogleDriveId(videoModalUrl) ? (
              <iframe 
                src={`https://drive.google.com/file/d/${getGoogleDriveId(videoModalUrl)}/preview`} 
                title="Google Drive Video Player"
                allow="autoplay"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video 
                src={videoModalUrl} 
                autoPlay 
                controls 
                playsInline
                className="w-full h-full object-contain bg-black"
                onError={(e) => {
                  console.warn('Video playback warning:', e);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* IN-APP IMAGE LIGHTBOX MODAL */}
      {activeImageModal && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/92 backdrop-blur-md p-3 sm:p-6 transition-all duration-300"
          onClick={() => setActiveImageModal(null)}
        >
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-30">
            <button 
              onClick={() => setActiveImageModal(null)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shadow-lg hover:scale-105"
              title="Đóng (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-white/20 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[65vh] bg-black/40 flex items-center justify-center overflow-hidden">
              <img 
                src={activeImageModal.img} 
                alt={activeImageModal.title} 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="w-full p-5 sm:p-6 bg-slate-950 text-left border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[8.5px] font-mono font-bold uppercase tracking-widest bg-[#0284c7] text-white rounded">
                  {activeImageModal.category === 'video' ? 'VIDEO' : activeImageModal.category === 'image' ? 'HÌNH ẢNH' : 'NỘI DUNG ĐỊNH KỲ'}
                </span>
                <h3 className="font-display font-bold text-[15px] sm:text-[17px] text-white uppercase tracking-tight">
                  {activeImageModal.title}
                </h3>
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-slate-400 font-normal leading-relaxed">
                {activeImageModal.desc}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
