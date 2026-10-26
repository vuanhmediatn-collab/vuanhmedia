/**
 * VAMOPS COMMAND CENTER — DỮ LIỆU ĐỘI NGŨ AI CHUYÊN GIA & PHÂN KHU 3D
 * Vũ Anh Media Operations Ecosystem
 */

const VAMOPS_DATA = {
  station: {
    name: "VAMOPS MARS COMMAND BASE ALPHA",
    code: "ARES-VAM-01 · SAO HOẢ",
    sector: "Trạm Chỉ Huy Viễn Chinh Sao Hoả (Thung Lũng Valles Marineris)",
    status: "ONLINE",
    temperature: "-62°C (Khí quyển ngoài) · 22.5°C (Nội thất vòm)",
    environment: "Khí quyển Trạm: 1.01 atm · O2: 99.4% · Trọng lực: 0.38g",
    version: "3.5 Mars Expedition High-End",
    stats: {
      totalAgents: 12,
      activeNow: 12,
      tasksRunning: 0,
      approvedVault: 7,
      sessionRuns: 0
    }
  },

  zones: [
    {
      id: "zone-penthouse",
      name: "Phòng Chỉ Huy & Phê Duyệt",
      subtitle: "Executive Penthouse",
      color: "#00f0ff",
      coords: { x: 0, z: -1.5 },
      icon: "🏛️",
      description: "Nơi Tổng Điều Phối tiếp nhận chiến dịch và Founder (Vũ Anh) trực tiếp ký duyệt ấn phẩm cuối cùng.",
      assignedAgents: ["agent-cmo", "agent-seo"]
    },
    {
      id: "zone-intelligence",
      name: "Viện Nghiên Cứu Insight & Algorithm",
      subtitle: "Strategic Intelligence Lab",
      color: "#6366f1",
      coords: { x: -6.5, z: -4 },
      icon: "🔬",
      description: "Quét xu hướng thời gian thực trên TikTok/Reels/FB, mổ xẻ tâm lý học hành vi B2B và góc nhìn phản biện.",
      assignedAgents: ["agent-algo", "agent-psycho", "agent-counter"]
    },
    {
      id: "zone-creative",
      name: "Xưởng Kịch Bản Điện Ảnh & Hooks",
      subtitle: "Cinematic Creative Guild",
      color: "#ec4899",
      coords: { x: -6.5, z: 3.5 },
      icon: "✍️",
      description: "Chế tác Hook 3s nghẹt thở, viết kịch bản điện ảnh theo nhịp Beat Sheet và phóng tác đa kênh.",
      assignedAgents: ["agent-hook", "agent-story", "agent-copy"]
    },
    {
      id: "zone-critic",
      name: "Tòa Án Phê Bình & Thẩm Định",
      subtitle: "The Ruthless Quality Board",
      color: "#f59e0b",
      coords: { x: 6.5, z: -4 },
      icon: "⚖️",
      description: "Hội đồng khảo sát độ giữ chân (Retention) và chấm điểm Rubric 5 tiêu chí nghiêm ngặt. Dưới 85 điểm phải viết lại.",
      assignedAgents: ["agent-critic"]
    },
    {
      id: "zone-production",
      name: "Siêu Xưởng Dựng & Render Pipeline",
      subtitle: "Automated Production Foundry",
      color: "#10b981",
      coords: { x: 6.5, z: 3.5 },
      icon: "🎬",
      description: "Sinh prompt hình ảnh điện ảnh 8K, phối âm thanh SFX/BGM và chạy bộ lệnh render_pipeline.swift tự động ghép video.",
      assignedAgents: ["agent-visual", "agent-sound", "agent-renderer"]
    },
    {
      id: "zone-satellite",
      name: "Trạm Vệ Tinh Phân Phối Đa Nền Tảng",
      subtitle: "Orbital Broadcast Array",
      color: "#38bdf8",
      coords: { x: 0, z: 6.5 },
      icon: "📡",
      description: "Tự động phân phối giờ vàng, tối ưu thẻ SEO, đồng bộ đa kênh TikTok, Threads, Facebook, YouTube.",
      assignedAgents: ["agent-seo"]
    }
  ],

  agents: [
    {
      id: "agent-cmo",
      name: "VAM-Commander",
      title: "Tổng Chỉ Huy Điều Phối Chiến Dịch",
      dept: "executive",
      deptName: "Phòng Chỉ Huy",
      deptColor: "#00f0ff",
      avatar: "👑",
      modelEngine: "Claude 3.7 Sonnet (Extended Reasoning)",
      framework: "Strategic OKRs & Goal Decomposition",
      status: "Sẵn sàng",
      currentAction: "Giám sát toàn bộ 5 phân khu trụ sở",
      specialty: "Phân rã mục tiêu kinh doanh thành bài toán truyền thông, điều phối 11 agents chuyên môn.",
      rubricWeight: "Điều phối & Tiến độ"
    },
    {
      id: "agent-algo",
      name: "Algo-Radar",
      title: "Chuyên Gia Thuật Toán & Xu Hướng",
      dept: "intelligence",
      deptName: "Khu Nghiên Cứu",
      deptColor: "#6366f1",
      avatar: "📡",
      modelEngine: "Gemini 2.0 Flash (Realtime Web Grounding)",
      framework: "TikTok/Meta Recommendation Velocity Index",
      status: "Sẵn sàng",
      currentAction: "Quét dữ liệu viral format 24h qua",
      specialty: "Bắt sóng xu hướng, tính toán độ bão hòa nội dung và định dạng tối ưu thời lượng.",
      rubricWeight: "Phù hợp thuật toán"
    },
    {
      id: "agent-psycho",
      name: "Dr. Psycho",
      title: "Chuyên Gia Thấu Cảm Tâm Lý Doanh Chủ",
      dept: "intelligence",
      deptName: "Khu Nghiên Cứu",
      deptColor: "#6366f1",
      avatar: "🧠",
      modelEngine: "Claude 3.7 Sonnet (Deep Empathy)",
      framework: "Eugene Schwartz Mass Desire & Hidden Pains",
      status: "Sẵn sàng",
      currentAction: "Bóc tách nỗi sợ ngầm của Doanh chủ B2B",
      specialty: "Đào sâu những góc khuất, nỗi trăn trở nội tại mà khách hàng mục tiêu chưa từng thổ lộ.",
      rubricWeight: "Độ sâu Insight (25đ)"
    },
    {
      id: "agent-counter",
      name: "The Disruptor",
      title: "Chiến Lược Gia Phá Băng & Góc Nhìn Ngược",
      dept: "intelligence",
      deptName: "Khu Nghiên Cứu",
      deptColor: "#6366f1",
      avatar: "⚡",
      modelEngine: "Gemini 2.0 Thinking (Contrarian Reasoning)",
      framework: "Contrarian Truths & Paradigm Shifts",
      status: "Sẵn sàng",
      currentAction: "Lập luận phản biện góc nhìn truyền thông cũ",
      specialty: "Tạo các luận điểm đối lập với số đông, gây sốc lành mạnh và thúc đẩy tư duy mới.",
      rubricWeight: "Độ độc đáo ý tưởng"
    },
    {
      id: "agent-hook",
      name: "Hook Master Pro",
      title: "Kỹ Sư Thiết Kế 3 Giây Đầu Tiên",
      dept: "creative",
      deptName: "Xưởng Sáng Tạo",
      deptColor: "#ec4899",
      avatar: "🎯",
      modelEngine: "Claude 3.7 Sonnet (Creativity Extreme)",
      framework: "Dan Koe Hook Matrix & Pattern Interrupts",
      status: "Sẵn sàng",
      currentAction: "Sẵn sàng sinh 5 biến thể Hook giữ chân 80%",
      specialty: "Gài bẫy thị giác và thính giác, dập tắt quán tính lướt của ngón tay trong 3 giây.",
      rubricWeight: "Độ giật của Hook (25đ)"
    },
    {
      id: "agent-story",
      name: "Cinematic Bard",
      title: "Đạo Diễn Kịch Bản Điện Ảnh & Beat Sheet",
      dept: "creative",
      deptName: "Xưởng Sáng Tạo",
      deptColor: "#ec4899",
      avatar: "🎞️",
      modelEngine: "Claude 3.7 Sonnet (Story Architecture)",
      framework: "3-Act Cinematic Beat Sheet (Hook - Shift - Proof - Climax)",
      status: "Sẵn sàng",
      currentAction: "Chuẩn bị phân cảnh 26s - 60s chuẩn điện ảnh",
      specialty: "Cấu trúc từng nhịp hình ảnh, câu thoại kinetic và lực kéo kịch tính giữa các phân cảnh.",
      rubricWeight: "Nhịp điệu Pacing & Retention (20đ)"
    },
    {
      id: "agent-copy",
      name: "VAM Scribe",
      title: "Cây Bút Đa Kênh Chuẩn Tone VAMOPS",
      dept: "creative",
      deptName: "Xưởng Sáng Tạo",
      deptColor: "#ec4899",
      avatar: "🖋️",
      modelEngine: "GPT-4o (Tone Harmonizer)",
      framework: "Direct Response & Brand Authority Matrix",
      status: "Sẵn sàng",
      currentAction: "Sẵn sàng phóng tác Threads & Facebook",
      specialty: "Viết bài dài phân tích chuyên sâu Facebook và chuỗi Threads sắc bén, dứt khoát.",
      rubricWeight: "Chất giọng thương hiệu (15đ)"
    },
    {
      id: "agent-critic",
      name: "The Ruthless Critic",
      title: "Trưởng Ban Thẩm Định Không Khoan Nhượng",
      dept: "critic",
      deptName: "Tòa Án Phê Bình",
      deptColor: "#f59e0b",
      avatar: "⚖️",
      modelEngine: "Claude 3.7 Sonnet (Rubric Evaluator & Filter)",
      framework: "100-Point VAMOPS Quality Rubric",
      status: "Sẵn sàng",
      currentAction: "Thiết lập bàn cân kiểm duyệt độ retention",
      specialty: "Phản biện tàn nhẫn, bóc trần những câu từ sáo rỗng của AI thông thường, yêu cầu viết lại nếu < 85đ.",
      rubricWeight: "Hội Đồng Khảo Thí Tối Cao"
    },
    {
      id: "agent-visual",
      name: "Visual Artificer",
      title: "Kỹ Sư Prompt Hình Ảnh & Điện Ảnh 8K",
      dept: "production",
      deptName: "Siêu Xưởng Dựng",
      deptColor: "#10b981",
      avatar: "🎨",
      modelEngine: "GPT-4o Vision Prompt Specialist",
      framework: "Cinematography Optics (Anamorphic, Lighting, Motion)",
      status: "Sẵn sàng",
      currentAction: "Chuẩn bị bộ prompt Midjourney / Kling / Runway",
      specialty: "Tạo prompt chi tiết góc máy, ánh sáng amber & teal, chuyển động ống kính chuẩn 9:16.",
      rubricWeight: "Tính khả thi Media (15đ)"
    },
    {
      id: "agent-sound",
      name: "Acoustic Architect",
      title: "Giám Đốc Thiết Kế Âm Thanh & SFX",
      dept: "production",
      deptName: "Siêu Xưởng Dựng",
      deptColor: "#10b981",
      avatar: "🎧",
      modelEngine: "Gemini 2.0 Flash (Audio Pacing)",
      framework: "Psychoacoustic Impact & Voice Cadence",
      status: "Sẵn sàng",
      currentAction: "Đồng bộ SFX: Sub-bass, Whoosh, Mechanical typing",
      specialty: "Lựa chọn voice ElevenLabs uy lực và thiết kế layer âm thanh đập trúng nhịp cảm xúc.",
      rubricWeight: "Hiệu ứng âm thanh"
    },
    {
      id: "agent-renderer",
      name: "Pipeline Engine",
      title: "Cầu Nối Kỹ Thuật Render Pipeline Tự Động",
      dept: "production",
      deptName: "Siêu Xưởng Dựng",
      deptColor: "#10b981",
      avatar: "⚙️",
      modelEngine: "Swift CLI & Motion Engine Automation",
      framework: "Native AVFoundation + Kinetic Typography Engine",
      status: "Sẵn sàng",
      currentAction: "Sẵn sàng build video 9:16 qua render_pipeline.swift",
      specialty: "Chuyển kịch bản thành payload thực thi, gọi script Swift ghép clip và xuất file video MP4.",
      rubricWeight: "Thực thi Render"
    },
    {
      id: "agent-seo",
      name: "Orbit Broadcaster",
      title: "Điều Phối Phân Phối & Giờ Vàng",
      dept: "distribution",
      deptName: "Trạm Vệ Tinh",
      deptColor: "#38bdf8",
      avatar: "🚀",
      modelEngine: "Gemini 2.0 Flash (Social Graph)",
      framework: "Omni-Channel Scheduling & Semantic SEO",
      status: "Sẵn sàng",
      currentAction: "Sẵn sàng lên lịch TikTok, Meta, Threads",
      specialty: "Xếp lịch phát hành chuẩn khung giờ tương tác cao nhất và tối ưu thẻ bắt link SEO.",
      rubricWeight: "Vận hành phát hành"
    }
  ],

  presetCampaigns: [
    {
      id: "camp-01",
      topic: "Xây Dựng Cỗ Máy Media Tự Chủ Cho Doanh Nghiệp B2B",
      targetAudience: "Chủ doanh nghiệp, Giám đốc Marketing, Nhà sáng lập",
      platforms: ["TikTok", "Facebook", "Threads"],
      hookType: "Pattern Interrupt + Tuyên ngôn giá trị",
      coreAngle: "Đừng chỉ làm thuê từng chiến dịch media. Hãy chuyển hóa toàn bộ nội dung thành tài sản sở hữu tự động vận hành 24/7."
    },
    {
      id: "camp-02",
      topic: "Vì Sao Agency Truyền Thống Đang Hụt Hơi Trước AI Media Ops?",
      targetAudience: "Marketer, Agency Owners, Doanh nghiệp SMEs",
      platforms: ["TikTok", "Facebook", "Threads"],
      hookType: "Contrarian Shock + Số liệu đối lập",
      coreAngle: "Agency bán nhân lực theo giờ đang bị thay thế bởi hệ thống Media Ops sở hữu quy trình và tốc độ x10 nhờ AI chuyên gia."
    },
    {
      id: "camp-03",
      topic: "Bí Mật Giữ Chân 80% Người Xem Video Trong 3 Giây Đầu Tiên",
      targetAudience: "Content Creators, Doanh nhân xây thương hiệu cá nhân",
      platforms: ["TikTok", "Reels", "Shorts"],
      hookType: "Visual Disrupt + Bóc trần sai lầm",
      coreAngle: "99% kịch bản mở đầu bằng 'Xin chào các bạn' là tự sát. Công thức 3 giây vàng của Vũ Anh Media bẻ gãy quán tính lướt ngón tay."
    }
  ],

  sampleExecutionResults: {
    "camp-01": {
      topic: "Xây Dựng Cỗ Máy Media Tự Chủ Cho Doanh Nghiệp B2B",
      strategyBrief: {
        target: "Doanh chủ B2B đau đầu vì chi phí agency tăng cao mà nội dung không chạm tệp khách hàng cao cấp.",
        mainMessage: "Chấm dứt phụ thuộc dịch vụ ngoài. Sở hữu ngay Cỗ Máy Media Tự Chủ vận hành tinh gọn 24/7.",
        emotionalDriver: "Quyền kiểm soát, Đẳng cấp thương hiệu, Tiết kiệm 70% chi phí dài hạn."
      },
      hooks: [
        {
          id: "hook-1",
          type: "Curiosity & High-Stakes",
          text: "Chi phí Media tăng vọt, thuê ngoài chắp vá thiếu bản sắc? Đừng chỉ làm thuê từng chiến dịch media!",
          retentionScore: 96
        },
        {
          id: "hook-2",
          type: "Contrarian Punch",
          text: "Doanh nghiệp bạn đang chi hàng trăm triệu cho Media mỗi tháng, nhưng thực tế bạn chẳng sở hữu bất kỳ tài sản nào!",
          retentionScore: 93
        },
        {
          id: "hook-3",
          type: "Shock Reality",
          text: "Nếu ngày mai agency của bạn dừng hợp tác, cỗ máy truyền thông của bạn có lập tức tê liệt?",
          retentionScore: 91
        }
      ],
      beatSheet: [
        {
          beat: "01",
          time: "00:00 - 00:05",
          segment: "The Hook (Nỗi đau Media)",
          kineticText: "Chi phí Media tăng vọt? Thuê ngoài chắp vá, thiếu bản sắc?",
          sfx: "Tích tắc đồng hồ gấp gáp + Tiếng Sub-bass rền (Low drone)",
          prompt: "Cinematic 9:16, low-angle slow zoom in on a determined Asian male CEO standing in a dark modern glass office overlooking a nighttime city, blue and red holographic analytics reflecting on glass, moody lighting, 8K."
        },
        {
          beat: "02",
          time: "00:05 - 00:11",
          segment: "The Solution (Khai mở Media Ops)",
          kineticText: "Đừng chỉ làm thuê từng chiến dịch. Hãy xây dựng CỖ MÁY MEDIA TỰ CHỦ.",
          sfx: "Tiếng Whoosh chuyển cảnh mạnh + Bass Drop dứt khoát",
          prompt: "Cinematic 9:16, dynamic whip pan into a state-of-the-art media studio, robotic camera arm filming smoothly, amber and teal neon lighting, 4K film aesthetic."
        },
        {
          beat: "03",
          time: "00:11 - 00:17",
          segment: "The Tech (Quy trình & AI Ops)",
          kineticText: "Chuẩn hóa quy trình. Tăng tốc đột phá bằng AI. Vận hành tinh gọn 24/7.",
          sfx: "Tiếng gõ phím cơ đanh thép (Mechanical click) + Riser điện tử tăng dần",
          prompt: "Cinematic 9:16, macro close-up of hands typing commands on RGB mechanical keyboard, multi-monitor setup displaying automated AI video pipelines, 60fps cinematic blur."
        },
        {
          beat: "04",
          time: "00:17 - 00:22",
          segment: "The Proof (Bứt phá năng lực)",
          kineticText: "Chủ động sáng tạo. Làm chủ truyền thông số.",
          sfx: "Climax beat bùng nổ (Epic drop) + Tiếng vang sáng glockenspiel",
          prompt: "Cinematic 9:16, charismatic Asian creative director smiling confidently, standing in modern design studio with cyan rim light, floating holographic video cards, 8K."
        },
        {
          beat: "05",
          time: "00:22 - 00:26",
          segment: "The Outro (CTA & Nhận diện)",
          kineticText: "VŨ ANH MEDIA OPS — Xây Dựng Năng Lực Media Tự Chủ (vuanhmedia.com)",
          sfx: "Cinematic Sub-impact cuối cùng + Reverb tắt dần",
          prompt: "Cinematic 9:16, dark reflective metallic studio backdrop, 3D metallic typography of 'VU ANH MEDIA OPS' illuminated by pulsing neon cyan rays, 8K render."
        }
      ],
      rubricScores: {
        total: 94,
        status: "ĐẠT CHUẨN XUẤT SẮC (APPROVED)",
        breakdown: [
          { name: "Độ giật của Hook (Max 25)", score: 24, note: "Đánh trúng 2 nỗi sợ lớn: Chi phí tăng và mất bản sắc thương hiệu." },
          { name: "Độ sâu Insight (Max 25)", score: 24, note: "Phân biệt rạch ròi giữa 'mua dịch vụ rời rạc' và 'xây tài sản media tự chủ'." },
          { name: "Nhịp điệu Pacing & Retention (Max 20)", score: 19, note: "Beat sheet 5 nhịp chuẩn điện ảnh, không có khoảng chết ngữ nghĩa." },
          { name: "Tính khả thi Media & Prompts (Max 15)", score: 14, note: "Prompt tối ưu chính xác cho Kling/Runway Gen-3, khớp hoàn toàn với pipeline Swift." },
          { name: "Chất giọng VAMOPS (Max 15)", score: 13, note: "Đĩnh đạc, sang trọng, mang phong thái chuyên gia công nghệ cao." }
        ],
        criticFeedback: "Kịch bản đạt độ cô đọng xuất sắc. Từ ngữ không vướng sáo rỗng. Đã sẵn sàng chuyển sang bộ phận Render tự động."
      },
      distribution: {
        tiktok: {
          time: "Thứ Năm · 20:00 (Giờ vàng giải trí & học tập)",
          caption: "Chi phí Media tăng vọt mà thuê ngoài cứ chắp vá? Đã đến lúc doanh nghiệp bạn cần một Cỗ Máy Media Tự Chủ! Nhắn VAMOPS để nhận cẩm nang chuyển đổi 24/7. #vuanhmedia #mediaops #aiagent #tudonghoa",
          soundtrack: "Cinematic Cyber Hype — VAM Sound ID 04"
        },
        facebook: {
          time: "Thứ Năm · 11:30 (Giờ nghỉ trưa Doanh chủ)",
          title: "[CASE STUDY] TẠI SAO BẠN NÊN NGỪNG THUÊ DỊCH VỤ MEDIA THEO CHIẾN DỊCH?",
          snippet: "Đa số doanh nghiệp bỏ ra 300 - 500 triệu/năm thuê agency nhưng khi dừng hợp đồng thì trang cá nhân và kênh thương hiệu lại trở về con số 0..."
        },
        threads: {
          time: "Thứ Sáu · 08:15 (Giờ cafe sáng)",
          threadSnippet: "1/5: 3 dấu hiệu cho thấy công ty bạn đang bị agency media 'dắt mũi' và làm sao để lấy lại quyền tự chủ chỉ sau 30 ngày..."
        }
      }
    },

    "camp-02": {
      topic: "Vì Sao Agency Truyền Thống Đang Hụt Hơi Trước AI Media Ops?",
      strategyBrief: {
        target: "Các nhà quản lý marketing & doanh chủ SMEs đang lãng phí hàng tuần chờ duyệt bài từ agency cũ.",
        mainMessage: "Agency tính phí theo giờ và con người thủ công không thể cạnh tranh về tốc độ và chiều sâu dữ liệu với hệ thống AI Media Ops.",
        emotionalDriver: "Sự thức tỉnh trước làn sóng công nghệ mới, khao khát tối ưu hóa hiệu suất."
      },
      hooks: [
        {
          id: "hook-1",
          type: "Contrarian Shock",
          text: "Tại sao thuê agency quảng cáo truyền thống càng lâu, doanh nghiệp bạn càng chậm chạp và kiệt quệ?",
          retentionScore: 97
        },
        {
          id: "hook-2",
          type: "Data Punch",
          text: "Một video mất 7 ngày để agency sản xuất. Hệ thống Media Ops của VAM chỉ mất 7 phút!",
          retentionScore: 94
        },
        {
          id: "hook-3",
          type: "Secret Flaw",
          text: "Bí mật mà các agency không bao giờ muốn bạn biết: Họ đang dùng chính AI cơ bản để làm bài cho bạn!",
          retentionScore: 92
        }
      ],
      beatSheet: [
        {
          beat: "01",
          time: "00:00 - 00:05",
          segment: "The Hook (Sự thức tỉnh)",
          kineticText: "Chờ 7 ngày cho 1 kịch bản video? Thời của Agency tính phí theo giờ ĐÃ HẾT.",
          sfx: "Tiếng đồng hồ cát vỡ vụn + Sub-bass drop cực sâu",
          prompt: "Cinematic 9:16, macro slow-motion shot of an antique brass hourglass shattering on a dark slate surface, glass particles glowing with blue fiber optic light, 8K."
        },
        {
          beat: "02",
          time: "00:05 - 00:11",
          segment: "The Shift (Mô hình mới)",
          kineticText: "Tốc độ x10. Chiều sâu dữ liệu x100. Đó là AI MEDIA OPS.",
          sfx: "Âm thanh máy bay phản lực bứt tốc (Jet pass by) + Tiếng kích hoạt mạch điện",
          prompt: "Cinematic 9:16, dynamic drone dive into an ultra-modern holographic studio, server racks glowing amber and cyan, automated robotic cameras gliding, 4K film aesthetic."
        },
        {
          beat: "03",
          time: "00:11 - 00:17",
          segment: "The Tech (Đội ngũ AI Chuyên gia)",
          kineticText: "12 AI Chuyên Gia phân tích thị trường, chấm điểm Rubric tự động.",
          sfx: "Tiếng quét laser radar vi mô + Hợp âm synthesizer dứt khoát",
          prompt: "Cinematic 9:16, futuristic multi-screen command console with algorithmic radar rings and AI analytics graphs moving rapidly, sleek glass interface, 60fps."
        },
        {
          beat: "04",
          time: "00:17 - 00:22",
          segment: "The Proof (Hiệu năng vượt trội)",
          kineticText: "Sản xuất liên tục 24/7. Không phụ thuộc cảm xúc nhân sự.",
          sfx: "Tiếng tim đập dồn dập chuyển thành nhịp beat EDM công nghệ mạnh mẽ",
          prompt: "Cinematic 9:16, confident female entrepreneur in a high-tech studio looking directly at camera, glowing data stream cards floating around her, anamorphic lighting, 8K."
        },
        {
          beat: "05",
          time: "00:22 - 00:26",
          segment: "The Outro (Khai phóng tương lai)",
          kineticText: "VŨ ANH MEDIA OPS — Nâng Tầm Năng Lực Media Tự Chủ (vuanhmedia.com)",
          sfx: "Sub-impact cuối cùng + Reverb sâu lắng",
          prompt: "Cinematic 9:16, sleek dark obsidian wall with illuminated metallic logo 'VU ANH MEDIA OPS', neon electric cyan rim, 8K render."
        }
      ],
      rubricScores: {
        total: 96,
        status: "ĐẠT CHUẨN XUẤT SẮC (APPROVED)",
        breakdown: [
          { name: "Độ giật của Hook (Max 25)", score: 25, note: "Đánh trúng sự ức chế chờ đợi kéo dài nhiều ngày của doanh nghiệp." },
          { name: "Độ sâu Insight (Max 25)", score: 24, note: "Phân tích rõ điểm yếu mô hình agency tính phí theo giờ so với Media Ops." },
          { name: "Nhịp điệu Pacing & Retention (Max 20)", score: 19, note: "Tiết tấu dồn dập, so sánh đối lập trực diện cực kỳ cuốn hút." },
          { name: "Tính khả thi Media & Prompts (Max 15)", score: 14, note: "Prompt tối ưu với hiệu ứng vỡ đồng hồ cát và studio số hoá cao cấp." },
          { name: "Chất giọng VAMOPS (Max 15)", score: 14, note: "Táo bạo, dứt khoát, mang tư duy chuyển đổi công nghệ tiên phong." }
        ],
        criticFeedback: "Góc nhìn phản biện cực kỳ sắc sảo. Tỷ lệ giữ chân người xem dự kiến đạt trên 85%."
      },
      distribution: {
        tiktok: {
          time: "Thứ Tư · 19:30",
          caption: "Chờ 7 ngày cho 1 video trong khi đối thủ ra 10 video mỗi ngày nhờ AI Ops? Đã đến lúc doanh nghiệp bạn cần thay đổi! #vuanhmedia #aiops #marketingb2b #kinhdoanh",
          soundtrack: "Cyberpunk Industrial Pulse — VAM Track 02"
        },
        facebook: {
          time: "Thứ Tư · 08:30 (Đầu giờ sáng làm việc)",
          title: "[BÓC TRẦN] VÌ SAO MÔ HÌNH AGENCY TRUYỀN THỐNG ĐANG BỊ THAY THẾ BỞI AI MEDIA OPS?",
          snippet: "Không phải agency không cố gắng, mà là mô hình bán giờ lao động chân tay không thể đọ nổi tốc độ của hệ thống đa tác vụ AI chuẩn chuyên gia..."
        },
        threads: {
          time: "Thứ Tư · 12:00",
          threadSnippet: "1/4: Nếu công ty bạn vẫn đang duyệt bài qua 3 tầng agency mất 1 tuần, bạn đang đốt tiền cho sự chậm chạp của họ..."
        }
      }
    },

    "camp-03": {
      topic: "Bí Mật Giữ Chân 80% Người Xem Video Trong 3 Giây Đầu Tiên",
      strategyBrief: {
        target: "Content creators, doanh nhân xây kênh thương hiệu cá nhân làm video mãi không lên view.",
        mainMessage: "99% kịch bản mở đầu sai cách. Công thức 3 giây vàng của Vũ Anh Media bẻ gãy quán tính lướt ngón tay.",
        emotionalDriver: "Khát khao triệu view, thoát khỏi bế tắc video làm ra không ai xem."
      },
      hooks: [
        {
          id: "hook-1",
          type: "Pattern Interrupt",
          text: "Dừng ngay việc mở đầu video bằng câu 'Xin chào các bạn'! Bạn vừa ném 80% người xem vào sọt rác!",
          retentionScore: 98
        },
        {
          id: "hook-2",
          type: "High Stakes",
          text: "Nếu trong 3 giây đầu bạn không làm được điều này, thuật toán TikTok sẽ vĩnh viễn chôn vùi video của bạn!",
          retentionScore: 95
        },
        {
          id: "hook-3",
          type: "Visual Shock",
          text: "Ngón tay người dùng lướt qua màn hình chỉ mất 0.4 giây. Đây là cách VAMOPS bẫy họ ở lại!",
          retentionScore: 93
        }
      ],
      beatSheet: [
        {
          beat: "01",
          time: "00:00 - 00:05",
          segment: "The Hook (Tự sát 3 giây)",
          kineticText: "Nói 'Xin chào' ở đầu video? Bạn vừa tự sát truyền thông!",
          sfx: "Tiếng chuông báo động đỏ ngắn + Tiếng ngón tay gạt màn hình rào rạt",
          prompt: "Cinematic 9:16, extreme macro close-up of a human thumb swiping fast on glowing smartphone screen in dark room, glitch neon effect on screen, 8K."
        },
        {
          beat: "02",
          time: "00:05 - 00:11",
          segment: "The Shift (Công thức 3 tầng)",
          kineticText: "Thị giác bất thường. Âm thanh ngắt nhịp. Nỗi sợ vô hình.",
          sfx: "Tiếng nhịp tim đập thình thịch + Cắt âm thanh đột ngột (Silence Drop)",
          prompt: "Cinematic 9:16, rapid split-screen montage showing high-contrast cinema visuals: glowing eye reflection, audio waveform spike, and dramatic facial reaction, 60fps."
        },
        {
          beat: "03",
          time: "00:11 - 00:17",
          segment: "The Tech (Hệ thống Hook Master)",
          kineticText: "Hook Master Pro tại VAMOPS thiết kế 5 biến thể cho từng kịch bản.",
          sfx: "Tiếng click cơ đanh thép + Tiếng laser vẽ chữ kinetic typography",
          prompt: "Cinematic 9:16, futuristic digital canvas with kinetic neon 3D typography assembling itself in real-time, glowing blue and amber sparks, 8K."
        },
        {
          beat: "04",
          time: "00:17 - 00:22",
          segment: "The Proof (Tỷ lệ xem vượt trội)",
          kineticText: "Giữ chân 80% khán giả. Ép thuật toán phân phối viral.",
          sfx: "Climax beat bùng nổ + Tiếng reo hò số liệu tăng vọt",
          prompt: "Cinematic 9:16, glowing 3D analytics curve skyrocketing through holographic clouds, golden sparks raining down, cinematic lighting, 8K."
        },
        {
          beat: "05",
          time: "00:22 - 00:26",
          segment: "The Outro (Hành động ngay)",
          kineticText: "VŨ ANH MEDIA OPS — Làm Chủ Nghệ Thuật Giữ Chân Người Xem (vuanhmedia.com)",
          sfx: "Sub-impact cuối cùng + Tiếng vang ngân dài",
          prompt: "Cinematic 9:16, dark reflective metallic studio backdrop, 3D typography 'VU ANH MEDIA OPS' glowing with electric cyan neon aura, 8K render."
        }
      ],
      rubricScores: {
        total: 95,
        status: "ĐẠT CHUẨN XUẤT SẮC (APPROVED)",
        breakdown: [
          { name: "Độ giật của Hook (Max 25)", score: 25, note: "Hook cực kỳ mạnh mẽ, đánh trực diện vào lỗi sai phổ biến nhất." },
          { name: "Độ sâu Insight (Max 25)", score: 23, note: "Chỉ ra 3 tầng cấu trúc: Thị giác, Thính giác và Khoảng trống tò mò." },
          { name: "Nhịp điệu Pacing & Retention (Max 20)", score: 20, note: "Pacing hoàn hảo, chính bài viết đã minh họa xuất sắc nghệ thuật giữ chân." },
          { name: "Tính khả thi Media & Prompts (Max 15)", score: 14, note: "Visual split-screen và kinetic typography rất dễ triển khai trên Swift." },
          { name: "Chất giọng VAMOPS (Max 15)", score: 13, note: "Thẳng thắn, uy lực, mang tính chuyên gia giảng dạy thực chiến." }
        ],
        criticFeedback: "Mẫu kịch bản có lực kéo tâm lý xuất sắc từ giây đầu tiên đến giây cuối cùng."
      },
      distribution: {
        tiktok: {
          time: "Thứ Bảy · 20:30 (Khung giờ vàng cuối tuần)",
          caption: "Bỏ ngay câu 'Xin chào' nếu không muốn video flop! Đây là công thức 3 giây vàng giữ chân 80% người xem của Vũ Anh Media. #vuanhmedia #viralvideo #contentcreator #tiktoktips",
          soundtrack: "Trending Dark Tech Beat — VAM Sound ID 09"
        },
        facebook: {
          time: "Thứ Bảy · 10:00",
          title: "[CẨM NANG THỰC CHIẾN] 5 KỸ THUẬT THIẾT KẾ HOOK 3 GIÂY ĐẦU BẺ GÃY QUÁN TÍNH LƯỚT CỦA KHÁCH HÀNG",
          snippet: "Não bộ con người chỉ mất 0.3 giây để quyết định lướt hay xem tiếp. Nếu bạn không tạo ra một 'cú sốc thị giác hoặc thính giác'..."
        },
        threads: {
          time: "Thứ Bảy · 15:30",
          threadSnippet: "1/6: Đừng viết kịch bản từ phần nội dung trước. Hãy dành 80% thời gian cho 3 giây đầu tiên. Đây là công thức..."
        }
      }
    }
  }
};
