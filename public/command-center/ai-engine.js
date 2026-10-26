/**
 * VAMOPS UNIVERSAL AI ENGINE (V3.0 — P0 SECURITY & TRUTHFULNESS)
 *
 * Security Architecture (F03 Remediation):
 * - NO API keys in browser localStorage or client-side bundles
 * - All live generation requests route through secure server gateway: /api/v1/ai
 * - External provider credentials (GEMINI_API_KEY, etc.) reside strictly in server environment variables
 *
 * Truthfulness Architecture (F04 Remediation):
 * - Offline generator is strictly labeled DEMO_FIXTURE with provenance: "demo"
 * - Rubric score in demo is marked uncalibrated (no fake 97/100 scores)
 * - NO silent fallbacks: Gateway errors are surfaced honestly to the user
 */

class VAMOPSAIEngine {
  constructor() {
    this.config = this.loadConfig();
    this.gatewayEndpoint = "/api/v1/ai";
    this.modelsByTier = [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Khuyên dùng · Nhanh & Chuẩn JSON)", provider: "gemini" },
      { id: "gpt-4o", name: "GPT-4o (Cân bằng & Sắc sảo)", provider: "openai" },
      { id: "claude-3.7-sonnet", name: "Claude 3.7 Sonnet (Tư duy sâu & Chi tiết)", provider: "openrouter" }
    ];
  }

  loadConfig() {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("vamops_ai_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            mode: parsed.mode === "demo" ? "demo" : "gateway",
            modelTier: parsed.modelTier || "gemini-2.0-flash"
          };
        }
      } catch (e) {
        console.warn("Could not parse saved config, resetting to default.", e);
      }
    }
    return {
      mode: "gateway",
      modelTier: "gemini-2.0-flash"
    };
  }

  saveConfig(newConfig) {
    // Strictly sanitize config to never store credentials
    this.config = {
      mode: newConfig.mode === "demo" ? "demo" : "gateway",
      modelTier: newConfig.modelTier || this.config.modelTier || "gemini-2.0-flash"
    };
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("vamops_ai_config", JSON.stringify(this.config));
      } catch (e) {}
    }
  }

  isLive() {
    return this.config.mode === "gateway";
  }

  getActiveProviderLabel() {
    if (!this.isLive()) {
      return "🧪 Bản Mẫu Demo Fixture (Dữ liệu mẫu tham khảo)";
    }
    return `🛡️ VAMOPS Server Gateway (${this.config.modelTier})`;
  }

  getShortStatusBadge() {
    if (!this.isLive()) {
      return "● DEMO FIXTURE";
    }
    return "● GATEWAY LIVE";
  }

  getRequestHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = typeof window !== "undefined" ? window.__VAMOPS_ACCESS_TOKEN__ : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async refreshLocalSession() {
    try {
      const res = await fetch("/api/v1/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: "{}"
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.accessToken || typeof window === "undefined") return false;
      window.__VAMOPS_ACCESS_TOKEN__ = data.accessToken;
      return true;
    } catch (_) {
      return false;
    }
  }

  async fetchServer(url, options = {}, { timeoutMs = 240_000, retryAuth = true } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const request = () => fetch(url, {
      ...options,
      headers: { ...this.getRequestHeaders(), ...(options.headers || {}) },
      credentials: "same-origin",
      signal: controller.signal
    });
    try {
      let res = await request();
      if (res.status === 401 && retryAuth && await this.refreshLocalSession()) {
        res = await request();
      }
      return res;
    } catch (cause) {
      if (cause?.name === "AbortError") {
        const error = new Error(`Máy chủ không phản hồi sau ${Math.round(timeoutMs / 1000)} giây. Tiến trình đã được mở khóa; hãy kiểm tra Trung tâm Báo cáo để xem trạng thái đã lưu.`);
        error.code = "CLIENT_TIMEOUT";
        throw error;
      }
      throw cause;
    } finally {
      clearTimeout(timer);
    }
  }

  async checkGatewayHealth() {
    try {
      const res = await this.fetchServer(this.gatewayEndpoint, { method: "GET" }, { timeoutMs: 30_000 });
      if (!res.ok) return { healthy: false, status: res.status };
      const data = await res.json();
      return { healthy: true, ...data };
    } catch (e) {
      return { healthy: false, error: e.message };
    }
  }

  async generate(topic, platforms = ["tiktok", "facebook", "threads"]) {
    // In Demo mode, generate deterministic reference fixture with explicit provenance
    if (this.config.mode === "demo") {
      return this.generateOfflineDNA(topic, platforms);
    }

    // In Gateway mode, call the secure server-side endpoint
    return await this.callServerGateway(topic, platforms);
  }

  async runOrchestrator(campaignData) {
    const cleanTopic = (campaignData.title || campaignData.topic || "").trim();
    if (!cleanTopic) {
      throw new Error("Chủ đề chiến dịch không được để trống.");
    }

    if (this.config.mode === "demo") {
      return this.runClientSideOrchestratorFallback(cleanTopic, campaignData.platforms);
    }

    const res = await this.fetchServer("/api/v1/campaigns", {
        method: "POST",
        body: JSON.stringify({
          action: "create_and_run",
          title: cleanTopic,
          industry: campaignData.industry || "Chung",
          target_audience: campaignData.target_audience || "",
          core_message: campaignData.core_message || "",
          brief_details: campaignData.brief_details || {},
          platforms: campaignData.platforms || ["tiktok", "facebook", "threads"]
        })
    });

    if (!res.ok) {
      let errData = {};
      try { errData = await res.json(); } catch(e) {}
      throw new Error(errData.message || `Lỗi Orchestrator (HTTP ${res.status})`);
    }

    return await res.json();
  }

  async campaignAction(campaignId, action, payload = {}) {
    if (!campaignId) throw new Error("Thiếu campaignId bền vững; Demo Fixture không thể đi qua cổng duyệt thật.");
    const res = await this.fetchServer("/api/v1/campaigns", {
      method: "POST",
      body: JSON.stringify({ action, campaignId, ...payload })
    });
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) {
      const error = new Error(data.message || data.error || `Campaign action failed (HTTP ${res.status})`);
      error.code = data.error;
      error.payload = data;
      throw error;
    }
    return data;
  }

  approveDirection(campaignId, selectedAngleId, notes = "") {
    return this.campaignAction(campaignId, "approve_direction", { selectedAngleId, notes });
  }

  continueWorkflow(campaignId) {
    return this.campaignAction(campaignId, "continue");
  }

  supplementBrief(campaignId, campaignData) {
    return this.campaignAction(campaignId, "supplement_brief", {
      industry: campaignData.industry || "",
      target_audience: campaignData.target_audience || "",
      core_message: campaignData.core_message || "",
      brief_details: campaignData.brief_details || {}
    });
  }

  approveFinal(campaignId, notes = "") {
    return this.campaignAction(campaignId, "approve_final", { notes });
  }

  
  async listCampaigns() {
    try {
      const res = await this.fetchServer("/api/v1/campaigns", {
        method: "GET",
      }, { timeoutMs: 30_000 });
      if (!res.ok) throw new Error(`Không thể tải danh sách chiến dịch (HTTP ${res.status})`);
      return await res.json();
    } catch (e) { throw e; }
  }

  async getCampaignBundle(campaignId) {
    const res = await this.fetchServer(`/api/v1/campaigns?id=${encodeURIComponent(campaignId)}`, {
      method: "GET",
    }, { timeoutMs: 30_000 });
    if (!res.ok) throw new Error(`Không thể tải chi tiết chiến dịch (HTTP ${res.status})`);
    return await res.json();
  }

  async deleteCampaign(campaignId) {
    if (!campaignId) throw new Error("Chưa chọn chiến dịch cần xoá.");
    const res = await this.fetchServer(`/api/v1/campaigns?id=${encodeURIComponent(campaignId)}`, {
      method: "DELETE"
    }, { timeoutMs: 30_000 });
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error(data.message || `Không thể xoá chiến dịch (HTTP ${res.status})`);
    return data;
  }

  async clearCampaigns() {
    const res = await this.fetchServer("/api/v1/campaigns?all=true", {
      method: "DELETE"
    }, { timeoutMs: 30_000 });
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (!res.ok) throw new Error(data.message || `Không thể xoá toàn bộ chiến dịch (HTTP ${res.status})`);
    return data;
  }

  requestPublish(campaignId) {
    return this.campaignAction(campaignId, "publish");
  }

  runClientSideOrchestratorFallback(topic, platforms = ["tiktok", "facebook", "threads"]) {
    const isTea = /trà|chè|tây bắc|shan tuyết/i.test(topic);
    const isDental = /nha khoa|răng|implant/i.test(topic);
    const isSaaS = /saas|b2b|phần mềm|nhân sự/i.test(topic);
    const isVague = topic.trim().split(/\s+/).length < 2 || topic.toLowerCase() === "test";

    if (isVague) {
      return {
        success: true,
        workflowResult: {
          status: "NEEDS_INPUT",
          haltReason: "MISSING_ESSENTIAL_BRIEF_INFORMATION",
          missingFacts: [
            "Chủ đề quá ngắn hoặc thiếu ngữ cảnh cụ thể để xác lập định vị chiến dịch.",
            "Cần bổ sung đối tượng khách hàng mục tiêu và mục đích chính của chiến dịch."
          ],
          artifacts: {
            campaignPlan: {
              status: "NEEDS_INPUT",
              missing_facts: ["Chủ đề quá ngắn hoặc thiếu ngữ cảnh cụ thể."]
            }
          }
        }
      };
    }

    const offlineDNA = this.generateOfflineDNA(topic, platforms);
    let planData, dossierData, insightData, angleData;

    if (isTea) {
      planData = {
        campaign_objective: "Định vị Trà Cổ Thụ Tây Bắc như một di sản văn hóa sống và tài sản thưởng thức thượng hạng.",
        target_audience_profile: "Doanh nhân, người làm sáng tạo 28-45 tuổi tìm kiếm sự tĩnh tại và quà đối ngoại tinh tế.",
        positioning_angle: "Tài sản Di sản: Mỗi búp trà là chứng nhân hàng trăm năm sương gió Tà Xùa/Suối Giàng.",
        platforms,
        founder_dna_alignment: "Mộc mạc, điện ảnh, tôn trọng người hái trà trên mây và văn hóa bản địa."
      };
      dossierData = {
        industry_benchmarks: {
          format_style: "Documentary Slow-Cinema & Visual ASMR",
          optimal_duration_seconds: 45,
          recommended_aspect_ratio: "9:16 (High Dynamic Range)",
          retention_curve_pattern: "3s đầu neo bằng âm thanh pha trà mộc ASMR và sương sớm núi cao; duy trì retention > 48% sau 15s."
        },
        sources: [
          { title: "Báo cáo Ngành Nông Sản Đặc Sản & Tiêu Dùng Văn Hóa 2025", url: "https://vuanhmedia.com/research/tay-bac-ancient-tea", retrieved_at: "2026-10-24", evidence: "Xu hướng người trẻ đô thị chuyển dịch sang trà di sản tăng 34%." }
        ],
        evidence_gaps: ["Thiếu dữ liệu định lượng về sản lượng trà cổ thụ búp măng rừng Tà Xùa năm nay."]
      };
      insightData = {
        core_psychological_friction: "Muốn tìm kiếm an yên và chiều sâu văn hóa, nhưng sợ bị gắn mác học đòi hoặc mua phải trà tẩm ướp hương liệu.",
        unspoken_fear: "Nỗi sợ sự hối hả hiện đại đang bào mòn căn tính và sự tĩnh tại của chính mình.",
        job_to_be_done: "Khi tôi thưởng một chén trà Shan tuyết, hãy giúp tôi mua được 15 phút tĩnh lặng tuyệt đối cho tâm trí.",
        verified_observations: ["Người làm sáng tạo mang bình trà cá nhân đến văn phòng tăng 42%."],
        hypotheses_to_test: ["Cận cảnh sao trà thủ công tạo niềm tin cao hơn giấy kiểm nghiệm."]
      };
      angleData = {
        angles: [
          { id: "angle-1", name: "Uống Trà Không Phải Chuyện Của Người Già", premise: "Mindfulness đích thực bên chén trà Shan tuyết 300 năm tuổi.", potential_risk_or_tradeoff: "Có thể gặp phản ứng từ tệp khách trà truyền thống lớn tuổi.", recommended_channel: "Threads & Facebook" },
          { id: "angle-2", name: "Chén Trà Định Đoạt Khí Chất Đối Ngoại", premise: "Một chai rượu ngoại uống xong là hết, nhưng một ấm trà cổ thụ lưu giữ câu chuyện trăm năm.", potential_risk_or_tradeoff: "Đòi hỏi bao bì và câu chuyện thương hiệu đạt chuẩn tinh tế cao cấp.", recommended_channel: "Facebook & LinkedIn" },
          { id: "angle-3", name: "Chén Trà Mọc Giữa Lưng Chừng Trời", premise: "Trèo lên cây cổ thụ cao 15m giữa sương mù 5 độ C để hái từng búp trà ngậm tuyết.", potential_risk_or_tradeoff: "Chi phí ghi hình thực địa vùng cao Tây Bắc cao hơn bình thường.", recommended_channel: "TikTok & Reels (Visual ASMR)" }
        ],
        recommended_angle_id: "angle-1",
        recommendation_reason: "Góc nhìn phá vỡ định kiến có sức công phá truyền thông lớn nhất trên đa kênh."
      };
    } else if (isDental) {
      planData = {
        campaign_objective: "Xây dựng niềm tin chuyên môn y khoa minh bạch, hóa giải nỗi sợ đau đớn và hoài nghi chiêu trò giá rẻ.",
        target_audience_profile: "Khách hàng 28-50 tuổi có nhu cầu cấy ghép Implant nhưng sợ đau và sợ vẽ bệnh.",
        positioning_angle: "Y khoa Trung thực: Phơi bày trực quan quy trình vô trùng và tay nghề bác sĩ điều trị.",
        platforms,
        founder_dna_alignment: "Truyền thông y tế chuẩn mực: Đặt sự an toàn của bệnh nhân lên trên hết."
      };
      dossierData = {
        industry_benchmarks: {
          format_style: "Clinical Transparency & High-Trust Micro-Doc",
          optimal_duration_seconds: 32,
          recommended_aspect_ratio: "9:16 (Medical Studio Light)",
          retention_curve_pattern: "3s đầu dập tắt nỗi sợ đau bằng mô hình 3D; không chiếu cảnh máu me vi phạm tiêu chuẩn cộng đồng."
        },
        sources: [
          { title: "Chính sách kiểm duyệt Y tế TikTok & Meta Healthcare Guidelines", url: "https://vuanhmedia.com/research/healthcare-policy-compliance-2026", retrieved_at: "2026-10-24", evidence: "Thuật toán hạn chế hiển thị video máu me hoặc cam kết 100%." }
        ],
        evidence_gaps: ["Chưa có khảo sát tỷ lệ hài lòng dài hạn sau 5 năm của riêng bệnh nhân phòng khám."]
      };
      insightData = {
        core_psychological_friction: "Khao khát nụ cười tự tin nhưng bị tê liệt bởi nỗi ám ảnh về cơn đau và sợ bị vẽ bệnh móc túi.",
        unspoken_fear: "Sợ rằng nếu phẫu thuật hỏng, hậu quả biến chứng sẽ đeo đẳng suốt đời.",
        job_to_be_done: "Khi bước vào phòng nha, hãy giúp tôi cảm thấy an toàn tuyệt đối và được tôn trọng như một con người.",
        verified_observations: ["82% bệnh nhân tìm kiếm 'trồng răng implant có đau không' trước khi hỏi giá."],
        hypotheses_to_test: ["Giải thích cơ chế gây tê cục bộ không đau làm giảm 60% do dự của bệnh nhân."]
      };
      angleData = {
        angles: [
          { id: "angle-1", name: "Răng Thật Là Vô Giá, Đừng Vội Mài Bỏ", premise: "Nha khoa trung thực là cố gắng giữ lại răng gốc tối đa cho bạn.", potential_risk_or_tradeoff: "Giảm doanh thu bọc sứ cấp tốc ngắn hạn nhưng tăng LTV dài hạn.", recommended_channel: "Facebook & TikTok" },
          { id: "angle-2", name: "Cơn Đau Nằm Ở Trí Tưởng Tượng", premise: "Công nghệ định vị 3D giúp ca cấy Implant nhanh hơn một lần chờ pha cà phê.", potential_risk_or_tradeoff: "Phải dùng thuật ngữ kiểm soát êm ái, không cam kết tuyệt đối vi phạm chính sách.", recommended_channel: "TikTok Video" },
          { id: "angle-3", name: "Hậu Trường Vô Trùng 7 Bước", premise: "Khu vực hấp sấy vô khuẩn khép kín mà camera ít khi quay tới.", potential_risk_or_tradeoff: "Nội dung kỹ thuật cần giải thích bình dân hóa.", recommended_channel: "Reels & Shorts" }
        ],
        recommended_angle_id: "angle-1",
        recommendation_reason: "Định vị phòng khám nương tựa niềm tin trước thị trường hỗn loạn."
      };
    } else {
      planData = {
        campaign_objective: `Thiết lập vị thế chuyên gia đầu ngành cho "${topic}", biến nội dung thành tài sản thương hiệu bền vững.`,
        target_audience_profile: "Nhà sáng lập, quản lý và đối tác tìm kiếm giải pháp thực chất và lâu dài.",
        positioning_angle: "Sự thật nghề nghiệp: Bóc tách thực tế thay vì chạy theo chiêu trò bề nổi.",
        platforms,
        founder_dna_alignment: "Đĩnh đạc, tôn trọng người xem, nhất quán với tinh thần Media Ops Vũ Anh."
      };
      dossierData = {
        industry_benchmarks: {
          format_style: "B2B Thought Leadership & Operational Blueprint",
          optimal_duration_seconds: 60,
          recommended_aspect_ratio: "9:16 + Threads/LinkedIn Post",
          retention_curve_pattern: "Neo giữ chân bằng con số thất thoát ngân sách thực tế và sơ đồ quy trình trực quan."
        },
        sources: [
          { title: "Báo cáo Hiện trạng Quản trị Doanh nghiệp Vừa và Nhỏ", url: "https://vuanhmedia.com/research/b2b-efficiency-report", retrieved_at: "2026-10-24", evidence: "Doanh nghiệp mất 38 giờ công mỗi tháng để đồng bộ dữ liệu thủ công." }
        ],
        evidence_gaps: ["Dữ liệu hành vi chi tiết theo từng phân khúc doanh nghiệp cụ thể."]
      };
      insightData = {
        core_psychological_friction: "Muốn tự động hóa bài bản nhưng sợ nhân sự cấp dưới kháng cự và sợ lãng phí chi phí phần mềm.",
        unspoken_fear: "Nỗi sợ mất quyền kiểm soát thực tế đối với bộ máy vận hành.",
        job_to_be_done: "Giải phóng khỏi những bảng biểu vụn vặt để tập trung vào chiến lược kinh doanh.",
        verified_observations: ["Bài viết của Founder mang lại tương tác cao gấp 3.8 lần Brand Page."],
        hypotheses_to_test: ["Founder quan tâm đến báo cáo trên di động hơn là giao diện phức tạp trên PC."]
      };
      angleData = {
        angles: [
          { id: "angle-1", name: "Thuê Nhân Sự Giỏi Về Chỉ Để Nhập Excel", premise: "Lãng phí chi phí cơ hội lớn nhất của doanh nghiệp là dùng chuyên viên làm việc thủ công.", potential_risk_or_tradeoff: "Có thể chạm tự ái nhân sự nếu không truyền thông khéo léo.", recommended_channel: "Threads & LinkedIn" },
          { id: "angle-2", name: "Bản Đồ Nhịp Thở Vận Hành", premise: "Một công ty 100 người không thể lãnh đạo bằng cảm giác may rủi.", potential_risk_or_tradeoff: "Cần nhấn mạnh tính chất trao quyền thay vì giám sát rình rập.", recommended_channel: "Threads & Facebook" },
          { id: "angle-3", name: "Tại Sao 70% Phần Mềm Bị Đắp Chiếu?", premise: "Loại bỏ 80% tính năng thừa để nhân sự dùng được ngay từ ngày đầu tiên.", potential_risk_or_tradeoff: "Khách hàng lớn có thể cảm thấy sản phẩm quá tinh giản.", recommended_channel: "Website Case Study" }
        ],
        recommended_angle_id: "angle-1",
        recommendation_reason: "Khơi gợi trực diện sự bức bối về lãng phí ngân sách của mọi Founder."
      };
    }

    dossierData.research_status = "BLOCKED_RETRIEVAL";
    dossierData.research_blocker = "DEMO_FIXTURE_NOT_LIVE_RESEARCH";
    dossierData.sources = (dossierData.sources || []).map((source, index) => ({
      ...source,
      evidence: `[DEMO_UNVERIFIED] ${source.evidence}`,
      classification: "unverified",
      provenance: "demo",
      claim_ids: [`demo-claim-${index + 1}`]
    }));
    insightData.evidence_classification = "demo_unverified";

    return {
      success: true,
      campaign: { id: null, title: topic, platforms, status: "AWAITING_FOUNDER_REVIEW", persistence: "demo_only" },
      workflowResult: {
        status: "AWAITING_FOUNDER_REVIEW",
        executionSummary: { stepsCompleted: 4, totalCostUsd: 0, costProvenance: "fixture_zero_billable_usage", totalElapsedMs: 0 },
        artifacts: {
          campaignPlan: planData,
          researchDossier: dossierData,
          audienceInsight: insightData,
          angleOptions: angleData
        }
      },
      artifacts: [
        { artifact_type: "CampaignPlan", data: planData, provenance: "mock_fixture" },
        { artifact_type: "ResearchDossier", data: dossierData, provenance: "mock_fixture" },
        { artifact_type: "AudienceInsight", data: insightData, provenance: "mock_fixture" },
        { artifact_type: "AngleOptions", data: angleData, provenance: "mock_fixture" }
      ],
      ...offlineDNA
    };
  }

  async callServerGateway(topic, platforms) {
    const cleanTopic = (topic || "").trim();
    if (!cleanTopic) {
      throw new Error("Chủ đề chiến dịch không được để trống.");
    }

    let res;
    try {
      res = await this.fetchServer(this.gatewayEndpoint, {
        method: "POST",
        body: JSON.stringify({
          topic: cleanTopic,
          platforms,
          modelTier: this.config.modelTier
        })
      });
    } catch (networkErr) {
      // HONEST ERROR REPORTING: Do not silently disguise network failure as successful live run!
      throw new Error(`Không thể kết nối tới Server AI Gateway (${networkErr.message}). Vui lòng kiểm tra kết nối mạng hoặc chuyển sang chế độ Demo Fixture.`);
    }

    if (!res.ok) {
      let errData = {};
      try {
        errData = await res.json();
      } catch (e) {
        errData = { message: await res.text() };
      }

      // If server keys are missing or provider error, throw explicit error
      throw new Error(errData.message || `Lỗi phản hồi từ AI Gateway (HTTP ${res.status}).`);
    }

    const payload = await res.json();
    return payload;
  }

  generateOfflineDNA(topic, platforms = ["tiktok", "facebook", "threads"]) {
    const cleanTopic = (topic || "").trim();
    const shortTopic = cleanTopic.length > 35 ? cleanTopic.slice(0, 35) + "..." : cleanTopic;

    return {
      topic: cleanTopic,
      modelUsed: "VAMOPS DNA (Bản mẫu Demo Fixture)",
      provenance: "demo",
      is_demo: true,
      strategyBrief: {
        target: "Doanh nghiệp và tổ chức cần biến nội dung rời rạc thành nhịp sản xuất đều đặn và tài sản truyền thông dùng được lâu dài.",
        mainMessage: `Hiểu rõ người xem và câu chuyện của khách hàng trước khi định hướng. Mỗi đề bài ${shortTopic.toLowerCase()} là một cấu trúc kể riêng biệt, không rập khuôn công thức.`,
        emotionalDriver: "Giá trị, Niềm tin và Hạnh phúc thực sự khi sở hữu sản phẩm ưng ý mang đậm bản sắc thương hiệu."
      },
      hooks: [
        {
          id: "hook-1",
          type: "Góc Nhìn Làm Nghề (Founder Vũ Anh)",
          text: `Đối với tôi, một sản phẩm ${shortTopic.toLowerCase()} có giá trị không nằm ở kỹ thuật phô diễn, mà ở mạch kể và cảm xúc mà người xem còn giữ lại nhiều năm sau.`,
          retentionScore: null
        },
        {
          id: "hook-2",
          type: "Trọng Lượng Niềm Tin",
          text: `Thương hiệu là tài sản quý giá bạn gây dựng nhiều năm. Khi đưa nó lên hình ảnh và âm thanh, điều giữ chúng tôi cẩn trọng trong từng khung hình chính là niềm tin của bạn.`,
          retentionScore: null
        },
        {
          id: "hook-3",
          type: "Chiêm Nghiệm 15 Năm Hiện Trường",
          text: `Làm nghề từ năm 2011 đến nay, tôi nhận ra: Hiểu rõ người xem và câu chuyện của khách trước khi bấm máy mới là thứ tạo nên những sản phẩm vượt thời gian.`,
          retentionScore: null
        }
      ],
      beatSheet: [
        {
          beat: "01",
          time: "00:00 - 00:05",
          segment: "The Narrative Arc (Mạch kể & Cảm xúc)",
          kineticText: `Làm ${shortTopic.slice(0, 24)}... Điều gì đọng lại trong người xem?`,
          sfx: "Hơi thở không gian lắng đọng + Tiếng vĩ cầm mộc mạc",
          prompt: "Cinematic 9:16, low-angle slow push in on an authentic creative director reviewing footage in a sunlit studio, 8K."
        },
        {
          beat: "02",
          time: "00:05 - 00:11",
          segment: "The Craftsmanship (Bàn tay người làm nghề)",
          kineticText: "Mỗi câu chuyện là một cấu trúc kể riêng, không rập khuôn.",
          sfx: "Tiếng mở cuộn băng ghi hình, bước chân hiện trường",
          prompt: "Cinematic 9:16, close up on director's hands writing detailed script notes on physical storyboard paper."
        },
        {
          beat: "03",
          time: "00:11 - 00:17",
          segment: "The Insight (Hạt nhân câu chuyện)",
          kineticText: "Chạm đúng việc cần giải quyết, tạo ra giá trị đo đếm được.",
          sfx: "Nhịp cello ngân vang, nhịp điệu chắc chắn",
          prompt: "Cinematic 9:16, warm natural lighting on an authentic workshop where real products are crafted with dedication."
        },
        {
          beat: "04",
          time: "00:17 - 00:22",
          segment: "The Proof (Giá trị đọng lại)",
          kineticText: "Nội dung trở thành tài sản lâu dài, không trôi đi sau 24 giờ.",
          sfx: "Tiếng thở dài nhẹ nhõm, nốt piano vút cao tươi sáng",
          prompt: "Cinematic 9:16, a satisfied client smiling while watching the finalized video on an iPad display."
        },
        {
          beat: "05",
          time: "00:22 - 00:26",
          segment: "The Outro (Dấu ấn thương hiệu)",
          kineticText: "VŨ ANH MEDIA (EST. 2011) — Giữ trọn niềm tin & bản sắc trong từng khuôn hình.",
          sfx: "Âm vang lắng đọng của tiếng chuông ấm áp",
          prompt: "Cinematic 9:16, minimalist dark surface, elegant illuminated typography of 'VU ANH MEDIA · EST. 2011', subtle cyan glow."
        }
      ],
      rubricScores: {
        is_demo_fixture: true,
        total: null, // TRUTHFULNESS: No hardcoded 97/100 score in demo mode!
        status: "BẢN MẪU THAM KHẢO (CHƯA QUA THẨM ĐỊNH ĐỘC LẬP)",
        breakdown: [
          { name: "Độ thấm thía của Mở bài", score: null, note: "Bản mẫu demo — Chưa chấm điểm độc lập" },
          { name: "Độ sâu Mạch kể & Cảm xúc", score: null, note: "Bản mẫu demo — Chưa chấm điểm độc lập" },
          { name: "Nhịp thở Pacing", score: null, note: "Bản mẫu demo — Chưa chấm điểm độc lập" },
          { name: "Tính khả thi Media & Swift Pipeline", score: null, note: "Bản mẫu demo — Chưa chấm điểm độc lập" },
          { name: "Bản sắc DNA Founder", score: null, note: "Bản mẫu demo — Chưa chấm điểm độc lập" }
        ],
        unreviewed_note: "Bản thảo mẫu tham khảo — Chờ phiên thẩm định độc lập từ The Ruthless Critic"
      },
      distribution: {
        tiktok: {
          time: "Thứ Năm · 20:00",
          caption: `Đối với tôi, một sản phẩm media giá trị là khi vài năm sau mở lại, người làm ra và người đặt hàng vẫn thấy tự hào. #vuanhmedia #filmmaking #storytelling`,
          soundtrack: "Cinematic Ambient Piano & Cello — VAM Sound ID 07"
        },
        facebook: {
          time: "Thứ Năm · 11:30",
          title: `[GÓC NHÌN LÀM NGHỀ] ${cleanTopic.toUpperCase()} — KHI MEDIA TRỞ THÀNH TÀI SẢN`,
          snippet: `Thương hiệu là tài sản quý giá mà doanh nghiệp gây dựng qua nhiều năm...`
        },
        threads: {
          time: "Thứ Sáu · 08:15",
          threadSnippet: `1/3: 15 năm làm nghề dạy tôi rằng: Máy móc đắt tiền chỉ có giá trị khi phục vụ đúng cảm xúc mà người xem còn nhớ lại...`
        }
      }
    };
  }
}

// Global instance in browser
if (typeof window !== "undefined") {
  window.VAMOPSAIEngine = VAMOPSAIEngine;
  window.vamopsAIEngine = new VAMOPSAIEngine();
}
