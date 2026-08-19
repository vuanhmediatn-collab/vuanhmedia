import type { SiteContentMap } from '../services/siteContent.service';

export interface PrincipleItem {
  num: string;
  title: string;
  desc: string;
}

export interface ServiceItem {
  tag: string;
  title: string;
  icon: 'film' | 'layers' | 'shield';
  desc: string;
  deliverablesLabel: string;
  deliverables: string;
  commitmentLabel: string;
  commitment: string;
}

export interface ProcessStepItem {
  step: string;
  title: string;
  desc: string;
}

export interface MappedSiteContent {
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
  aboutPrinciples: PrincipleItem[];
  aboutFounderTitle: string;
  aboutFounderQuote: string;
  founderTitle: string;
  founderQuote: string;

  servicesHeadline: string;
  servicesDescription: string;
  servicesList: ServiceItem[];

  processHeadline: string;
  processDescription: string;
  processSteps: ProcessStepItem[];

  contactHeadline: string;
  contactDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactRegion: string;
  contactFormEndpoint?: string;
  googleSheetUrl?: string;
}

export const EXPECTED_CONTENT_KEYS = [
  'hero.tagline',
  'hero.headline_line_1',
  'hero.headline_highlight_1',
  'hero.headline_line_2',
  'hero.headline_highlight_2',
  'hero.subheadline',
  'hero.cta_primary',
  'hero.cta_secondary',
  'partners.intro',
  'partners.list',
  'about.headline',
  'about.description',
  'about.principles',
  'about.founder_title',
  'about.founder_quote',
  'services.headline',
  'services.description',
  'services.list',
  'process.headline',
  'process.description',
  'process.steps',
  'contact.headline',
  'contact.description',
  'contact.email',
  'contact.phone',
  'contact.region',
] as const;

export const defaultSiteContentFallback: MappedSiteContent = {
  heroTagline: "Media Production & Operations",
  heroHeadlineLine1: "Sản xuất nội dung",
  heroHeadlineHighlight1: "chuyên nghiệp",
  heroHeadlineLine2: "Vận hành media",
  heroHeadlineHighlight2: "bài bản",
  heroSubheadline: "Vũ Anh Media đồng hành cùng các doanh nghiệp SME giải quyết triệt để khoảng trống về nhân sự và quy trình sản xuất. Chúng tôi không chỉ cung cấp những thước phim, bộ ảnh chuẩn mực mà còn thiết lập hệ thống vận hành để nội dung của bạn ra đều đặn, đúng định hướng và thực sự trở thành tài sản thương hiệu.",
  heroCta1Text: "Yêu cầu tư vấn giải pháp",
  heroCta2Text: "Xem năng lực thực chiến",
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
  
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
  aboutDescription: "Hầu hết các doanh nghiệp đi lên từ chuyên môn thường gặp khó khăn trong việc duy trì chất lượng và tần suất xuất hiện hình ảnh đồng đều. Nhận diện thương hiệu bị đứt gãy do quy trình sản xuất manh mún, nhân sự thiếu tính cam kết lâu dài hoặc chi phí vận hành bị đội lên cao qua các khâu trung gian. VŨ ANH MEDIA được sinh ra để tái định nghĩa hoạt động sản xuất hình ảnh bằng 3 trụ cột vận hành cốt lõi:",
  aboutPrinciples: [
    { 
      num: '01', 
      title: 'Vận hành chuẩn hóa bằng quy trình hệ thống', 
      desc: 'Chúng tôi loại bỏ hoàn toàn sự phụ thuộc vào cảm tính cá nhân hay tính ngẫu hứng nghệ thuật. Mọi chiến dịch hình ảnh của VŨ ANH MEDIA đều được kiểm soát nghiêm ngặt từ khâu Briefing, Shotlist kịch bản đến tối ưu hóa hiện trường. Sự cam kết tuyệt đối về chất lượng và tiến độ được đảm bảo bằng hợp đồng pháp lý cùng quy trình vận hành đội ngũ đồng bộ, chuyên nghiệp.' 
    },
    { 
      num: '02', 
      title: 'Tối ưu hóa & Biến Media thành tài sản tích lũy', 
      desc: 'Một thước phim hay tấm ảnh chất lượng cao không phải là khoản chi phí tiêu sản một lần. Chúng tôi đồng hành cùng đối tác xây dựng thư viện tư liệu media thông minh, lưu trữ và bảo mật dữ liệu dự án tối thiểu 12 tháng. Doanh nghiệp dễ dàng khai thác, tái cấu trúc và phân phối nội dung đa kênh trọn đời, giúp nhân bản giá trị sử dụng và tối ưu hóa tối đa chi phí đầu tư dài hạn.' 
    },
    { 
      num: '03', 
      title: 'Tập trung tối đa vào giá trị lõi', 
      desc: 'VŨ ANH MEDIA nói KHÔNG với việc nhận triển khai đa dịch vụ dàn trải như Ads hay chạy sự kiện. Chúng tôi dồn 100% tài nguyên, tư duy nghệ thuật và công nghệ hiện đại vào năng lực cốt lõi: Sản xuất hình ảnh và Vận hành Media bài bản. Sự chuyên sâu tuyệt đối này đảm bảo mỗi khung hình bàn giao cho khách hàng đều đạt chuẩn mỹ thuật cao cấp nhất.' 
    }
  ],
  founderTitle: "Tầm nhìn thương hiệu từ chi tiết nhỏ",
  founderQuote: "Sự tinh tế của một tác phẩm media không nằm ở thiết bị đắt tiền, mà nằm ở tư duy thấu hiểu ngôn ngữ thương hiệu và kỷ luật đúc kết trong từng chi tiết nhỏ.",
  aboutFounderTitle: "Tầm nhìn thương hiệu từ chi tiết nhỏ",
  aboutFounderQuote: "Sự tinh tế của một tác phẩm media không nằm ở thiết bị đắt tiền, mà nằm ở tư duy thấu hiểu ngôn ngữ thương hiệu và kỷ luật đúc kết trong từng chi tiết nhỏ.",

  servicesHeadline: "Hệ sinh thái dịch vụ Media toàn diện cho SME",
  servicesDescription: "Mỗi doanh nghiệp cần một sự chuẩn bị và giải pháp khác nhau. Vũ Anh Media thiết kế 3 tầng trục năng lực dịch vụ bài bản để hỗ trợ sự phát triển liên tục của bạn:",
  servicesList: [
    {
      tag: "TẦNG 01",
      title: "Media Production — Sản xuất theo dự án",
      icon: 'film' as const,
      desc: "Giải quyết bài toán tạo dấu ấn hình ảnh đột phá trong các chiến dịch ngắn hạn hoặc xây dựng nền tảng nhận diện cốt lõi cho thương hiệu.",
      deliverablesLabel: "Sản phẩm cốt lõi",
      deliverables: "Video TVC doanh nghiệp • Video Profile thương hiệu/sản phẩm • Video quảng cáo cửa hàng • Video ngắn đa nền tảng (TikTok, Reels, Shorts) • Nhiếp ảnh thương mại chuẩn mực.",
      commitmentLabel: "Cam kết B2B",
      commitment: "Quy trình trọn gói từ Brief, kịch bản, storyboard, shot list đến hậu kỳ chuyên sâu (Color Grading 4K, Sound, Motion)."
    },
    {
      tag: "TẦNG 02",
      title: "Monthly Media — Giải pháp nội dung định kỳ",
      icon: 'layers' as const,
      desc: "Giải quyết bài toán đứt gãy mạch nội dung. Duy trì điểm chạm liên tục với khách hàng mục tiêu mà không làm tăng áp lực quản lý cho chủ doanh nghiệp.",
      deliverablesLabel: "Sản phẩm cốt lõi",
      deliverables: "Gói nội dung cam kết số lượng theo tháng cho Spa, Nha khoa, F&B, Doanh nghiệp SME (Video ngắn + Bộ ảnh sản phẩm/nhân vật + Tuyến nội dung viết tương ứng).",
      commitmentLabel: "Cam kết B2B",
      commitment: "Lịch sản xuất cố định, nhân sự phụ trách riêng biệt, output đầu ra đồng đều về mặt visual direction."
    },
    {
      tag: "TẦNG 03",
      title: "Media Operations — Tư vấn & Thiết lập bộ máy nội bộ",
      icon: 'shield' as const,
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
  contactEmail: "vuanhmediatn@gmail.com",
  contactPhone: "0974003662",
  contactRegion: "Thành phố Hồ Chí Minh | Hà Nội",
  contactFormEndpoint: ""
};

/**
 * Strict Dataset Integrity Mapper:
 * - Strategy A: Full valid Supabase dataset (all 26 keys) -> Use 100% Supabase.
 * - Strategy B: Error or missing map -> Use full legacy fallback dataset.
 * - Strategy C: Incomplete dataset (< 26 keys) -> Log integrity error and use whole legacy fallback.
 * (No silent key-by-key mixing between Supabase and legacy fallback).
 */
export const getMappedContent = (map: SiteContentMap | undefined): MappedSiteContent => {
  if (!map) {
    return defaultSiteContentFallback;
  }

  // Check integrity: Verify all 26 required keys exist
  const missingKeys = EXPECTED_CONTENT_KEYS.filter((key) => map[key] === undefined);

  if (missingKeys.length > 0) {
    console.error(
      `⚠️ Content Integrity Error: Supabase returned incomplete dataset (missing ${missingKeys.length} keys: ${missingKeys.join(
        ', '
      )}). Utilizing safe fallback dataset.`
    );
    return defaultSiteContentFallback;
  }

  // Strategy A: Return pure Supabase data
  const founderTitleVal = (map['about.founder_title'] as string) || '';
  const founderQuoteVal = (map['about.founder_quote'] as string) || '';

  return {
    heroTagline: map['hero.tagline'] as string,
    heroHeadlineLine1: map['hero.headline_line_1'] as string,
    heroHeadlineHighlight1: map['hero.headline_highlight_1'] as string,
    heroHeadlineLine2: map['hero.headline_line_2'] as string,
    heroHeadlineHighlight2: map['hero.headline_highlight_2'] as string,
    heroSubheadline: map['hero.subheadline'] as string,
    heroCta1Text: map['hero.cta_primary'] as string,
    heroCta2Text: map['hero.cta_secondary'] as string,

    partnersIntro: map['partners.intro'] as string,
    partnersList: map['partners.list'] as string[],

    aboutHeadline: map['about.headline'] as string,
    aboutDescription: map['about.description'] as string,
    aboutPrinciples: map['about.principles'] as PrincipleItem[],
    aboutFounderTitle: founderTitleVal,
    aboutFounderQuote: founderQuoteVal,
    founderTitle: founderTitleVal,
    founderQuote: founderQuoteVal,

    servicesHeadline: map['services.headline'] as string,
    servicesDescription: map['services.description'] as string,
    servicesList: map['services.list'] as ServiceItem[],

    processHeadline: map['process.headline'] as string,
    processDescription: map['process.description'] as string,
    processSteps: map['process.steps'] as ProcessStepItem[],

    contactHeadline: map['contact.headline'] as string,
    contactDescription: map['contact.description'] as string,
    contactEmail: map['contact.email'] as string,
    contactPhone: map['contact.phone'] as string,
    contactRegion: map['contact.region'] as string,
    contactFormEndpoint: defaultSiteContentFallback.contactFormEndpoint,
    googleSheetUrl: defaultSiteContentFallback.googleSheetUrl,
  };
};
