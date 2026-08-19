-- ============================================================================
-- Migration: 20260818070954_phase_b2_legacy_data_migration.sql
-- Production Project: vuanhmedia-production (rjylcqtiicmhhhpuxuyw)
-- ============================================================================

BEGIN;

-- 1. PUBLIC SITE CONTENT SECURITY INTERFACE (Draft Protection)
CREATE OR REPLACE VIEW public.public_site_content AS
SELECT 
  id,
  section,
  content_key,
  published_value,
  content_type,
  updated_at
FROM public.site_content;

GRANT SELECT ON public.public_site_content TO anon, authenticated;

-- Tighten site_content table RLS: Only Admin can directly query site_content (protecting draft_value)
DROP POLICY IF EXISTS "Public read published site content" ON public.site_content;
DROP POLICY IF EXISTS "Public read site content" ON public.site_content;
DROP POLICY IF EXISTS "Admin view site content" ON public.site_content;

CREATE POLICY "Admin view site content"
ON public.site_content FOR SELECT
TO authenticated
USING (private.is_admin());

-- 2. SEED PROJECTS (Idempotent by unique slug)

-- 2.1 TVC Thẩm Mỹ Viện Quốc Tế (Published)
INSERT INTO public.projects (
  title,
  slug,
  client,
  category,
  year,
  short_description,
  cover_image,
  thumbnail,
  sort_order,
  is_featured,
  status,
  published_at
) VALUES (
  'Phim Quảng Cáo TVC - Thẩm Mỹ Viện Quốc Tế',
  'phim-quang-cao-tvc-tham-my-vien-quoc-te',
  'Học Viện Thẩm Mỹ Royal',
  'TVC Commercial',
  '2026',
  'Chiến dịch quảng bá định vị thương hiệu cao cấp 2026.',
  'https://i.ytimg.com/vi/162H3RVsW7s/hqdefault.jpg',
  'https://i.ytimg.com/vi/162H3RVsW7s/hqdefault.jpg',
  1,
  true,
  'published',
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 2.2 Vận Hành Kênh TikTok & Fanpage Định Kỳ (Published)
INSERT INTO public.projects (
  title,
  slug,
  client,
  category,
  year,
  short_description,
  cover_image,
  thumbnail,
  sort_order,
  is_featured,
  status,
  published_at
) VALUES (
  'Vận Hành Kênh TikTok & Fanpage Định Kỳ',
  'van-hanh-kenh-tiktok-fanpage-dinh-ky',
  'Học Viện Thẩm Mỹ Royal',
  'Social Media Operations',
  '2026',
  'Giải pháp sản xuất nội dung ngắn thu hút khách hàng tiềm năng.',
  'https://i.ytimg.com/vi/yz35Dzyi4iM/hqdefault.jpg',
  'https://i.ytimg.com/vi/yz35Dzyi4iM/hqdefault.jpg',
  2,
  false,
  'published',
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 2.3 PHIM DOANH NGHIỆP THÀNH LONG (Draft - no placeholder asset)
INSERT INTO public.projects (
  title,
  slug,
  client,
  category,
  year,
  short_description,
  cover_image,
  thumbnail,
  sort_order,
  is_featured,
  status
) VALUES (
  'PHIM DOANH NGHIỆP THÀNH LONG',
  'phim-doanh-nghiep-thanh-long',
  NULL,
  'Corporate Film',
  NULL,
  'Phim giới thiệu năng lực doanh nghiệp - Khẳng định vị thế và uy tín thương hiệu.',
  NULL,
  NULL,
  3,
  false,
  'draft'
) ON CONFLICT (slug) DO NOTHING;

-- 2.4 Bộ Ảnh Không Gian Minimalist Clinic (Draft - no Unsplash placeholder)
INSERT INTO public.projects (
  title,
  slug,
  client,
  category,
  year,
  short_description,
  cover_image,
  thumbnail,
  sort_order,
  is_featured,
  status
) VALUES (
  'Bộ Ảnh Không Gian Minimalist Clinic',
  'bo-anh-khong-gian-minimalist-clinic',
  NULL,
  'Commercial Photography',
  NULL,
  'Nhiếp ảnh kiến trúc nội thất phòng khám nha khoa chuẩn y khoa.',
  NULL,
  NULL,
  4,
  false,
  'draft'
) ON CONFLICT (slug) DO NOTHING;

-- 2.5 Wedding Thảo My - Trung Kiên (Draft - no Unsplash/borrowed video)
INSERT INTO public.projects (
  title,
  slug,
  client,
  category,
  year,
  short_description,
  cover_image,
  thumbnail,
  sort_order,
  is_featured,
  status
) VALUES (
  'Wedding Thảo My - Trung Kiên',
  'wedding-thao-my-trung-kien',
  'Thảo My & Trung Kiên',
  'Wedding Film',
  NULL,
  'Phim phóng sự cưới nghệ thuật - Ghi lại những khoảnh khắc cảm xúc chân thực.',
  NULL,
  NULL,
  5,
  false,
  'draft'
) ON CONFLICT (slug) DO NOTHING;

-- 3. SEED RELATIONAL VIDEOS (Resolved dynamically by slug, Idempotent)

-- 3.1 Video for TVC Thẩm Mỹ Viện Quốc Tế
INSERT INTO public.project_videos (
  project_id,
  title,
  video_url,
  provider,
  thumbnail,
  sort_order,
  status
)
SELECT 
  p.id,
  'Khám phá cơ sở vật chất hiện đại - Học viện Thẩm mỹ Royal',
  'https://www.youtube.com/watch?v=162H3RVsW7s',
  'youtube',
  'https://i.ytimg.com/vi/162H3RVsW7s/hqdefault.jpg',
  1,
  'published'
FROM public.projects p
WHERE p.slug = 'phim-quang-cao-tvc-tham-my-vien-quoc-te'
  AND NOT EXISTS (
    SELECT 1 FROM public.project_videos pv 
    WHERE pv.project_id = p.id AND pv.video_url = 'https://www.youtube.com/watch?v=162H3RVsW7s'
  );

-- 3.2 Video for Vận Hành TikTok & Fanpage Định Kỳ
INSERT INTO public.project_videos (
  project_id,
  title,
  video_url,
  provider,
  thumbnail,
  sort_order,
  status
)
SELECT 
  p.id,
  'Series Short Content - Royal Beauty Academy',
  'https://www.youtube.com/watch?v=yz35Dzyi4iM',
  'youtube',
  'https://i.ytimg.com/vi/yz35Dzyi4iM/hqdefault.jpg',
  1,
  'published'
FROM public.projects p
WHERE p.slug = 'van-hanh-kenh-tiktok-fanpage-dinh-ky'
  AND NOT EXISTS (
    SELECT 1 FROM public.project_videos pv 
    WHERE pv.project_id = p.id AND pv.video_url = 'https://www.youtube.com/watch?v=yz35Dzyi4iM'
  );

-- 4. SEED SITE CONTENT (Exact 26 Records, 1:1 Preservation, Idempotent)

-- HERO (8 records)
INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.tagline', '"Media Production & Operations"', '"Media Production & Operations"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.headline_line_1', '"Sản xuất nội dung"', '"Sản xuất nội dung"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.headline_highlight_1', '"chuyên nghiệp"', '"chuyên nghiệp"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.headline_line_2', '"Vận hành media"', '"Vận hành media"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.headline_highlight_2', '"bài bản"', '"bài bản"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.subheadline', '"Vũ Anh Media đồng hành cùng các doanh nghiệp SME giải quyết triệt để khoảng trống về nhân sự và quy trình sản xuất. Chúng tôi không chỉ cung cấp những thước phim, bộ ảnh chuẩn mực mà còn thiết lập hệ thống vận hành để nội dung của bạn ra đều đặn, đúng định hướng và thực sự trở thành tài sản thương hiệu."', '"Vũ Anh Media đồng hành cùng các doanh nghiệp SME giải quyết triệt để khoảng trống về nhân sự và quy trình sản xuất. Chúng tôi không chỉ cung cấp những thước phim, bộ ảnh chuẩn mực mà còn thiết lập hệ thống vận hành để nội dung của bạn ra đều đặn, đúng định hướng và thực sự trở thành tài sản thương hiệu."', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.cta_primary', '"Yêu cầu tư vấn giải pháp"', '"Yêu cầu tư vấn giải pháp"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('hero', 'hero.cta_secondary', '"Xem năng lực thực chiến"', '"Xem năng lực thực chiến"', 'text')
ON CONFLICT (content_key) DO NOTHING;

-- PARTNERS (2 records)
INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('partners', 'partners.intro', '"Doanh nghiệp không cần những thử nghiệm cảm tính. Họ cần sự đảm bảo. Vũ Anh Media là đơn vị đứng sau các chiến dịch hình ảnh, chuỗi nội dung định kỳ và video quy chuẩn của các thương hiệu dẫn đầu:"', '"Doanh nghiệp không cần những thử nghiệm cảm tính. Họ cần sự đảm bảo. Vũ Anh Media là đơn vị đứng sau các chiến dịch hình ảnh, chuỗi nội dung định kỳ và video quy chuẩn của các thương hiệu dẫn đầu:"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('partners', 'partners.list', '["Học Viện Thẩm Mỹ Royal / Phòng khám Royal", "Nha Khoa Việt Giáp / Nha Khoa Thuỳ Anh", "Adam Eraton", "Masan (Núi Pháo)", "Sinshung Vina CT", "Q-home / Ecocasa", "Crescendo International Music Festival & Competition"]', '["Học Viện Thẩm Mỹ Royal / Phòng khám Royal", "Nha Khoa Việt Giáp / Nha Khoa Thuỳ Anh", "Adam Eraton", "Masan (Núi Pháo)", "Sinshung Vina CT", "Q-home / Ecocasa", "Crescendo International Music Festival & Competition"]', 'array')
ON CONFLICT (content_key) DO NOTHING;

-- ABOUT (5 records)
INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('about', 'about.headline', '"Định hình lại chuẩn mực Media cho doanh nghiệp"', '"Định hình lại chuẩn mực Media cho doanh nghiệp"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('about', 'about.description', '"Hầu hết các doanh nghiệp đi lên từ chuyên môn thường gặp khó khăn trong việc duy trì chất lượng và tần suất xuất hiện hình ảnh đồng đều. Nhận diện thương hiệu bị đứt gãy do quy trình sản xuất manh mún, nhân sự thiếu tính cam kết lâu dài hoặc chi phí vận hành bị đội lên cao qua các khâu trung gian. VŨ ANH MEDIA được sinh ra để tái định nghĩa hoạt động sản xuất hình ảnh bằng 3 trụ cột vận hành cốt lõi:"', '"Hầu hết các doanh nghiệp đi lên từ chuyên môn thường gặp khó khăn trong việc duy trì chất lượng và tần suất xuất hiện hình ảnh đồng đều. Nhận diện thương hiệu bị đứt gãy do quy trình sản xuất manh mún, nhân sự thiếu tính cam kết lâu dài hoặc chi phí vận hành bị đội lên cao qua các khâu trung gian. VŨ ANH MEDIA được sinh ra để tái định nghĩa hoạt động sản xuất hình ảnh bằng 3 trụ cột vận hành cốt lõi:"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('about', 'about.principles', '[{"num":"01","title":"Vận hành chuẩn hóa bằng quy trình hệ thống","desc":"Chúng tôi loại bỏ hoàn toàn sự phụ thuộc vào cảm tính cá nhân hay tính ngẫu hứng nghệ thuật. Mọi chiến dịch hình ảnh của VŨ ANH MEDIA đều được kiểm soát nghiêm ngặt từ khâu Briefing, Shotlist kịch bản đến tối ưu hóa hiện trường. Sự cam kết tuyệt đối về chất lượng và tiến độ được đảm bảo bằng hợp đồng pháp lý cùng quy trình vận hành đội ngũ đồng bộ, chuyên nghiệp."},{"num":"02","title":"Tối ưu hóa & Biến Media thành tài sản tích lũy","desc":"Một thước phim hay tấm ảnh chất lượng cao không phải là khoản chi phí tiêu sản một lần. Chúng tôi đồng hành cùng đối tác xây dựng thư viện tư liệu media thông minh, lưu trữ và bảo mật dữ liệu dự án tối thiểu 12 tháng. Doanh nghiệp dễ dàng khai thác, tái cấu trúc và phân phối nội dung đa kênh trọn đời, giúp nhân bản giá trị sử dụng và tối ưu hóa tối đa chi phí đầu tư dài hạn."},{"num":"03","title":"Tập trung tối đa vào giá trị lõi","desc":"VŨ ANH MEDIA nói KHÔNG với việc nhận triển khai đa dịch vụ dàn trải như Ads hay chạy sự kiện. Chúng tôi dồn 100% tài nguyên, tư duy nghệ thuật và công nghệ hiện đại vào năng lực cốt lõi: Sản xuất hình ảnh và Vận hành Media bài bản. Sự chuyên sâu tuyệt đối này đảm bảo mỗi khung hình bàn giao cho khách hàng đều đạt chuẩn mỹ thuật cao cấp nhất."}]', '[{"num":"01","title":"Vận hành chuẩn hóa bằng quy trình hệ thống","desc":"Chúng tôi loại bỏ hoàn toàn sự phụ thuộc vào cảm tính cá nhân hay tính ngẫu hứng nghệ thuật. Mọi chiến dịch hình ảnh của VŨ ANH MEDIA đều được kiểm soát nghiêm ngặt từ khâu Briefing, Shotlist kịch bản đến tối ưu hóa hiện trường. Sự cam kết tuyệt đối về chất lượng và tiến độ được đảm bảo bằng hợp đồng pháp lý cùng quy trình vận hành đội ngũ đồng bộ, chuyên nghiệp."},{"num":"02","title":"Tối ưu hóa & Biến Media thành tài sản tích lũy","desc":"Một thước phim hay tấm ảnh chất lượng cao không phải là khoản chi phí tiêu sản một lần. Chúng tôi đồng hành cùng đối tác xây dựng thư viện tư liệu media thông minh, lưu trữ và bảo mật dữ liệu dự án tối thiểu 12 tháng. Doanh nghiệp dễ dàng khai thác, tái cấu trúc và phân phối nội dung đa kênh trọn đời, giúp nhân bản giá trị sử dụng và tối ưu hóa tối đa chi phí đầu tư dài hạn."},{"num":"03","title":"Tập trung tối đa vào giá trị lõi","desc":"VŨ ANH MEDIA nói KHÔNG với việc nhận triển khai đa dịch vụ dàn trải như Ads hay chạy sự kiện. Chúng tôi dồn 100% tài nguyên, tư duy nghệ thuật và công nghệ hiện đại vào năng lực cốt lõi: Sản xuất hình ảnh và Vận hành Media bài bản. Sự chuyên sâu tuyệt đối này đảm bảo mỗi khung hình bàn giao cho khách hàng đều đạt chuẩn mỹ thuật cao cấp nhất."}]', 'array')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('about', 'about.founder_title', '"Tầm nhìn thương hiệu từ chi tiết nhỏ"', '"Tầm nhìn thương hiệu từ chi tiết nhỏ"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('about', 'about.founder_quote', '"Sự tinh tế của một tác phẩm media không nằm ở thiết bị đắt tiền, mà nằm ở tư duy thấu hiểu ngôn ngữ thương hiệu và kỷ luật đúc kết trong từng chi tiết nhỏ."', '"Sự tinh tế của một tác phẩm media không nằm ở thiết bị đắt tiền, mà nằm ở tư duy thấu hiểu ngôn ngữ thương hiệu và kỷ luật đúc kết trong từng chi tiết nhỏ."', 'text')
ON CONFLICT (content_key) DO NOTHING;

-- SERVICES (3 records)
INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('services', 'services.headline', '"Hệ sinh thái dịch vụ Media toàn diện cho SME"', '"Hệ sinh thái dịch vụ Media toàn diện cho SME"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('services', 'services.description', '"Mỗi doanh nghiệp cần một sự chuẩn bị và giải pháp khác nhau. Vũ Anh Media thiết kế 3 tầng trục năng lực dịch vụ bài bản để hỗ trợ sự phát triển liên tục của bạn:"', '"Mỗi doanh nghiệp cần một sự chuẩn bị và giải pháp khác nhau. Vũ Anh Media thiết kế 3 tầng trục năng lực dịch vụ bài bản để hỗ trợ sự phát triển liên tục của bạn:"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('services', 'services.list', '[{"tag":"TẦNG 01","title":"Media Production — Sản xuất theo dự án","icon":"film","desc":"Giải quyết bài toán tạo dấu ấn hình ảnh đột phá trong các chiến dịch ngắn hạn hoặc xây dựng nền tảng nhận diện cốt lõi cho thương hiệu.","deliverablesLabel":"Sản phẩm cốt lõi","deliverables":"Video TVC doanh nghiệp • Video Profile thương hiệu/sản phẩm • Video quảng cáo cửa hàng • Video ngắn đa nền tảng (TikTok, Reels, Shorts) • Nhiếp ảnh thương mại chuẩn mực.","commitmentLabel":"Cam kết B2B","commitment":"Quy trình trọn gói từ Brief, kịch bản, storyboard, shot list đến hậu kỳ chuyên sâu (Color Grading 4K, Sound, Motion)."},{"tag":"TẦNG 02","title":"Monthly Media — Giải pháp nội dung định kỳ","icon":"layers","desc":"Giải quyết bài toán đứt gãy mạch nội dung. Duy trì điểm chạm liên tục với khách hàng mục tiêu mà không làm tăng áp lực quản lý cho chủ doanh nghiệp.","deliverablesLabel":"Sản phẩm cốt lõi","deliverables":"Gói nội dung cam kết số lượng theo tháng cho Spa, Nha khoa, F&B, Doanh nghiệp SME (Video ngắn + Bộ ảnh sản phẩm/nhân vật + Tuyến nội dung viết tương ứng).","commitmentLabel":"Cam kết B2B","commitment":"Lịch sản xuất cố định, nhân sự phụ trách riêng biệt, output đầu ra đồng đều về mặt visual direction."},{"tag":"TẦNG 03","title":"Media Operations — Tư vấn & Thiết lập bộ máy nội bộ","icon":"shield","desc":"Dành cho các doanh nghiệp muốn tự chủ năng lực sản xuất nhưng đang thiếu quy trình quản trị, khiến tài nguyên bị thất thoát và nhân sự vận hành cảm tính.","deliverablesLabel":"Sản phẩm cốt lõi","deliverables":"Chuẩn hóa quy trình từ khâu Brief – Sản xuất – Duyệt – Đăng; Phân vai nhân sự media nội bộ; Thiết lập hệ thống lưu trữ và bàn giao tài sản số (file gốc, file dự án) để tái sử dụng dài hạn.","commitmentLabel":"Cam kết B2B","commitment":"Chỉ tập trung chuyên sâu vào vận hành sản xuất media, chuyển giao một hệ thống tự chạy ổn định sau 3 - 6 tháng."}]', '[{"tag":"TẦNG 01","title":"Media Production — Sản xuất theo dự án","icon":"film","desc":"Giải quyết bài toán tạo dấu ấn hình ảnh đột phá trong các chiến dịch ngắn hạn hoặc xây dựng nền tảng nhận diện cốt lõi cho thương hiệu.","deliverablesLabel":"Sản phẩm cốt lõi","deliverables":"Video TVC doanh nghiệp • Video Profile thương hiệu/sản phẩm • Video quảng cáo cửa hàng • Video ngắn đa nền tảng (TikTok, Reels, Shorts) • Nhiếp ảnh thương mại chuẩn mực.","commitmentLabel":"Cam kết B2B","commitment":"Quy trình trọn gói từ Brief, kịch bản, storyboard, shot list đến hậu kỳ chuyên sâu (Color Grading 4K, Sound, Motion)."},{"tag":"TẦNG 02","title":"Monthly Media — Giải pháp nội dung định kỳ","icon":"layers","desc":"Giải quyết bài toán đứt gãy mạch nội dung. Duy trì điểm chạm liên tục với khách hàng mục tiêu mà không làm tăng áp lực quản lý cho chủ doanh nghiệp.","deliverablesLabel":"Sản phẩm cốt lõi","deliverables":"Gói nội dung cam kết số lượng theo tháng cho Spa, Nha khoa, F&B, Doanh nghiệp SME (Video ngắn + Bộ ảnh sản phẩm/nhân vật + Tuyến nội dung viết tương ứng).","commitmentLabel":"Cam kết B2B","commitment":"Lịch sản xuất cố định, nhân sự phụ trách riêng biệt, output đầu ra đồng đều về mặt visual direction."},{"tag":"TẦNG 03","title":"Media Operations — Tư vấn & Thiết lập bộ máy nội bộ","icon":"shield","desc":"Dành cho các doanh nghiệp muốn tự chủ năng lực sản xuất nhưng đang thiếu quy trình quản trị, khiến tài nguyên bị thất thoát và nhân sự vận hành cảm tính.","deliverablesLabel":"Sản phẩm cốt lõi","deliverables":"Chuẩn hóa quy trình từ khâu Brief – Sản xuất – Duyệt – Đăng; Phân vai nhân sự media nội bộ; Thiết lập hệ thống lưu trữ và bàn giao tài sản số (file gốc, file dự án) để tái sử dụng dài hạn.","commitmentLabel":"Cam kết B2B","commitment":"Chỉ tập trung chuyên sâu vào vận hành sản xuất media, chuyển giao một hệ thống tự chạy ổn định sau 3 - 6 tháng."}]', 'array')
ON CONFLICT (content_key) DO NOTHING;

-- PROCESS (3 records)
INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('process', 'process.headline', '"Quy trình làm việc bài bản"', '"Quy trình làm việc bài bản"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('process', 'process.description', '"Doanh nghiệp rất sợ sự mập mờ và trễ hẹn. Một quy trình rõ ràng thể hiện Vũ Anh Media có năng lực quản trị, điều hành thực chiến và chuyên nghiệp nhất."', '"Doanh nghiệp rất sợ sự mập mờ và trễ hẹn. Một quy trình rõ ràng thể hiện Vũ Anh Media có năng lực quản trị, điều hành thực chiến và chuyên nghiệp nhất."', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('process', 'process.steps', '[{"step":"01","title":"Nghiên cứu & Định vị","desc":"Khảo sát thực tế bối cảnh thương hiệu, bóc tách \"nỗi đau\" truyền thông hiện tại và xác lập tệp khách hàng mục tiêu."},{"step":"02","title":"Kịch bản & Storyboard","desc":"Lên ý tưởng chi tiết, xây dựng lời thoại đàm thoại tự nhiên (tránh sáo rỗng, công nghiệp), duyệt kỹ lưỡng trước khi bấm máy."},{"step":"03","title":"Sản xuất & Hậu kỳ","desc":"Bấm máy trực tiếp với thiết bị chuyên dụng và đội ngũ sản xuất thực chiến. Xử lý màu sắc (Color Grading) và âm thanh chuẩn chỉ."},{"step":"04","title":"Bàn giao & Tối ưu","desc":"Bàn giao sản phẩm đúng cam kết kỳ hạn. Hỗ trợ căn chỉnh định dạng để đạt hiệu quả hiển thị và giữ chân tốt nhất trên đa nền tảng."}]', '[{"step":"01","title":"Nghiên cứu & Định vị","desc":"Khảo sát thực tế bối cảnh thương hiệu, bóc tách \"nỗi đau\" truyền thông hiện tại và xác lập tệp khách hàng mục tiêu."},{"step":"02","title":"Kịch bản & Storyboard","desc":"Lên ý tưởng chi tiết, xây dựng lời thoại đàm thoại tự nhiên (tránh sáo rỗng, công nghiệp), duyệt kỹ lưỡng trước khi bấm máy."},{"step":"03","title":"Sản xuất & Hậu kỳ","desc":"Bấm máy trực tiếp với thiết bị chuyên dụng và đội ngũ sản xuất thực chiến. Xử lý màu sắc (Color Grading) và âm thanh chuẩn chỉ."},{"step":"04","title":"Bàn giao & Tối ưu","desc":"Bàn giao sản phẩm đúng cam kết kỳ hạn. Hỗ trợ căn chỉnh định dạng để đạt hiệu quả hiển thị và giữ chân tốt nhất trên đa nền tảng."}]', 'array')
ON CONFLICT (content_key) DO NOTHING;

-- CONTACT (5 records)
INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('contact', 'contact.headline', '"Chuẩn hóa tối ưu năng lực Media của bạn ngay hôm nay"', '"Chuẩn hóa tối ưu năng lực Media của bạn ngay hôm nay"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('contact', 'contact.description', '"Đừng để ngân sách marketing bị lãng phí chỉ vì những hình ảnh lệch chuẩn hoặc một hệ thống nội dung rời rạc. Hãy chia sẻ với Vũ Anh Media về bài toán hiện tại của doanh nghiệp bạn."', '"Đừng để ngân sách marketing bị lãng phí chỉ vì những hình ảnh lệch chuẩn hoặc một hệ thống nội dung rời rạc. Hãy chia sẻ với Vũ Anh Media về bài toán hiện tại của doanh nghiệp bạn."', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('contact', 'contact.email', '"vuanhmediatn@gmail.com"', '"vuanhmediatn@gmail.com"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('contact', 'contact.phone', '"0974003662"', '"0974003662"', 'text')
ON CONFLICT (content_key) DO NOTHING;

INSERT INTO public.site_content (section, content_key, draft_value, published_value, content_type)
VALUES ('contact', 'contact.region', '"Thành phố Hồ Chí Minh | Hà Nội"', '"Thành phố Hồ Chí Minh | Hà Nội"', 'text')
ON CONFLICT (content_key) DO NOTHING;

COMMIT;
