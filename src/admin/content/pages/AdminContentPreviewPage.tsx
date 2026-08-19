import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Sparkles,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

import { useSiteContentAdmin } from '../hooks/useSiteContentAdmin';
import { getMappedContent, type MappedSiteContent } from '../../../utils/contentMapper';

interface AdminContentPreviewPageProps {
  onBackToEditor: () => void;
}

export const AdminContentPreviewPage: React.FC<AdminContentPreviewPageProps> = ({
  onBackToEditor,
}) => {
  const [previewMode, setPreviewMode] = useState<'draft' | 'published'>('draft');
  const { rows, summary, isLoading } = useSiteContentAdmin();

  // Construct content map based on selected previewMode
  const previewMappedContent: MappedSiteContent = useMemo(() => {
    const rawMap: Record<string, any> = {};
    for (const r of rows) {
      rawMap[r.content_key] = previewMode === 'draft' ? r.draft_value : r.published_value;
    }
    return getMappedContent(rawMap);
  }, [rows, previewMode]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
        <div className="w-8 h-8 border-3 border-sky-500/20 border-t-sky-600 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Đang tải dữ liệu xem trước...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Sticky Top Control Toolbar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToEditor}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Quay lại trình quản lý"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-[#0b1329] tracking-tight">
                Xem trước Giao diện Website (Preview)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                previewMode === 'draft'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {previewMode === 'draft' ? 'Bản nháp (Draft)' : 'Đã xuất bản (Live)'}
              </span>
            </div>
            <p className="text-[11.5px] text-slate-500 font-medium">
              Chế độ hiển thị an toàn nội bộ — Chỉ quản trị viên mới thấy giao diện này.
            </p>
          </div>
        </div>

        {/* Switcher & Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setPreviewMode('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === 'draft'
                  ? 'bg-white text-[#0b1329] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bản nháp ({summary.pendingChanges} đổi)
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                previewMode === 'published'
                  ? 'bg-white text-[#0b1329] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đang xuất bản
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToEditor}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            Về trình biên tập
          </button>
        </div>
      </div>

      {/* Visual Website Preview Container */}
      <div className="bg-[#030712] text-white rounded-3xl p-6 sm:p-12 space-y-16 border border-slate-800 shadow-2xl overflow-hidden">
        {/* SECTION 1: HERO */}
        <section className="space-y-6 max-w-4xl mx-auto text-center pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{previewMappedContent.heroTagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {previewMappedContent.heroHeadlineLine1}{' '}
            <span className="text-sky-400 italic">
              {previewMappedContent.heroHeadlineHighlight1}
            </span>
            <br />
            {previewMappedContent.heroHeadlineLine2}{' '}
            <span className="text-sky-400 italic">
              {previewMappedContent.heroHeadlineHighlight2}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            {previewMappedContent.heroSubheadline}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              className="px-6 py-3 rounded-full bg-[#0284c7] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-sky-500/20 cursor-default"
            >
              {previewMappedContent.heroCta1Text}
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700 cursor-default"
            >
              {previewMappedContent.heroCta2Text}
            </button>
          </div>
        </section>

        {/* SECTION 2: PARTNERS */}
        <section className="border-t border-slate-800/80 pt-10 text-center space-y-4 max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {previewMappedContent.partnersIntro}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {previewMappedContent.partnersList.map((partner, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300"
              >
                {partner}
              </span>
            ))}
          </div>
        </section>

        {/* SECTION 3: ABOUT */}
        <section className="border-t border-slate-800/80 pt-12 space-y-8 max-w-4xl mx-auto">
          <div className="space-y-3 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-sky-400">
              Về Chúng Tôi
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {previewMappedContent.aboutHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {previewMappedContent.aboutDescription}
            </p>
          </div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {previewMappedContent.aboutPrinciples.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
              >
                <span className="text-xl font-black font-mono text-sky-400">
                  {p.num}
                </span>
                <h4 className="text-sm font-bold text-white">{p.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Founder Quote Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-sky-400">
              {previewMappedContent.aboutFounderTitle}
            </span>
            <blockquote className="text-sm sm:text-base font-semibold italic text-slate-200">
              "{previewMappedContent.aboutFounderQuote}"
            </blockquote>
          </div>
        </section>

        {/* SECTION 4: SERVICES */}
        <section className="border-t border-slate-800/80 pt-12 space-y-8 max-w-4xl mx-auto">
          <div className="space-y-3 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-sky-400">
              Giải Pháp
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {previewMappedContent.servicesHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {previewMappedContent.servicesDescription}
            </p>
          </div>

          {/* Services List Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {previewMappedContent.servicesList.map((srv, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-900">
                    {srv.tag}
                  </span>
                  <h4 className="text-base font-bold text-white">{srv.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      {srv.deliverablesLabel}
                    </span>
                    <span className="text-slate-300 font-medium">{srv.deliverables}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      {srv.commitmentLabel}
                    </span>
                    <span className="text-slate-300 font-medium">{srv.commitment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: PROCESS */}
        <section className="border-t border-slate-800/80 pt-12 space-y-8 max-w-4xl mx-auto">
          <div className="space-y-3 text-center sm:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-sky-400">
              Quy Trình
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {previewMappedContent.processHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              {previewMappedContent.processDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {previewMappedContent.processSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative"
              >
                <span className="text-2xl font-black font-mono text-cyan-400">
                  {step.step}
                </span>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: CONTACT */}
        <section className="border-t border-slate-800/80 pt-12 space-y-6 max-w-4xl mx-auto">
          <div className="space-y-3 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-sky-400">
              Liên Hệ & Hợp Tác
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {previewMappedContent.contactHeadline}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">
              {previewMappedContent.contactDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <Phone className="w-5 h-5 text-sky-400 mx-auto" />
              <span className="text-[11px] text-slate-500 font-bold uppercase block">Hotline</span>
              <span className="text-xs font-bold text-white">{previewMappedContent.contactPhone}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <Mail className="w-5 h-5 text-sky-400 mx-auto" />
              <span className="text-[11px] text-slate-500 font-bold uppercase block">Email</span>
              <span className="text-xs font-bold text-white">{previewMappedContent.contactEmail}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <MapPin className="w-5 h-5 text-sky-400 mx-auto" />
              <span className="text-[11px] text-slate-500 font-bold uppercase block">Địa bàn</span>
              <span className="text-xs font-bold text-white">{previewMappedContent.contactRegion}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
