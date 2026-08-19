export interface SanitizedPublicProject {
  id: string | number;
  category: 'video' | 'image' | 'regular';
  title: string;
  desc: string;
  img: string;
  vid?: string;
  link?: string;
  slug?: string;
}

/**
 * IMMUTABLE SANITIZED PUBLIC PRODUCTION FALLBACK
 * Contains ONLY the 2 approved, verified published production projects.
 * Free of: Draft projects, borrowed demo videos, and Unsplash placeholders.
 */
export const SANITIZED_PUBLIC_PROJECTS_FALLBACK: SanitizedPublicProject[] = [
  {
    id: 'phim-quang-cao-tvc-tham-my-vien-quoc-te',
    slug: 'phim-quang-cao-tvc-tham-my-vien-quoc-te',
    category: 'video',
    title: 'Phim Quảng Cáo TVC - Thẩm Mỹ Viện Quốc Tế',
    desc: 'Sản xuất video TVC quảng cáo chuẩn điện ảnh định vị thương hiệu thẩm mỹ viện chuẩn quốc tế.',
    img: 'https://img.youtube.com/vi/162H3RVsW7s/hqdefault.jpg',
    vid: 'https://www.youtube.com/watch?v=162H3RVsW7s',
    link: '/project/phim-quang-cao-tvc-tham-my-vien-quoc-te'
  },
  {
    id: 'van-hanh-kenh-tiktok-fanpage-dinh-ky',
    slug: 'van-hanh-kenh-tiktok-fanpage-dinh-ky',
    category: 'regular',
    title: 'Vận Hành Kênh TikTok & Fanpage Định Kỳ',
    desc: 'Giải pháp xây dựng và duy trì tuyến nội dung media định kỳ đa nền tảng cho thương hiệu.',
    img: 'https://img.youtube.com/vi/yz35Dzyi4iM/hqdefault.jpg',
    vid: 'https://www.youtube.com/watch?v=yz35Dzyi4iM',
    link: '/project/van-hanh-kenh-tiktok-fanpage-dinh-ky'
  }
];
