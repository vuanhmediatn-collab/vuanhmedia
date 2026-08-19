import type { SiteContentSection } from '../types/content.types';

export const SECTION_LABELS: Record<SiteContentSection, { name: string; description: string; order: number }> = {
  hero: {
    name: 'Trang đầu',
    description: 'Nội dung đầu trang (Tagline, Tiêu đề chính, Đoạn dẫn và nút kêu gọi hành động)',
    order: 1,
  },
  about: {
    name: 'Giới thiệu',
    description: 'Thông điệp giới thiệu, nguyên tắc hoạt động và trích dẫn góc nhìn nhà sáng lập',
    order: 2,
  },
  services: {
    name: 'Dịch vụ',
    description: 'Các gói giải pháp dịch vụ cốt lõi, phạm vi thực hiện và cam kết chất lượng',
    order: 3,
  },
  process: {
    name: 'Quy trình',
    description: 'Các bước triển khai sản xuất và vận hành nội dung media chuẩn mực',
    order: 4,
  },
  partners: {
    name: 'Đối tác',
    description: 'Danh sách các thương hiệu, đối tác doanh nghiệp đồng hành',
    order: 5,
  },
  contact: {
    name: 'Liên hệ',
    description: 'Thông tin liên hệ, hotline, email tiếp nhận và địa bàn hoạt động',
    order: 6,
  },
};

export const CONTENT_KEY_LABELS: Record<string, { label: string; helperText?: string; isLongText?: boolean }> = {
  // HERO
  'hero.tagline': {
    label: 'Dòng định vị thương hiệu',
    helperText: 'Dòng chữ ngắn gọn phía trên tiêu đề chính (VD: Media Production & Operations)',
  },
  'hero.headline_line_1': {
    label: 'Tiêu đề dòng 1',
    helperText: 'Nội dung văn bản chính dòng thứ nhất',
  },
  'hero.headline_highlight_1': {
    label: 'Từ nhấn dòng 1',
    helperText: 'Cụm từ được làm nổi bật với phong cách typography đặc trưng ở dòng 1',
  },
  'hero.headline_line_2': {
    label: 'Tiêu đề dòng 2',
    helperText: 'Nội dung văn bản chính dòng thứ hai',
  },
  'hero.headline_highlight_2': {
    label: 'Từ nhấn dòng 2',
    helperText: 'Cụm từ được làm nổi bật ở dòng 2',
  },
  'hero.subheadline': {
    label: 'Mô tả giới thiệu đầu trang',
    helperText: 'Đoạn văn tóm tắt giá trị cốt lõi dưới tiêu đề',
    isLongText: true,
  },
  'hero.cta_primary': {
    label: 'Nút hành động chính (Primary CTA)',
    helperText: 'Văn bản hiển thị trên nút chính (VD: Yêu cầu tư vấn giải pháp)',
  },
  'hero.cta_secondary': {
    label: 'Nút hành động phụ (Secondary CTA)',
    helperText: 'Văn bản hiển thị trên nút phụ (VD: Khám phá dự án)',
  },

  // ABOUT
  'about.headline': {
    label: 'Tiêu đề giới thiệu',
    helperText: 'Tiêu đề lớn của phần Giới thiệu',
  },
  'about.description': {
    label: 'Nội dung giới thiệu',
    helperText: 'Đoạn văn chi tiết về sứ mệnh và cách thức tiếp cận của Vũ Anh Media',
    isLongText: true,
  },
  'about.principles': {
    label: 'Các nguyên tắc vận hành',
    helperText: 'Danh sách các giá trị cốt lõi và nguyên tắc làm việc với khách hàng',
  },
  'about.founder_title': {
    label: 'Tiêu đề góc nhìn',
    helperText: 'Tiêu đề phần trích dẫn từ Founder',
  },
  'about.founder_quote': {
    label: 'Nội dung trích dẫn Founder',
    helperText: 'Lời chia sẻ và định hướng chiến lược từ nhà sáng lập',
    isLongText: true,
  },

  // SERVICES
  'services.headline': {
    label: 'Tiêu đề danh mục dịch vụ',
    helperText: 'Tiêu đề chính cho phần Dịch vụ',
  },
  'services.description': {
    label: 'Mô tả tổng quan dịch vụ',
    helperText: 'Đoạn tóm tắt định hướng cung cấp giải pháp',
    isLongText: true,
  },
  'services.list': {
    label: 'Danh sách các gói dịch vụ',
    helperText: 'Cấu trúc các tầng giải pháp (Sản xuất TVC, Vận hành kênh, v.v.)',
  },

  // PROCESS
  'process.headline': {
    label: 'Tiêu đề quy trình làm việc',
    helperText: 'Tiêu đề chính cho phần Quy trình',
  },
  'process.description': {
    label: 'Mô tả quy trình',
    helperText: 'Đoạn giới thiệu về các bước phối hợp với doanh nghiệp',
    isLongText: true,
  },
  'process.steps': {
    label: 'Các bước triển khai quy trình',
    helperText: 'Trình tự từng giai đoạn thực thi dự án',
  },

  // PARTNERS
  'partners.intro': {
    label: 'Mô tả phần đối tác',
    helperText: 'Dòng dẫn nhập phía trên logo/tên đối tác',
  },
  'partners.list': {
    label: 'Danh sách đối tác & thương hiệu',
    helperText: 'Danh sách tên các doanh nghiệp đồng hành',
  },

  // CONTACT
  'contact.headline': {
    label: 'Tiêu đề phần liên hệ',
    helperText: 'Tiêu đề chính của khu vực liên hệ',
  },
  'contact.description': {
    label: 'Mô tả liên hệ',
    helperText: 'Lời mời hợp tác và hướng dẫn kết nối',
    isLongText: true,
  },
  'contact.email': {
    label: 'Địa chỉ Email doanh nghiệp',
    helperText: 'Hộp thư tiếp nhận yêu cầu báo giá và hợp tác',
  },
  'contact.phone': {
    label: 'Số điện thoại / Hotline',
    helperText: 'Hotline tư vấn trực tiếp',
  },
  'contact.region': {
    label: 'Khu vực hoạt động',
    helperText: 'Địa bàn triển khai dịch vụ (VD: Toàn quốc / Hà Nội & TP.HCM)',
  },
};

/**
 * Get human readable label for any content_key with fallback formatting
 */
export const getHumanLabel = (contentKey: string): string => {
  if (CONTENT_KEY_LABELS[contentKey]) {
    return CONTENT_KEY_LABELS[contentKey].label;
  }
  const parts = contentKey.split('.');
  const keyPart = parts[parts.length - 1] || contentKey;
  return keyPart
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get section display name
 */
export const getSectionLabel = (section: SiteContentSection): string => {
  return SECTION_LABELS[section]?.name || section;
};
