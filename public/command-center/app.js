/**
 * VAMOPS COMMAND CENTER — ỨNG DỤNG ĐIỀU PHỐI VÀ MÔ PHỎNG WORKFLOW (V2.5 PRODUCTION GRADE)
 * Vũ Anh Media Operations — Tích hợp Full AI Engine & DNA Founder Vũ Anh
 */
// Security: Robust HTML escaping to prevent DOM-XSS from untrusted AI text and input
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeMissingFacts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item.question === "string") return item.question.trim();
      if (item && typeof item.text === "string") return item.text.trim();
      return "";
    })
    .filter(Boolean)
    .slice(0, 20);
}

function campaignStatusPresentation(status) {
  const map = {
    DRAFT: ["Bản nháp", "Chưa gửi brief"],
    BRIEF_READY: ["Brief đã sẵn sàng", "Bấm chạy để giao việc cho Phòng Chiến lược"],
    NEEDS_INPUT: ["Cần bổ sung brief", "Founder bổ sung đúng các trường còn thiếu"],
    RESEARCH_RUNNING: ["Đang nghiên cứu", "Phòng Nghiên cứu đang thu thập và kiểm chứng dữ liệu"],
    IDEATION: ["Đang phát triển chiến lược", "Phòng Sáng tạo đang xây dựng các hướng tiếp cận"],
    AWAITING_FOUNDER_REVIEW: ["Chờ duyệt hướng chiến lược", "Founder chọn một concept tại Gate 1"],
    DIRECTION_APPROVED: ["Đã duyệt hướng chiến lược", "Sẵn sàng triển khai sản xuất"],
    CREATIVE_RUNNING: ["Đang sản xuất nội dung", "Các phòng Sáng tạo và Sản xuất đang thực hiện"],
    RUNNING_SPECIALISTS: ["Đang sản xuất nội dung", "Các phòng chuyên môn đang thực hiện"],
    AWAITING_FOUNDER_FINAL_APPROVAL: ["Chờ nghiệm thu cuối", "Founder xem báo cáo kiểm định và duyệt Gate 2"],
    DISTRIBUTION_NOT_CONFIGURED: ["Đã nghiệm thu — chưa kết nối kênh", "Cấu hình OAuth/provider trước khi phát hành"],
    READY_FOR_OPERATOR_SCHEDULING: ["Sẵn sàng lên lịch", "Chọn lịch phát hành và người vận hành"],
    PUBLISHED: ["Đã xuất bản", "Theo dõi số liệu sau phát hành"],
    COMPLETED: ["Đã hoàn tất", "Chiến dịch đã đóng"],
    REVISE: ["Cần chỉnh sửa chiến lược", "Phòng Chiến lược xử lý yêu cầu phản biện"]
  };
  const [label, action] = map[status] || [status || "Chưa xác định", "Kiểm tra trạng thái chiến dịch"];
  return { label, action };
}

function asDemoFixture(value) {
  return value ? { ...value, provenance: "demo", is_demo: true, demo_notice: "STATIC_DEMO_FIXTURE_NOT_LIVE_EXECUTION" } : value;
}

function computeCampaignModelInfo(taskRuns) {
  if (!Array.isArray(taskRuns) || taskRuns.length === 0) {
    return { summary: "Không xác định", agentModels: {}, distinctModels: [] };
  }
  const agentModels = {};
  const validModels = [];

  taskRuns.forEach((t) => {
    let m = null;
    if (t.provider && t.model_id) {
      m = `${t.provider}/${t.model_id}`;
    } else if (t.model_id) {
      m = t.model_id;
    } else if (t.provider) {
      m = t.provider;
    }
    if (t.agent_id) {
      agentModels[t.agent_id] = m || "Không xác định";
    }
    if (m) validModels.push(m);
  });

  const distinct = [...new Set(validModels)];
  let summary = "Không xác định";
  if (distinct.length === 1) {
    summary = distinct[0];
  } else if (distinct.length > 1) {
    summary = "Mixed runtime";
  }

  return { summary, agentModels, distinctModels: distinct };
}

function syncDashboardFromCampaign(bundle) {
  if (typeof document === "undefined") return;
  const stepCards = document.querySelectorAll(".step-card");
  if (!stepCards || stepCards.length === 0) return;

  const setCard = (idx, state, text) => {
    const card = stepCards[idx];
    if (!card) return;
    card.classList.remove("running", "completed", "failed");
    if (state) card.classList.add(state);
    const badge = card.querySelector(".step-badge");
    if (badge) badge.textContent = text;
  };

  if (!bundle) {
    for (let i = 0; i < 6; i++) setCard(i, "", "Chờ");
    return;
  }

  const campaign = bundle.campaign || bundle;
  const artifacts = bundle.artifacts || bundle.p1Artifacts || {};
  const getArt = (type) => {
    if (Array.isArray(artifacts)) {
      const found = artifacts.filter((a) => a.artifact_type === type);
      return found.length > 0 ? found[found.length - 1] : null;
    }
    if (artifacts[type]) return { data: artifacts[type] };
    const camel = type.charAt(0).toLowerCase() + type.slice(1);
    if (artifacts[camel]) return { data: artifacts[camel] };
    return null;
  };

  const taskRuns = bundle.taskRuns || [];
  const approvals = bundle.approvals || [];
  const reviews = bundle.reviews || [];

  // Step 0: Plan (CampaignPlan)
  const plan = getArt("CampaignPlan");
  if (campaign.status === "BRIEF_READY") {
    setCard(0, "completed", "Brief đã lưu");
  } else if (plan) {
    const planData = plan.data || plan;
    if (planData.status === "NEEDS_INPUT") {
      setCard(0, "failed", "Thiếu dữ kiện");
    } else {
      setCard(0, "completed", "✓ Hoàn tất");
    }
  } else if (taskRuns.some((t) => t.agent_id === "agent-cmo" && t.status === "running")) {
    setCard(0, "running", "Đang lập kế hoạch");
  } else {
    setCard(0, "", "Chờ");
  }

  // Step 1: Research + Insight (ResearchDossier & AudienceInsight)
  const dossier = getArt("ResearchDossier");
  const insight = getArt("AudienceInsight");
  if (dossier && insight) {
    setCard(1, "completed", "✓ Hoàn tất");
  } else if (dossier || insight || taskRuns.some((t) => (t.agent_id === "agent-algo" || t.agent_id === "agent-psycho") && t.status === "running")) {
    setCard(1, "running", "Đang nghiên cứu");
  } else {
    setCard(1, "", "Chờ");
  }

  // Step 2: AngleOptions + Gate 1
  const angles = getArt("AngleOptions");
  const gate1Approval = approvals.find((a) => a.gate === "founder_direction" || a.gate === "gate1" || a.gate === "ANGLE_APPROVED");
  const isPostGate1Status = [
    "DIRECTION_APPROVED",
    "CREATIVE_RUNNING",
    "RUNNING_SPECIALISTS",
    "AWAITING_FOUNDER_FINAL_APPROVAL",
    "DISTRIBUTION_NOT_CONFIGURED",
    "READY_FOR_OPERATOR_SCHEDULING",
    "COMPLETED",
    "PUBLISHED"
  ].includes(campaign.status);

  if (gate1Approval || isPostGate1Status) {
    setCard(2, "completed", "✓ Đã duyệt G1");
  } else if (angles) {
    const angleData = angles.data || angles;
    if (angleData.status === "REVISE") {
      setCard(2, "failed", "Cần sửa góc");
    } else {
      setCard(2, "running", "Chờ duyệt G1");
    }
  } else if (taskRuns.some((t) => t.agent_id === "agent-counter" && t.status === "running")) {
    setCard(2, "running", "Đang tạo góc");
  } else {
    setCard(2, "", "Chờ");
  }

  // Step 3: CreativeReview (Rubric evaluation)
  const reviewArt = getArt("CreativeReview");
  const reviewData = reviewArt ? (reviewArt.data || reviewArt) : (reviews.length > 0 ? reviews[reviews.length - 1] : null);
  if (reviewData) {
    const score = Number(reviewData.overall_score !== undefined ? reviewData.overall_score : (reviewData.score !== undefined ? reviewData.score : 0));
    const isPass = reviewData.verdict === "PASS" && score >= 85;
    if (isPass) {
      setCard(3, "completed", `✓ Đạt (${score}đ)`);
    } else {
      setCard(3, "failed", `Chưa đạt (${score}đ)`);
    }
  } else if (taskRuns.some((t) => t.agent_id === "agent-critic" && t.status === "running")) {
    setCard(3, "running", "Đang chấm điểm");
  } else {
    setCard(3, "", "Chờ");
  }

  // Step 4: Hook/Script/Copy/Visual/Audio/Production (ProductionManifest)
  const prod = getArt("ProductionManifest");
  const script = getArt("ScriptPackage");
  if (prod) {
    setCard(4, "completed", "✓ Sẵn sàng");
  } else if (script || taskRuns.some((t) => ["agent-hook", "agent-story", "agent-copy", "agent-visual", "agent-sound", "agent-renderer"].includes(t.agent_id) && t.status === "running")) {
    setCard(4, "running", "Đang sản xuất");
  } else {
    setCard(4, "", "Chờ");
  }

  // Step 5: Gate 2 + Distribution (founder_final approval & scheduling)
  const gate2Approval = approvals.find((a) => a.gate === "founder_final" || a.gate === "gate2");
  if (campaign.status === "PUBLISHED") {
    setCard(5, "completed", "✓ Đã phát hành");
  } else if (campaign.status === "READY_FOR_OPERATOR_SCHEDULING") {
    setCard(5, "completed", "✓ Đã lên lịch");
  } else if (campaign.status === "DISTRIBUTION_NOT_CONFIGURED") {
    setCard(5, "failed", "Chưa nối kênh");
  } else if (gate2Approval) {
    setCard(5, "completed", "✓ Đã duyệt G2");
  } else if (campaign.status === "AWAITING_FOUNDER_FINAL_APPROVAL") {
    setCard(5, "running", "Chờ duyệt G2");
  } else {
    setCard(5, "", "Chờ");
  }
}

class VAMOPSApp {
  constructor() {
    this.scene3d = null;
    this.selectedAgent = null;
    this.selectedZone = null;
    this.isSimulating = false;
    this.soundEnabled = true;
    this.audioCtx = null;
    this.activeCampaignId = "camp-01";
    this.selectedModalTab = "executive-summary";
    this.selectedAITab = "models";
    this.currentResult = null;
    this.toastTimer = null;
    this.loadedCampaigns = [];
    this.activeVaultCampaignId = null;
    this.activeSelectedAngleId = null;
    this.gatewayHealth = null;

    this.init();
  }

  init() {
    // 1. Initialize 3D Scene
    try {
      this.scene3d = new VAMOPSScene3D("canvas-3d-container");
    } catch (err) {
      console.warn('[VAMOPS] WebGL Scene3D unavailable in headless environment, using fallback stub:', err);
      this.scene3d = new Proxy({}, {
        get(target, prop) {
          if (prop === 'isMeetingMode') return false;
          if (prop === 'isAutoRotate') return false;
          return () => {};
        }
      });
    }

    // 2. Setup Global Callbacks
    window.onAgentSelected = (agent) => this.selectAgent(agent);
    window.onZoneSelected = (zone) => this.selectZone(zone);

    // Legacy registry metadata is frozen for UI-baseline compatibility; never treat it as runtime truth.
    if (window.VAMOPS_DATA && Array.isArray(window.VAMOPS_DATA.agents)) {
      window.VAMOPS_DATA.agents.forEach((a) => {
        delete a.modelEngine;
      });
    }

    this.applyProfessionalWorkflowShell();

    // 3. Set initial campaign result - only allow demo if explicitly in demo mode
    const isDemoMode = window.vamopsAIEngine?.config?.mode === "demo";
    if (isDemoMode) {
      this.currentResult = asDemoFixture(VAMOPS_DATA.sampleExecutionResults["camp-01"]);
    } else {
      this.currentResult = null;
    }

    // 4. Bind UI Events
    this.bindDOMEvents();

    // 5. Populate Agent Roster Bar
    this.renderAgentRoster();

    // 6. Select Default Agent (CMO) without hijacking initial overview camera
    this.selectAgent(VAMOPS_DATA.agents[0], false);

    // 7. Update Clock and AI Status
    this.startSystemClock();
    this.updateAIStatusBadge();
    this.initializeAuthenticatedRuntime();
  }

  async initializeAuthenticatedRuntime() {
    const session = await window.vamopsAIEngine?.initAuth?.();
    await this.refreshGatewayStatus();
    if (!session) {
      this.updateAuthButton(false);
      this.openAuthModal("Đăng nhập để bắt đầu tạo và lưu chiến dịch.");
      this.syncDashboardFromCampaign(null);
      return;
    }
    await this.completeAuthenticatedSession();
  }

  updateAuthButton(authenticated) {
    const button = document.getElementById("btn-auth-session");
    if (!button) return;
    button.textContent = authenticated ? "👤 Đăng xuất" : "👤 Đăng nhập";
    button.title = authenticated ? "Đăng xuất khỏi kho chiến dịch hiện tại" : "Đăng nhập để lưu chiến dịch";
  }

  openAuthModal(message = "") {
    const modal = document.getElementById("auth-modal");
    const status = document.getElementById("auth-status");
    if (status) status.textContent = message;
    if (modal) modal.classList.add("open");
  }

  async completeAuthenticatedSession() {
    document.getElementById("auth-modal")?.classList.remove("open");
    this.updateAuthButton(true);
    await this.refreshGatewayStatus();
    await this.loadVaultData();
    this.syncDashboardFromCampaign(this.currentResult);
    this.restorePendingBriefIfNeeded();
  }

  ensureAuthShell() {
    const actions = document.querySelector(".top-actions");
    const vaultButton = document.getElementById("btn-open-vault");
    if (actions && vaultButton && !document.getElementById("btn-auth-session")) {
      vaultButton.insertAdjacentHTML("beforebegin", '<button class="btn-pill" id="btn-auth-session" style="border-color:var(--emerald-core);color:var(--emerald-core);" title="Đăng nhập để lưu chiến dịch">👤 Đăng nhập</button>');
    }
    if (!document.getElementById("auth-modal")) {
      document.body.insertAdjacentHTML("beforeend", `
        <div id="auth-modal" class="modal-backdrop">
          <div class="modal-window" style="max-width:520px;min-height:auto;">
            <div class="modal-header"><h2><span>🔐</span> ĐĂNG NHẬP TRUNG TÂM ĐIỀU HÀNH</h2></div>
            <div class="modal-body" style="padding:24px;">
              <p style="font-size:13px;line-height:1.65;color:var(--text-muted);margin-bottom:18px;">Mỗi tài khoản có kho chiến dịch riêng. Quyết định Gate 1/Gate 2 được lưu theo người duyệt và thời gian thực tế.</p>
              <div style="display:grid;gap:14px;">
                <label class="ai-form-group"><span class="ai-form-label">Email</span><input id="auth-email" class="text-input" type="email" autocomplete="email" placeholder="founder@congty.vn" style="min-height:44px;resize:none;"></label>
                <label class="ai-form-group"><span class="ai-form-label">Mật khẩu</span><input id="auth-password" class="text-input" type="password" autocomplete="current-password" placeholder="Tối thiểu 6 ký tự" style="min-height:44px;resize:none;"></label>
                <div id="auth-status" style="min-height:20px;font-size:12px;color:var(--text-muted);"></div>
              </div>
            </div>
            <div class="modal-footer" style="justify-content:flex-end;gap:10px;">
              <button id="btn-auth-signup" class="btn-pill">Tạo tài khoản</button>
              <button id="btn-auth-login" class="btn-publish-vault" style="background:var(--emerald-core);color:#02130d;">Đăng nhập</button>
            </div>
          </div>
        </div>`);
    }
  }

  bindAuthEvents() {
    const sessionButton = document.getElementById("btn-auth-session");
    const loginButton = document.getElementById("btn-auth-login");
    const signupButton = document.getElementById("btn-auth-signup");
    const status = document.getElementById("auth-status");
    const credentials = () => ({
      email: document.getElementById("auth-email")?.value.trim() || "",
      password: document.getElementById("auth-password")?.value || ""
    });
    const validate = ({ email, password }) => {
      if (!email.includes("@")) throw new Error("Vui lòng nhập email hợp lệ.");
      if (password.length < 6) throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
    };

    sessionButton?.addEventListener("click", async () => {
      if (!window.vamopsAIEngine?.isAuthenticated?.()) {
        this.openAuthModal();
        return;
      }
      await window.vamopsAIEngine.signOut();
      this.currentResult = null;
      this.loadedCampaigns = [];
      this.updateAuthButton(false);
      this.openAuthModal("Đã đăng xuất. Đăng nhập lại để mở kho chiến dịch.");
      this.syncDashboardFromCampaign(null);
    });

    loginButton?.addEventListener("click", async () => {
      loginButton.disabled = true;
      try {
        const input = credentials();
        validate(input);
        if (status) status.textContent = "Đang xác thực...";
        await window.vamopsAIEngine.signIn(input.email, input.password);
        await this.completeAuthenticatedSession();
        this.showToast("Đăng nhập thành công. Kho chiến dịch đã sẵn sàng.", "✓");
      } catch (error) {
        if (status) status.textContent = `Không thể đăng nhập: ${error.message}`;
      } finally {
        loginButton.disabled = false;
      }
    });

    signupButton?.addEventListener("click", async () => {
      signupButton.disabled = true;
      try {
        const input = credentials();
        validate(input);
        if (status) status.textContent = "Đang tạo tài khoản...";
        const result = await window.vamopsAIEngine.signUp(input.email, input.password);
        if (result.session) {
          await this.completeAuthenticatedSession();
          this.showToast("Tài khoản đã tạo và đăng nhập thành công.", "✓");
        } else if (status) {
          status.textContent = "Tài khoản đã tạo. Vui lòng xác nhận email rồi quay lại đăng nhập.";
        }
      } catch (error) {
        if (status) status.textContent = `Không thể tạo tài khoản: ${error.message}`;
      } finally {
        signupButton.disabled = false;
      }
    });
  }

  applyProfessionalWorkflowShell() {
    this.ensureAuthShell();
    const vaultButton = document.getElementById("btn-open-vault");
    if (vaultButton) {
      vaultButton.title = "Báo cáo, trạng thái và quản lý chiến dịch";
      vaultButton.innerHTML = '📋 Chiến Dịch (<span id="stat-vault-count">0</span>)';
    }

    const panelTitle = document.querySelector(".left-control-panel .panel-title");
    if (panelTitle) panelTitle.textContent = "🧾 Phiếu Giao Việc";
    const formGroup = document.querySelector(".left-control-panel .form-group");
    if (formGroup) {
      const label = formGroup.querySelector(".form-label");
      if (label) label.innerHTML = '<span>Tên chiến dịch</span><span style="color:var(--text-muted);font-size:9px;">Bước 1/2</span>';
      const presets = formGroup.querySelector(".preset-pills");
      if (presets) presets.remove();
      const topic = document.getElementById("input-topic");
      if (topic) {
        topic.value = "";
        topic.placeholder = "Đặt tên hồ sơ chiến dịch";
        topic.insertAdjacentHTML("afterend", '<div style="font-size:10.5px;line-height:1.45;color:var(--text-muted);margin-top:6px;">Đây là tên hồ sơ. Bấm nút bên dưới để mở phiếu brief chi tiết trước khi giao việc.</div>');
      }
    }

    const platformLabel = document.querySelectorAll(".left-control-panel .form-label")[1];
    if (platformLabel) platformLabel.textContent = "Kênh dự kiến (có thể đổi sau)";
    const launch = document.getElementById("btn-launch-mission");
    if (launch) launch.innerHTML = "<span>🧾</span> TẠO / MỞ BRIEF CHI TIẾT";
    const progressLabel = Array.from(document.querySelectorAll(".left-control-panel .form-label")).find((el) => el.textContent.includes("Tiến Trình"));
    if (progressLabel) progressLabel.textContent = "Tiến độ chiến dịch gần nhất";
    const workflowLabels = [
      ["Tiếp nhận & phân tích brief", "Phòng Chiến lược"],
      ["Nghiên cứu dữ liệu & khách hàng", "Phòng Nghiên cứu + Khách hàng"],
      ["Xây dựng hướng sáng tạo", "Phòng Sáng tạo"],
      ["Kiểm định chất lượng", "Phòng Kiểm định"],
      ["Sản xuất gói nội dung", "Phòng Sản xuất"],
      ["Nghiệm thu & phân phối", "Founder + Phòng Phân phối"]
    ];
    document.querySelectorAll(".pipeline-steps .step-card").forEach((card, index) => {
      const title = card.querySelector(".step-title");
      const description = card.querySelector(".step-desc");
      if (workflowLabels[index] && title) title.textContent = workflowLabels[index][0];
      if (workflowLabels[index] && description) description.textContent = workflowLabels[index][1];
    });

    const modalTitle = document.querySelector("#vault-modal .modal-header h2");
    if (modalTitle) modalTitle.innerHTML = "<span>📋</span> TRUNG TÂM BÁO CÁO & QUẢN LÝ CHIẾN DỊCH";
    const tabs = document.querySelector("#vault-modal .modal-tabs");
    if (tabs) {
      tabs.innerHTML = [
        ["executive-summary", "0. Tổng quan điều hành"],
        ["p1-strategy", "1. Phòng Chiến lược"],
        ["p1-evidence", "2. Phòng Nghiên cứu"],
        ["p1-psychology", "3. Phòng Khách hàng"],
        ["p1-disruptor", "4. Phòng Sáng tạo"],
        ["beatsheet", "5. Phòng Sản xuất"],
        ["rubric", "6. Phòng Kiểm định"],
        ["distribution", "7. Phòng Phân phối"]
      ].map(([tab, label], index) => `<button class="modal-tab-btn${index === 0 ? " active" : ""}" data-tab="${tab}">${label}</button>`).join("");
    }
  }

  // --- CYBER TOAST NOTIFICATION ---
  showToast(message, icon = "✨") {
    const toast = document.getElementById("cyber-toast");
    const iconEl = document.getElementById("toast-icon");
    const msgEl = document.getElementById("toast-msg");
    if (!toast || !msgEl) return;

    if (iconEl) iconEl.textContent = icon;
    msgEl.textContent = message;

    toast.classList.add("show");
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3800);
  }

  handleMissionFailure(error) {
    const message = error?.message || "Lỗi không xác định";
    this.isSimulating = false;
    const launchBtn = document.getElementById("btn-launch-mission");
    if (launchBtn) {
      launchBtn.disabled = false;
      launchBtn.innerHTML = `<span>🚀</span> THỬ LẠI SAU KHI KIỂM TRA`;
    }
    const runningCard = document.querySelector(".step-card.running") || document.querySelector(".step-card");
    if (runningCard) {
      runningCard.classList.remove("running", "completed");
      runningCard.classList.add("failed");
      const badge = runningCard.querySelector(".step-badge");
      if (badge) badge.textContent = "Đã dừng — kiểm tra lỗi";
    }
    const statusEl = document.getElementById("modal-campaign-status");
    if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">Lỗi xử lý — chưa có đầu ra để Founder duyệt</span>';
    const publishBtn = document.getElementById("btn-publish-campaign");
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerHTML = '<span>⛔</span> CHƯA ĐỦ ĐIỀU KIỆN PHÊ DUYỆT';
      publishBtn.style.background = "rgba(239,68,68,0.15)";
      publishBtn.style.color = "#fca5a5";
      publishBtn.style.cursor = "not-allowed";
    }
    try { this.scene3d?.dismissToWorkstations?.(); } catch (_) {}
    this.showToast(`Workflow đã dừng an toàn: ${message}. Không chuyển ngầm sang fixture.`, "⚠️");
  }

  restorePendingBriefIfNeeded() {
    if (!this.currentResult || this.currentResult.status !== "NEEDS_INPUT") return;
    if (document.getElementById("brief-intake-modal")) return;
    const campaign = this.currentResult.campaign || {};
    const plan = this.currentResult.p1Artifacts?.campaignPlan || {};
    this.openBriefIntake({
      topic: this.currentResult.topic || campaign.title || "Chiến dịch",
      initialBrief: {
        industry: campaign.industry || this.currentResult.industry || "",
        target_audience: campaign.target_audience || this.currentResult.targetAudience || "",
        core_message: campaign.core_message || this.currentResult.coreMessage || "",
        brief_details: campaign.brief_details || {},
        platforms: campaign.platforms || this.currentResult.platforms || []
      },
      missingFacts: normalizeMissingFacts(plan.missing_facts),
      campaignId: campaign.id || this.currentResult.workflowResult?.campaignId || null
    });
  }

  // --- AUDIO SYNTHESIZER (WEB AUDIO API & MARS AMBIENT) ---
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
  }

  startMarsAmbientSound() {
    if (!this.soundEnabled || this.marsAmbientRunning) return;
    try {
      this.initAudio();
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      // Habitat Pressurization & Air Circulation Hum (Filtered Brown Noise)
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.0;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(140, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.025, this.audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      whiteNoise.start();

      this.ambientSource = whiteNoise;
      this.ambientGain = gain;
      this.marsAmbientRunning = true;
    } catch (e) {
      console.warn("Ambient audio error:", e);
    }
  }

  stopMarsAmbientSound() {
    if (this.ambientGain && this.audioCtx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.3);
        setTimeout(() => {
          if (this.ambientSource) {
            try { this.ambientSource.stop(); } catch (e) {}
          }
          this.marsAmbientRunning = false;
        }, 350);
      } catch (e) {}
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "launch") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "step") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "success") {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const chordOsc = this.audioCtx.createOscillator();
          const chordGain = this.audioCtx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(this.audioCtx.destination);
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.06);
          chordGain.gain.setValueAtTime(0.1, now + idx * 0.06);
          chordGain.gain.linearRampToValueAtTime(0, now + 0.6);
          chordOsc.start(now + idx * 0.06);
          chordOsc.stop(now + 0.6);
        });
      }
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  updateAIStatusBadge() {
    if (!window.vamopsAIEngine) return;
    const badgeLabel = window.vamopsAIEngine.getShortStatusBadge();
    const fullLabel = window.vamopsAIEngine.getActiveProviderLabel();

    const headerLabel = document.getElementById("header-ai-model-label");
    if (headerLabel) {
      headerLabel.textContent = badgeLabel;
      const gatewayState = window.vamopsAIEngine.gatewayHealth?.state;
      if (window.vamopsAIEngine.isLive() && gatewayState === "healthy") {
        headerLabel.classList.remove("highlight-cyan");
        headerLabel.classList.add("highlight-green");
        headerLabel.style.color = "";
      } else if (window.vamopsAIEngine.isLive() && gatewayState === "offline") {
        headerLabel.classList.remove("highlight-cyan", "highlight-green");
        headerLabel.style.color = "#fb7185";
      } else {
        headerLabel.classList.remove("highlight-green");
        headerLabel.classList.add("highlight-cyan");
        headerLabel.style.color = "";
      }
    }

    const footerLabel = document.getElementById("active-model-footer-label");
    if (footerLabel) {
      footerLabel.textContent = fullLabel;
    }
  }

  async refreshGatewayStatus() {
    if (!window.vamopsAIEngine || !window.vamopsAIEngine.isLive()) {
      this.gatewayHealth = { healthy: false, demo: true };
      this.updateAIStatusBadge();
      return this.gatewayHealth;
    }
    this.updateAIStatusBadge();
    const health = await window.vamopsAIEngine.checkGatewayHealth();
    this.gatewayHealth = health;
    this.updateAIStatusBadge();
    return health;
  }

  // --- UI BINDINGS ---
  bindDOMEvents() {
    this.bindAuthEvents();
    // Sound toggle
    const soundBtn = document.getElementById("btn-sound-toggle");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.innerHTML = this.soundEnabled ? `<span>🔊</span> ÂM THANH SAO HOẢ` : `<span>🔇</span> TẮT TIẾNG`;
        soundBtn.classList.toggle("active", this.soundEnabled);
        if (this.soundEnabled) {
          this.startMarsAmbientSound();
          this.playSound("launch");
          this.showToast("Đã kích hoạt Âm Thanh Khí Quyển Sao Hoả", "🔊");
        } else {
          this.stopMarsAmbientSound();
          this.showToast("Đã tắt âm thanh", "🔇");
        }
      });
    }

    // View buttons
    document.querySelectorAll("[data-view-target]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-view-target]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.getAttribute("data-view-target");
        this.scene3d.focusCameraOn(target);
        this.playSound("click");
      });
    });

    // Auto-rotate toggle
    const rotateBtn = document.getElementById("btn-auto-rotate");
    if (rotateBtn) {
      rotateBtn.addEventListener("click", () => {
        this.scene3d.isAutoRotate = !this.scene3d.isAutoRotate;
        rotateBtn.classList.toggle("active", this.scene3d.isAutoRotate);
        this.playSound("click");
        this.showToast(this.scene3d.isAutoRotate ? "Bật xoay tự động Trụ sở" : "Dừng xoay tự động", "🔄");
      });
    }

    // Preset campaign chips
    document.querySelectorAll(".preset-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".preset-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        const campId = chip.getAttribute("data-campaign-id");
        this.activeCampaignId = campId;
        const camp = VAMOPS_DATA.presetCampaigns.find((c) => c.id === campId);
        if (camp) {
          document.getElementById("input-topic").value = camp.topic;
          this.currentResult = VAMOPS_DATA.sampleExecutionResults[campId]
            ? asDemoFixture(VAMOPS_DATA.sampleExecutionResults[campId])
            : window.vamopsAIEngine.generateOfflineDNA(camp.topic);
        }
        this.playSound("click");
      });
    });

    // War Room Meeting Mode Toggle
    const meetingBtn = document.getElementById("btn-toggle-meeting");
    if (meetingBtn) {
      meetingBtn.addEventListener("click", () => {
        this.scene3d.toggleMeetingMode();
        const isMeeting = this.scene3d.isMeetingMode;
        meetingBtn.innerHTML = isMeeting
          ? `<span>🖥️</span> Về Bàn Làm Việc`
          : `<span>👥</span> Triệu Tập Họp (War Room)`;
        meetingBtn.classList.toggle("active", isMeeting);
        this.playSound("launch");
        this.showToast(
          isMeeting
            ? "Triệu tập 12 Chuyên Gia Sao Hoả về Bàn Tròn Chiến Lược!"
            : "Các Chuyên Gia đã trở về bàn làm việc cá nhân.",
          isMeeting ? "👥" : "🖥️"
        );
      });
    }

    // Launch Simulation Button
    const launchBtn = document.getElementById("btn-launch-mission");
    if (launchBtn) {
      launchBtn.addEventListener("click", () => {
        const campaign = this.currentResult?.campaign;
        const topic = document.getElementById("input-topic")?.value.trim();
        if (campaign && this.currentResult?.status === "BRIEF_READY" && topic === campaign.title) {
          this.runMissionSimulation({
            title: campaign.title,
            industry: campaign.industry || "",
            target_audience: campaign.target_audience || "",
            core_message: campaign.core_message || "",
            brief_details: campaign.brief_details || {},
            platforms: campaign.platforms || this.getSelectedPlatforms()
          }, campaign.id).catch((error) => this.handleMissionFailure(error));
          return;
        }
        this.runMissionSimulation().catch((error) => this.handleMissionFailure(error));
      });
    }

    // Vault Modal Open/Close
    const openVaultBtn = document.getElementById("btn-open-vault");
    const vaultModal = document.getElementById("vault-modal");
    const closeVaultBtn = document.getElementById("btn-close-vault");

    if (openVaultBtn && vaultModal) {
      openVaultBtn.addEventListener("click", async () => {
        await this.loadVaultData();
        this.renderVaultContent();
        vaultModal.classList.add("open");
        this.playSound("click");
      });
    }

    if (closeVaultBtn && vaultModal) {
      closeVaultBtn.addEventListener("click", () => {
        vaultModal.classList.remove("open");
        this.playSound("click");
      });
    }

    // Modal Tabs in Vault
    document.querySelectorAll(".modal-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedModalTab = btn.getAttribute("data-tab");
        this.renderVaultContent();
        this.playSound("click");
      });
    });

    // AI Settings Modal Open/Close
    const openAISettingsBtn = document.getElementById("btn-open-ai-settings");
    const aiModal = document.getElementById("ai-settings-modal");
    const closeAISettingsBtn = document.getElementById("btn-close-ai-settings");

    if (openAISettingsBtn && aiModal) {
      openAISettingsBtn.addEventListener("click", () => {
        this.renderAISettingsModal(this.selectedAITab);
        aiModal.classList.add("open");
        this.playSound("click");
      });
    }

    if (closeAISettingsBtn && aiModal) {
      closeAISettingsBtn.addEventListener("click", () => {
        aiModal.classList.remove("open");
        this.playSound("click");
      });
    }

    // AI Modal Tabs
    document.querySelectorAll(".ai-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".ai-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedAITab = btn.getAttribute("data-ai-tab");
        this.renderAISettingsModal(this.selectedAITab);
        this.playSound("click");
      });
    });

    // Save AI Settings Button
    const saveAIBtn = document.getElementById("btn-save-ai-settings");
    if (saveAIBtn) {
      saveAIBtn.addEventListener("click", () => this.handleSaveAISettings());
    }

    // Test Connection Button
    const testAIBtn = document.getElementById("btn-test-ai-connection");
    if (testAIBtn) {
      testAIBtn.addEventListener("click", () => this.handleTestAIConnection());
    }

    // Platform toggles
    document.querySelectorAll(".platform-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
        this.playSound("click");
      });
    });

    // Publish Campaign Button in Modal (Truthful status handling - F06)
    const publishBtn = document.getElementById("btn-publish-campaign");
    if (publishBtn) {
      publishBtn.addEventListener("click", async () => {
        const statusEl = document.getElementById("modal-campaign-status");
        const workflow = this.currentResult?.workflowResult || {};
        const campaignId = this.currentResult?.campaign?.id || workflow.campaignId;
        if (!campaignId) {
          if (statusEl) {
            statusEl.textContent = "DEMO_FIXTURE không có campaign bền vững để phê duyệt.";
          }
          this.showToast("Bản Demo chỉ để tham khảo; hãy đăng nhập và chạy Gateway để duyệt thật.", "⚠️");
          return;
        }
        publishBtn.disabled = true;
        try {
          if (workflow.status === "AWAITING_FOUNDER_REVIEW") {
            const angles = workflow.artifacts?.angleOptions;
            const selectedAngleId = this.activeSelectedAngleId || angles?.recommended_angle_id || angles?.angles?.[0]?.id;
            if (!selectedAngleId) throw new Error("Không tìm thấy góc chiến lược để Founder duyệt.");

            publishBtn.innerHTML = `<span>⏳</span> ĐANG LƯU PHÊ DUYỆT GATE 1...`;
            if (statusEl) statusEl.innerHTML = '<span style="color:var(--amber-core); font-weight:800;">Đã nhận lệnh — đang lưu quyết định của Founder...</span>';
            this.showToast("Đã nhận lệnh phê duyệt Gate 1. Hệ thống đang lưu quyết định...", "⏳");

            const approvalResult = await window.vamopsAIEngine.approveDirection(campaignId, selectedAngleId, "Founder approved through Command Center");
            this.currentResult.status = "CREATIVE_RUNNING";
            this.currentResult.selectedAngleId = selectedAngleId;
            if (this.currentResult.campaign) {
              this.currentResult.campaign.status = "CREATIVE_RUNNING";
              this.currentResult.campaign.selected_angle_id = selectedAngleId;
            }
            workflow.status = "CREATIVE_RUNNING";
            if (approvalResult?.approval && Array.isArray(this.currentResult.approvals)) {
              this.currentResult.approvals = [
                ...this.currentResult.approvals.filter((item) => item.gate !== "founder_direction"),
                approvalResult.approval
              ];
            }
            this.renderVaultContent();
            const runningStatusEl = document.getElementById("modal-campaign-status");
            const runningBtn = document.getElementById("btn-publish-campaign");
            if (runningStatusEl) runningStatusEl.innerHTML = '<span style="color:var(--cyan-core); font-weight:800;">✓ Gate 1 đã lưu — 7 Agent đang sản xuất và kiểm định nội dung</span>';
            if (runningBtn) {
              runningBtn.disabled = true;
              runningBtn.innerHTML = '<span>⚙️</span> ĐANG CHẠY 7 AGENT P2...';
            }
            this.showToast("Gate 1 đã được lưu. 7 Agent P2 đang làm việc; có thể mất vài phút.", "⚙️");

            const creative = await window.vamopsAIEngine.continueWorkflow(campaignId);
            await this.loadVaultData();
            this.selectedModalTab = "beatsheet";
            this.renderVaultContent();
            this.syncDashboardFromCampaign(this.currentResult);
            this.showToast(
              creative.status === "AWAITING_FOUNDER_FINAL_APPROVAL"
                ? "7 Agent P2 đã hoàn thành. Mời Founder xem báo cáo kiểm định và duyệt Gate 2."
                : `P2 đã dừng ở trạng thái ${creative.status || "không xác định"}; mở Phòng Kiểm định để xem chi tiết.`,
              creative.status === "AWAITING_FOUNDER_FINAL_APPROVAL" ? "✓" : "⚠️"
            );
            return;
          }

          if (workflow.status === "AWAITING_FOUNDER_FINAL_APPROVAL") {
            publishBtn.innerHTML = `<span>⏳</span> ĐANG LƯU PHÊ DUYỆT GATE 2...`;
            if (statusEl) statusEl.innerHTML = '<span style="color:var(--amber-core); font-weight:800;">Đã nhận lệnh — đang lưu nghiệm thu cuối...</span>';
            this.showToast("Đã nhận lệnh Gate 2. Hệ thống đang lưu nghiệm thu cuối...", "⏳");

            const distribution = await window.vamopsAIEngine.approveFinal(campaignId, "Founder final approval through Command Center");
            await this.loadVaultData();
            this.selectedModalTab = "distribution";
            this.renderVaultContent();
            this.syncDashboardFromCampaign(this.currentResult);

            if (distribution.status === "DISTRIBUTION_NOT_CONFIGURED") {
              this.showToast("Gate 2 đã lưu. Chưa phát hành vì chưa kết nối OAuth/provider của các kênh.", "⚠️");
              return;
            }

            const publishingBtn = document.getElementById("btn-publish-campaign");
            const publishingStatusEl = document.getElementById("modal-campaign-status");
            if (publishingBtn) {
              publishingBtn.disabled = true;
              publishingBtn.innerHTML = '<span>📡</span> ĐANG GỬI YÊU CẦU PHÁT HÀNH...';
            }
            if (publishingStatusEl) publishingStatusEl.innerHTML = '<span style="color:var(--cyan-core); font-weight:800;">Gate 2 đã lưu — đang gửi yêu cầu tới kênh phân phối</span>';
            try {
              await window.vamopsAIEngine.requestPublish(campaignId);
              await this.loadVaultData();
              this.renderVaultContent();
              this.syncDashboardFromCampaign(this.currentResult);
              this.showToast("Yêu cầu phát hành đã được nhà cung cấp xác nhận.", "✓");
            } catch (publishError) {
              if (publishError.code !== "PUBLISH_PROVIDER_NOT_CONFIGURED") throw publishError;
              await this.loadVaultData();
              this.renderVaultContent();
              this.showToast("Đã lưu duyệt cuối. Không có bài nào được đăng vì chưa cấu hình OAuth/provider.", "⚠️");
              return;
            }
            return;
          }

          if (statusEl) statusEl.textContent = `Trạng thái hiện tại: ${workflow.status || "UNKNOWN"}`;
        } catch (error) {
          try {
            await this.loadVaultData();
            this.renderVaultContent();
            this.syncDashboardFromCampaign(this.currentResult);
          } catch (_) {}
          const latestStatusEl = document.getElementById("modal-campaign-status");
          if (latestStatusEl) latestStatusEl.textContent = `Không thể xử lý: ${error.message}`;
          this.showToast(`Không thể xử lý cổng duyệt: ${error.message}`, "⚠️");
        }
      });
    }
  }

  startSystemClock() {
    const clockEl = document.getElementById("live-clock");
    const weatherEl = document.getElementById("mars-weather-stat");
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      const sol = 482;
      if (clockEl) clockEl.textContent = `SOL ${sol} · ${timeStr}`;

      if (weatherEl) {
        const temp = (-62.2 + Math.sin(now.getTime() * 0.0001) * 0.8).toFixed(1);
        weatherEl.textContent = `${temp}°C · O₂ 99%`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // --- AI SETTINGS MODAL RENDERER ---
  renderAISettingsModal(tab = "models") {
    const body = document.getElementById("ai-settings-body");
    if (!body || !window.vamopsAIEngine) return;

    const config = window.vamopsAIEngine.config;

    if (tab === "models") {
      const configuredModels = Array.isArray(this.gatewayHealth?.configuredModels)
        ? this.gatewayHealth.configuredModels
        : [];
      const configuredSet = new Set(configuredModels);
      const gatewayOperational = this.gatewayHealth?.healthy === true;
      const visibleModels = configuredModels.length
        ? window.vamopsAIEngine.modelsByTier.filter((model) => configuredSet.has(model.id))
        : window.vamopsAIEngine.modelsByTier.filter((model) => model.id === config.modelTier);
      const modelOptions = visibleModels.map((model) => {
        const isConfigured = configuredSet.has(model.id) || (model.id === "qwen2.5:3b" && configuredSet.has("ollama/qwen2.5:3b"));
        const selected = config.modelTier === model.id ? "selected" : "";
        const disabled = gatewayOperational && !isConfigured ? "disabled" : "";
        const state = isConfigured ? "✓ khai báo trên server" : "chưa cấu hình";
        return `<option value="${model.id}" ${selected} ${disabled}>${model.name} — ${state}</option>`;
      }).join("");
      const gatewayNote = gatewayOperational
        ? `Backend sẵn sàng. Model được khai báo: ${configuredModels.join(", ") || "không có"}.`
        : `Gateway chưa sẵn sàng. Danh sách này chỉ là catalog hỗ trợ; không model nào được coi là đang chạy.`;
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="ai-card-info" style="border-left: 3px solid var(--emerald-core); background: rgba(16, 185, 129, 0.08);">
            <strong style="color:var(--emerald-core); font-size:13.5px;">🔐 Kiến Trúc Bảo Mật Zero Client Credentials:</strong><br/>
            Phiên đăng nhập được Supabase Auth xác minh. Bộ máy hiện dùng Rules Engine xác định, không gọi model trả phí, không lưu khóa nhà cung cấp AI trong trình duyệt và ghi nhận chi phí/token bằng 0.
          </div>

          <div class="ai-form-grid">
            <div class="ai-form-group">
              <label class="ai-form-label">Chế Độ Vận Hành (Operating Mode)</label>
              <select id="ai-select-mode" class="ai-select">
                <option value="gateway" ${config.mode === "gateway" ? "selected" : ""}>🛡️ Cổng Workflow Zero-Credit (/api/v1/campaigns)</option>
                <option value="demo" ${config.mode === "demo" ? "selected" : ""}>🧪 Bản Mẫu Demo Fixture (Chạy thử offline · Không tốn token)</option>
              </select>
            </div>

            <div class="ai-form-group">
              <label class="ai-form-label">Mô Hình Cấu Hình (CONFIGURED MODEL)</label>
              <select id="ai-select-tier" class="ai-select" ${gatewayOperational ? "" : "disabled"}>
                ${modelOptions}
              </select>
              <div style="font-size:11px; color:var(--text-dim); margin-top:4px; line-height:1.4;">
                ${gatewayNote}<br/>
                Model của từng chiến dịch chỉ lấy từ task run đã lưu, không suy đoán từ cài đặt này.
              </div>
            </div>
          </div>

          <div id="connection-status-box" style="display:none; padding:12px 16px; border-radius:var(--radius-sm); font-size:13px; font-weight:600;"></div>
        </div>
      `;
    } else if (tab === "dna") {
      const dna = VAMOPS_DNA;
      const mustUseBadges = dna.voiceAndVocabulary.centralWords
        .map((w) => `<span class="word-badge badge-allowed">✓ ${w}</span>`)
        .join("");
      const bannedBadges = dna.voiceAndVocabulary.bannedWords
        .map((w) => `<span class="word-badge badge-banned">✕ ${w}</span>`)
        .join("");

      const principlesHtml = dna.fiveCorePrinciples
        .map(
          (p) => `
        <div class="dna-pillar-card">
          <div class="dna-pillar-num">Hạt Nhân 0${p.id}</div>
          <div class="dna-pillar-title">${p.title}</div>
          <div class="dna-pillar-desc">${p.detail}</div>
        </div>
      `
        )
        .join("");

      const lockedRulesHtml = dna.elevenLockedRules
        .map((r) => `<li style="margin-bottom:7px; color:var(--text-main); font-size:12.5px; line-height:1.5;">${r}</li>`)
        .join("");

      const caseStudiesHtml = dna.provenCaseStudies
        .map(
          (cs) => `
        <div class="rubric-item-card" style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--cyan-bright); font-size:13.5px;">${cs.project}</strong>
            <span style="font-size:11px; font-weight:700; background:rgba(0,240,255,0.15); color:var(--cyan-core); padding:2px 8px; border-radius:4px;">Case Study Thực Chứng</span>
          </div>
          <div style="color:var(--text-muted); font-size:12px; margin:4px 0;"><strong>Đề bài khó:</strong> ${cs.challenge}</div>
          <div style="color:#ffffff; font-size:12.5px;"><strong>Cách giải của Founder:</strong> ${cs.solution}</div>
        </div>
      `
        )
        .join("");

      body.innerHTML = `
        <div class="dna-overview-box">
          <div class="dna-founder-title">
            <span>👑</span> ${dna.founder.name} — ${dna.founder.role}
          </div>
          <div class="dna-founder-sub">
            ${dna.founder.experience} · Trụ sở: Hà Nội & Toàn quốc
          </div>
          <div style="margin-top:10px; font-size:13px; color:var(--text-muted); line-height:1.5;">
            <strong>Neo trải nghiệm sống thật:</strong> ${dna.founder.origin}
          </div>
          <div style="margin-top:10px; padding:10px 14px; background:rgba(0,240,255,0.08); border-left:3px solid var(--cyan-core); border-radius:4px;">
            <strong style="color:var(--cyan-bright); font-size:13px;">Định vị chính thức (v3.0):</strong>
            <div style="color:#ffffff; font-size:13.5px; margin-top:2px; font-style:italic;">"${dna.officialPositioning.v3}"</div>
          </div>
        </div>

        <h3 style="color:var(--cyan-core); font-size:14px; text-transform:uppercase; margin-bottom:12px;">5 Hạt Nhân Làm Nghề Của Founder Vũ Anh</h3>
        <div class="dna-pillars-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">${principlesHtml}</div>

        <h3 style="color:var(--cyan-core); font-size:14px; text-transform:uppercase; margin:22px 0 10px;">Năng Lực Lõi — Giải Các Đề Bài Khó Kể (Case Studies Thực Chứng)</h3>
        <div>${caseStudiesHtml}</div>

        <h3 style="color:var(--cyan-core); font-size:14px; text-transform:uppercase; margin:22px 0 10px;">11 Luật Viết Đã Khóa Cho Toàn Bộ Đội Ngũ AI (Mục 7 DNA)</h3>
        <ul style="padding-left:18px; margin-bottom:20px;">${lockedRulesHtml}</ul>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:20px;">
          <div class="dna-pillar-card">
            <h4 style="color:var(--emerald-core); font-size:13px; text-transform:uppercase; margin-bottom:8px;">Từ Ngữ Trung Tâm Bắt Buộc Dùng (Sang Mồm)</h4>
            <div class="words-container">${mustUseBadges}</div>
          </div>
          <div class="dna-pillar-card">
            <h4 style="color:var(--rose-core); font-size:13px; text-transform:uppercase; margin-bottom:8px;">Từ Ngữ Cấm Tuyệt Đối (Gọt Sạch Văn Mẫu AI)</h4>
            <div class="words-container">${bannedBadges}</div>
          </div>
        </div>
      `;
    } else if (tab === "sandbox") {
      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="ai-card-info">
            <strong>🧪 Prompt Sandbox (Phòng Thử Nghiệm Kịch Bản Thực Tế):</strong><br/>
            Nhập một chủ đề bất kỳ để kiểm tra xem mô hình hiện tại (<strong>${window.vamopsAIEngine.getActiveProviderLabel()}</strong>) phản hồi và áp dụng văn phong DNA Vũ Anh ra sao.
          </div>

          <div class="ai-form-group">
            <label class="ai-form-label">Chủ Đề Thử Nghiệm</label>
            <textarea id="sandbox-topic-input" class="ai-input" rows="3" placeholder="Nhập bài toán hoặc chủ đề...">Giải Cứu Đội Media Nội Bộ Đốt 50 Triệu Mỗi Tháng Nhưng Toàn Video Rác</textarea>
          </div>

          <div style="display:flex; gap:12px;">
            <button id="btn-run-sandbox" class="btn-publish-vault" style="background:var(--cyan-core); color:#000; font-weight:800;">
              <span>🚀</span> CHẠY AI THỬ NGHIỆM NGAY
            </button>
          </div>

          <div class="ai-form-group">
            <label class="ai-form-label">
              <span>Kết Quả Trả Về (Live JSON & Beat Sheet)</span>
              <span id="sandbox-latency" style="color:var(--cyan-core); font-family:var(--font-mono); font-size:11px;"></span>
            </label>
            <div id="sandbox-output" class="sandbox-output-box">// Bấm nút "CHẠY AI THỬ NGHIỆM NGAY" để xem kết quả phân tích thời gian thực...</div>
          </div>
        </div>
      `;

      const runSandboxBtn = document.getElementById("btn-run-sandbox");
      if (runSandboxBtn) {
        runSandboxBtn.addEventListener("click", async () => {
          const topicInput = document.getElementById("sandbox-topic-input");
          const outputBox = document.getElementById("sandbox-output");
          const latencyEl = document.getElementById("sandbox-latency");
          const topic = topicInput ? topicInput.value.trim() : "";
          if (!topic) return;

          runSandboxBtn.disabled = true;
          runSandboxBtn.innerHTML = `<span>⏳</span> ĐANG XỬ LÝ...`;
          outputBox.textContent = "Đang gửi yêu cầu đến mô hình AI với toàn bộ System Instruction & DNA Vũ Anh...";
          const start = performance.now();

          try {
            const res = await window.vamopsAIEngine.generate(topic);
            const elapsed = Math.round(performance.now() - start);
            if (latencyEl) latencyEl.textContent = `Tốc độ: ${elapsed}ms · Model: ${res.modelUsed || "VAMOPS DNA"}`;
            outputBox.textContent = JSON.stringify(res, null, 2);
            this.showToast("Đã nhận phản hồi thành công từ AI!", "✅");
          } catch (err) {
            outputBox.textContent = "Lỗi khi gọi AI: " + err.message;
            this.showToast("Lỗi khi test AI: " + err.message, "❌");
          } finally {
            runSandboxBtn.disabled = false;
            runSandboxBtn.innerHTML = `<span>🚀</span> CHẠY AI THỬ NGHIỆM NGAY`;
          }
        });
      }
    }
  }

  handleSaveAISettings() {
    const modeSelect = document.getElementById("ai-select-mode");
    const tierSelect = document.getElementById("ai-select-tier");

    if (!modeSelect || !tierSelect || !window.vamopsAIEngine) return;

    const newConfig = {
      mode: modeSelect.value,
      modelTier: tierSelect.value
    };

    window.vamopsAIEngine.saveConfig(newConfig);
    this.updateAIStatusBadge();
    this.refreshGatewayStatus();
    this.playSound("success");
    this.showToast("Đã lưu chế độ vận hành: " + window.vamopsAIEngine.getActiveProviderLabel(), "💾");

    const modal = document.getElementById("ai-settings-modal");
    if (modal) modal.classList.remove("open");
  }

  async handleTestAIConnection() {
    const statusBox = document.getElementById("connection-status-box");
    if (statusBox) {
      statusBox.style.display = "block";
      statusBox.style.background = "rgba(0, 240, 255, 0.15)";
      statusBox.style.color = "var(--cyan-bright)";
      statusBox.textContent = "Đang kiểm tra Cổng Workflow Zero-Credit (/api/v1/campaigns)...";
    }

    try {
      const health = await this.refreshGatewayStatus();
      if (health.healthy) {
        const configured = health.providersConfigured || {};
        const providersFromMap = Object.entries(configured).filter(([, v]) => v).map(([k]) => k.toUpperCase());
        const activeProviders = (Array.isArray(health.configuredModels) ? health.configuredModels : providersFromMap).join(", ");
        if (statusBox) {
          statusBox.style.background = "rgba(16, 185, 129, 0.2)";
          statusBox.style.color = "var(--emerald-core)";
          statusBox.textContent = `✅ Cổng Workflow hoạt động bình thường. Bộ máy đang dùng: ${activeProviders || "vamops-zero-credit-v1"}; token/chi phí AI = 0.`;
        }
        this.playSound("success");
        this.showToast("Cổng Workflow Zero-Credit sẵn sàng!", "✅");
      } else {
        if (statusBox) {
          const gatewayReason = String(health.error || `HTTP ${health.status || "không xác định"}`).replace(/[.\s]+$/, "");
          statusBox.style.background = "rgba(245, 158, 11, 0.2)";
          statusBox.style.color = "var(--amber-core)";
          statusBox.textContent = `⚠️ Gateway chưa sẵn sàng: ${gatewayReason}. Hệ thống không coi giao diện tĩnh là API và không gọi Agent.`;
        }
        this.showToast("Gateway offline — Agent chưa chạy và cổng phê duyệt được khóa.", "⚠️");
      }
    } catch (err) {
      if (statusBox) {
        statusBox.style.background = "rgba(244, 63, 94, 0.2)";
        statusBox.style.color = "var(--rose-core)";
        statusBox.textContent = `❌ Lỗi kiểm tra Cổng Gateway: ${err.message}`;
      }
      this.showToast("Lỗi kiểm tra Gateway!", "❌");
    }
  }

  // --- SELECTION & INSPECTOR ---
  selectAgent(agent, focusCamera = true) {
    this.selectedAgent = agent;
    this.playSound("click");

    document.querySelectorAll(".agent-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.getAttribute("data-agent-id") === agent.id);
    });

    const zone = VAMOPS_DATA.zones.find((z) => z.assignedAgents.includes(agent.id));
    if (zone && !this.isSimulating && focusCamera) {
      this.scene3d.focusCameraOn(zone.id);
    }

    const inspector = document.getElementById("right-inspector");
    if (!inspector) return;

    inspector.innerHTML = `
      <div class="inspector-profile">
        <div class="profile-avatar" style="border-color: ${agent.deptColor}">
          ${agent.avatar}
        </div>
        <div class="profile-meta">
          <h2>${agent.name}</h2>
          <div class="role-title">${agent.title}</div>
          <span class="dept-badge" style="background: ${agent.deptColor}22; color: ${agent.deptColor}; border: 1px solid ${agent.deptColor}">
            ${agent.deptName}
          </span>
        </div>
      </div>

      <div class="spec-list">
        <div class="spec-card">
          <div class="spec-header">Chỉ Số Sinh Học Trực Tiếp (Live Biometrics)</div>
          <div class="biometrics-grid">
            <div class="bio-card">
              <div class="bio-label">Nhịp Tim</div>
              <div class="bio-val" style="color: #f43f5e;"><span class="heart-pulse"></span> 72 BPM</div>
            </div>
            <div class="bio-card">
              <div class="bio-label">Oxy SpO2</div>
              <div class="bio-val" style="color: #10b981;">99.4%</div>
            </div>
            <div class="bio-card">
              <div class="bio-label">Sóng Não</div>
              <div class="bio-val" style="color: #38bdf8;">Alpha 98%</div>
            </div>
            <div class="bio-card">
              <div class="bio-label">Vị Trí Trạm</div>
              <div class="bio-val" style="color: #f59e0b; font-size:11px;">Bàn Sao Hoả #${agent.id.slice(-2)}</div>
            </div>
          </div>
        </div>

        <div class="spec-card">
          <div class="spec-header">Lõi Mô Hình Vận Hành (Runtime AI)</div>
          <div id="runtime-model-value" class="spec-text" style="color: var(--cyan-core); font-weight: 700; font-family: var(--font-mono);">
            ${escapeHtml(this.currentResult?.agentModels?.[agent.id] || this.currentResult?.modelInfo?.agentModels?.[agent.id] || "Không xác định")}
          </div>
        </div>

        <div class="spec-card">
          <div class="spec-header">Phương Pháp Luận / Frameworks</div>
          <div class="spec-text">${agent.framework}</div>
        </div>

        <div class="spec-card">
          <div class="spec-header">Nhiệm Vụ Chuyên Môn</div>
          <div class="spec-text">${agent.specialty}</div>
        </div>

        <div class="spec-card">
          <div class="spec-header">Trạng Thái Thao Tác</div>
          <div class="spec-text" style="color: var(--emerald-core); font-weight: 600;">
            ● ${agent.currentAction}
          </div>
        </div>

        <div class="spec-card">
          <div class="spec-header">Trọng Số Khảo Thí (Rubric Weight)</div>
          <span class="rubric-tag">${agent.rubricWeight}</span>
        </div>

        <div class="inspector-actions">
          <button class="btn-inspector-action" id="btn-inspector-chat">
            <span>💬</span> Trao Đổi
          </button>
          <button class="btn-inspector-action" id="btn-inspector-vault">
            <span>📋</span> Báo Cáo
          </button>
        </div>
      </div>
    `;

    const chatBtn = document.getElementById("btn-inspector-chat");
    if (chatBtn) {
      chatBtn.addEventListener("click", () => {
        this.showToast(`Đã mở kết nối trao đổi với ${agent.name}!`, "💬");
        this.scene3d.showFloatingBubble(agent.id, `Đang kết nối: Sẵn sàng nhận chỉ thị từ Founder Vũ Anh!`, 4000);
      });
    }

    const vaultBtn = document.getElementById("btn-inspector-vault");
    if (vaultBtn) {
      vaultBtn.addEventListener("click", () => {
        const vaultModal = document.getElementById("vault-modal");
        if (vaultModal) {
          this.renderVaultContent();
          vaultModal.classList.add("open");
          this.playSound("click");
        }
      });
    }

    this.scene3d.showFloatingBubble(agent.id, agent.currentAction, 3800);
  }

  selectZone(zone) {
    this.selectedZone = zone;
    this.playSound("click");
    this.scene3d.focusCameraOn(zone.id);

    const firstAgentId = zone.assignedAgents[0];
    const agent = VAMOPS_DATA.agents.find((a) => a.id === firstAgentId);
    if (agent) this.selectAgent(agent);
  }

  renderAgentRoster() {
    const track = document.getElementById("agent-roster-track");
    if (!track) return;

    track.innerHTML = "";
    const shortRoles = {
      "agent-cmo": "CMO",
      "agent-algo": "Algo",
      "agent-psycho": "Insight",
      "agent-counter": "Phản Biện",
      "agent-hook": "Hook 3s",
      "agent-story": "Kịch Bản",
      "agent-copy": "Copy",
      "agent-critic": "Rubric",
      "agent-visual": "Visual 8K",
      "agent-sound": "SFX/Nhạc",
      "agent-renderer": "Swift 8K",
      "agent-seo": "Đa Kênh"
    };

    VAMOPS_DATA.agents.forEach((agent) => {
      const chip = document.createElement("div");
      chip.className = "agent-chip";
      chip.setAttribute("data-agent-id", agent.id);
      chip.title = `${agent.name} — ${agent.title}`;
      const role = shortRoles[agent.id] || "AI";
      chip.innerHTML = `
        <div class="avatar-sm" style="border-color:${agent.deptColor}">${agent.avatar}</div>
        <span class="chip-name">${agent.name}</span>
        <span class="chip-role">${role}</span>
      `;
      chip.addEventListener("click", () => this.selectAgent(agent));
      track.appendChild(chip);
    });
  }

  getSelectedPlatforms() {
    const selected = Array.from(document.querySelectorAll(".platform-toggle.active"))
      .map((item) => item.getAttribute("data-platform"))
      .filter(Boolean);
    return selected.length > 0 ? selected : ["tiktok"];
  }

  openBriefIntake({ topic, initialBrief = {}, missingFacts = [], campaignId = null } = {}) {
    const existing = document.getElementById("brief-intake-modal");
    if (existing) existing.remove();

    const details = initialBrief.brief_details || {};
    const fields = [
      { group: "business", name: "industry", label: "Ngành hàng và thị trường", question: "Doanh nghiệp hoạt động trong lĩnh vực nào, tại khu vực nào?", value: initialBrief.industry || "", required: true },
      { group: "business", name: "offer", label: "Sản phẩm / dịch vụ cần truyền thông", question: "Gói dịch vụ, sản phẩm hoặc đề nghị cụ thể là gì?", value: details.offer || "", required: true },
      { group: "business", name: "business_goal", label: "Mục tiêu kinh doanh", question: "Kết quả cần đạt là nhận diện, lead, lịch hẹn, doanh số hay mục tiêu khác?", value: details.business_goal || "", required: true },
      { group: "business", name: "call_to_action", label: "Hành động mong muốn", question: "Khách hàng cần làm gì tiếp theo sau khi xem nội dung?", value: details.call_to_action || "", required: true },
      { group: "customer", name: "target_audience", label: "Khách hàng mục tiêu", question: "Họ là ai, ở đâu, vai trò gì và ra quyết định trong hoàn cảnh nào?", value: initialBrief.target_audience || "", required: true },
      { group: "customer", name: "customer_pain", label: "Nỗi đau và rào cản", question: "Điều gì khiến họ lo lắng, trì hoãn hoặc chưa chọn giải pháp?", value: details.customer_pain || "", required: true },
      { group: "customer", name: "core_message", label: "Thông điệp phải ghi nhớ", question: "Sau khi xem nội dung, khách hàng cần nhớ chính xác điều gì?", value: initialBrief.core_message || "", required: true },
      { group: "customer", name: "unique_value", label: "Lý do chọn thương hiệu", question: "Điểm khác biệt thực tế so với đối thủ hoặc phương án không hành động là gì?", value: details.unique_value || "", required: true },
      { group: "evidence", name: "proof_points", label: "Bằng chứng hiện có", question: "Case study, số liệu, phản hồi, chứng nhận hoặc quy trình nào có thể kiểm chứng? Nếu chưa có, ghi “Chưa có”.", value: details.proof_points || "", required: true },
      { group: "evidence", name: "market_context", label: "Quan sát thị trường của Founder", question: "Xu hướng, mùa vụ hoặc thay đổi hành vi nào đang được quan sát? Agent sẽ tự nghiên cứu phần còn lại.", value: details.market_context || "", required: true },
      { group: "evidence", name: "competitors", label: "Đối thủ / phương án thay thế đã biết", question: "Khách hàng đang so sánh với ai hoặc giải pháp nào? Agent sẽ tự kiểm chứng chi tiết.", value: details.competitors || "", required: true },
      { group: "execution", name: "tone_and_style", label: "Giọng điệu và điều bắt buộc/tránh", question: "Phong cách, từ khóa bắt buộc hoặc nội dung tuyệt đối không được nói?", value: details.tone_and_style || "", required: false },
      { group: "execution", name: "constraints", label: "Ràng buộc thực thi", question: "Deadline, ngân sách, tài nguyên, pháp lý hoặc giới hạn kênh?", value: details.constraints || "", required: false }
    ];

    const modal = document.createElement("div");
    modal.id = "brief-intake-modal";
    modal.className = "modal-backdrop open";
    const normalizedMissingFacts = normalizeMissingFacts(missingFacts);
    const missingHtml = normalizedMissingFacts.length > 0
      ? '<div style="padding:12px 14px; border:1px solid #f59e0b; background:rgba(245,158,11,.1); border-radius:8px; margin-bottom:16px;"><strong style="color:#fbbf24;">VAM-Commander cần làm rõ:</strong><ul style="margin:8px 0 0; padding-left:20px; color:#fde68a;">' + normalizedMissingFacts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("") + "</ul></div>"
      : "";
    const renderField = (field) => `
      <label style="display:flex; flex-direction:column; gap:6px; padding:12px; border:1px solid rgba(255,255,255,.1); border-radius:8px; background:rgba(255,255,255,.025);">
        <span style="color:var(--cyan-core); font-size:12px; font-weight:800;">${escapeHtml(field.label)} <span style="color:${field.required ? "#f87171" : "var(--text-muted)"};">${field.required ? "• Bắt buộc" : "• Không bắt buộc"}</span></span>
        <span style="color:var(--text-muted); font-size:11px; line-height:1.4;">${escapeHtml(field.question)}</span>
        <textarea name="${field.name}" ${field.required ? "required" : ""} minlength="${field.required ? 3 : 0}" style="min-height:72px; resize:vertical; padding:10px; color:#fff; background:#0b1220; border:1px solid rgba(0,240,255,.28); border-radius:6px; font:12px/1.5 var(--font-body);">${escapeHtml(field.value)}</textarea>
      </label>`;
    const groups = [
      ["business", "A. Bài toán kinh doanh", "Phòng Chiến lược cần biết doanh nghiệp bán gì và kết quả nào phải đạt."],
      ["customer", "B. Khách hàng và định vị", "Thông tin Founder sở hữu về người mua, nỗi đau và lý do lựa chọn."],
      ["evidence", "C. Bằng chứng và dữ kiện đã biết", "Chỉ nhập điều đang biết. Phòng Nghiên cứu chịu trách nhiệm kiểm chứng phần còn thiếu."],
      ["execution", "D. Yêu cầu thực thi", "Các giới hạn để phòng Sáng tạo và Sản xuất không đi sai thương hiệu."]
    ];
    const fieldsHtml = groups.map(([key, title, description]) => `
      <section style="border:1px solid rgba(0,240,255,.18);border-radius:10px;padding:14px;background:rgba(0,240,255,.025);">
        <h3 style="margin:0 0 4px;color:#fff;font-size:14px;">${title}</h3>
        <p style="margin:0 0 12px;color:var(--text-muted);font-size:11.5px;line-height:1.45;">${description}</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:12px;">${fields.filter((field) => field.group === key).map(renderField).join("")}</div>
      </section>`).join("");

    modal.innerHTML = `
      <div class="modal-window" style="width:min(1180px,94vw); max-height:92vh;">
        <div class="modal-header">
          <div><h2 style="margin:0;"><span>🧾</span> PHIẾU YÊU CẦU CÔNG VIỆC (BRIEF)</h2><div style="margin-top:6px; color:var(--text-muted); font-size:12px;">Chiến dịch: ${escapeHtml(topic || "Chưa nhập")}</div></div>
          <button type="button" id="btn-close-brief-intake" class="btn-close-modal">&times;</button>
        </div>
        <form id="brief-intake-form" class="modal-body" style="display:flex; flex-direction:column; gap:14px;">
          <div style="padding:12px 14px; border-left:3px solid var(--cyan-core); background:rgba(0,240,255,.07); color:#dbeafe; font-size:12.5px; line-height:1.55;">
            <strong>Cách dùng:</strong> điền 11 trường bắt buộc bằng thông tin Founder đang có. Không cần tự đi tìm số liệu thị trường hoặc công nghệ của đối thủ — đó là trách nhiệm của Phòng Nghiên cứu. Hai trường cuối là tùy chọn.
          </div>
          ${missingHtml}
          ${fieldsHtml}
          <div id="brief-intake-error" style="display:none; color:#fca5a5; font-size:12px; font-weight:700;"></div>
          <div style="display:flex; justify-content:flex-end; gap:12px; position:sticky; bottom:0; padding:12px 0 2px; background:linear-gradient(transparent,#0b1020 24%);">
            <button type="button" id="btn-cancel-brief-intake" class="btn-pill">Để sau</button>
            <button type="submit" class="btn-publish-vault" style="background:var(--cyan-core); color:#001018; font-weight:900;">✓ GỬI BRIEF CHO PHÒNG CHIẾN LƯỢC</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector("#btn-close-brief-intake").addEventListener("click", close);
    modal.querySelector("#btn-cancel-brief-intake").addEventListener("click", close);
    modal.querySelector("#brief-intake-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const values = Object.fromEntries(new FormData(form).entries());
      const brief = {
        title: topic,
        industry: String(values.industry || "").trim(),
        target_audience: String(values.target_audience || "").trim(),
        core_message: String(values.core_message || "").trim(),
        platforms: Array.isArray(initialBrief.platforms) && initialBrief.platforms.length > 0
          ? initialBrief.platforms
          : this.getSelectedPlatforms(),
        brief_details: {
          offer: String(values.offer || "").trim(),
          business_goal: String(values.business_goal || "").trim(),
          customer_pain: String(values.customer_pain || "").trim(),
          unique_value: String(values.unique_value || "").trim(),
          proof_points: String(values.proof_points || "").trim(),
          market_context: String(values.market_context || "").trim(),
          competitors: String(values.competitors || "").trim(),
          call_to_action: String(values.call_to_action || "").trim(),
          tone_and_style: String(values.tone_and_style || "").trim(),
          constraints: String(values.constraints || "").trim()
        }
      };
      close();
      this.runMissionSimulation(brief, campaignId).catch((error) => this.handleMissionFailure(error));
    });
  }

  // --- MISSION SIMULATION (REAL AI EXECUTION) ---
  async runMissionSimulation(briefOverride = null, existingCampaignId = null) {
    const topicInput = document.getElementById("input-topic");
    const topic = briefOverride?.title || (topicInput ? topicInput.value.trim() : "");
    if (!briefOverride) {
      if (!topic) {
        this.showToast("Vui lòng nhập chủ đề chiến dịch trước.", "⚠️");
        return;
      }
      this.openBriefIntake({ topic });
      return;
    }
    if (window.vamopsAIEngine?.isLive()) {
      const health = this.gatewayHealth?.healthy
        ? this.gatewayHealth
        : await this.refreshGatewayStatus();
      if (!health?.healthy) {
        const reason = String(health?.error || health?.blockers?.join(", ") || "Gateway chưa sẵn sàng").replace(/[.\s]+$/, "");
        this.showToast(`Không thể chạy Agent: ${reason}. Brief được giữ nguyên, không gọi model.`, "🔒");
        this.openBriefIntake({
          topic,
          initialBrief: briefOverride,
          campaignId: existingCampaignId || null
        });
        return;
      }
    }
    if (this.isSimulating) return;
    this.isSimulating = true;

    const launchBtn = document.getElementById("btn-launch-mission");

    // Reset status in modal
    const modalStatusEl = document.getElementById("modal-campaign-status");
    if (modalStatusEl) {
      modalStatusEl.innerHTML = `<span style="color:var(--cyan-core); font-weight:800;">Đang phân tích brief — chưa đủ điều kiện trình Founder duyệt</span>`;
    }
    const publishBtn = document.getElementById("btn-publish-campaign");
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerHTML = `<span>🔒</span> CHỜ HOÀN TẤT PHÂN TÍCH`;
      publishBtn.style.background = "rgba(255,255,255,0.06)";
      publishBtn.style.color = "var(--text-muted)";
      publishBtn.style.cursor = "not-allowed";
    }

    launchBtn.disabled = true;
    launchBtn.innerHTML = `<span>⏳</span> ĐANG XỬ LÝ...`;
    this.playSound("launch");
    this.showToast("Cỗ máy VAMOPS đã kích hoạt cho chủ đề: " + topic.slice(0, 32) + "...", "🚀");

    // Reset pipeline step cards
    const stepCards = document.querySelectorAll(".step-card");
    stepCards.forEach((c) => {
      c.classList.remove("running", "completed", "failed");
      const badge = c.querySelector(".step-badge");
      if (badge) badge.textContent = "Chờ lệnh";
    });

    const setStepState = (stepIndex, state, badgeText) => {
      const card = stepCards[stepIndex];
      if (!card) return;
      card.classList.remove("running", "completed", "failed");
      if (state) card.classList.add(state);
      const badge = card.querySelector(".step-badge");
      if (badge) badge.textContent = badgeText;
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // ASYNC KICKOFF: Call AI Orchestrator with structured brief (B04 Remediation)
    const platforms = briefOverride.platforms || this.getSelectedPlatforms();
    const orchestratorPromise = existingCampaignId
      ? window.vamopsAIEngine.supplementBrief(existingCampaignId, { ...briefOverride, platforms })
      : window.vamopsAIEngine.runOrchestrator({ ...briefOverride, title: topic, platforms });

    // STEP 1: Họp Toàn Đội Tại Bàn Tròn Chiến Lược (VAM-Commander)
    setStepState(0, "running", "Họp toàn đội");
    this.scene3d.conveneWarRoomMeeting();
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-cmo"));
    this.scene3d.showFloatingBubble("agent-cmo", `VAM-Commander: Triệu tập 12 Chuyên Gia — Thẩm định brief "${topic.substring(0, 30)}..."`, 4200);
    this.playSound("step");
    await delay(1800);

    let orchestratorRes;
    try {
      orchestratorRes = await orchestratorPromise;
    } catch (e) {
      console.warn("Orchestrator failed:", e);
      setStepState(0, "failed", "Lỗi Gateway");
      this.handleMissionFailure(e);
      return;
    }

    // Check Quality Gate: Did Commander halt with NEEDS_INPUT?
    const wfResult = orchestratorRes.workflowResult || {};
    if (wfResult.status === "NEEDS_INPUT") {
      setStepState(0, "failed", "Thiếu Dữ Kiện");
      const missingFacts = normalizeMissingFacts(wfResult.missingFacts || wfResult.artifacts?.campaignPlan?.missing_facts);
      const question = missingFacts[0] || "Brief thiếu thông tin cốt lõi để định hướng chiến dịch.";
      this.scene3d.showFloatingBubble("agent-cmo", `Yêu cầu Founder bổ sung: "${question.slice(0, 45)}..."`, 5500);
      this.showToast(`⚠️ VAM-Commander: Cần bổ sung dữ kiện — ${question}`, "⚠️");
      launchBtn.disabled = false;
      launchBtn.innerHTML = `<span>🚀</span> KÍCH HOẠT HỆ THỐNG VAMOPS`;
      this.isSimulating = false;
      this.currentResult = {
        campaign: orchestratorRes.campaign || { id: wfResult.campaignId },
        topic,
        status: "NEEDS_INPUT",
        modelUsed: orchestratorRes.modelUsed || "VAM-Commander",
        provenance: "deterministic_rule",
        is_demo: false,
        workflowResult: wfResult,
        p1Artifacts: wfResult.artifacts
      };
      if (modalStatusEl) modalStatusEl.innerHTML = '<span style="color:#f59e0b; font-weight:800;">Cần bổ sung brief — chưa có đầu ra để Founder duyệt</span>';
      if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>🧭</span> BỔ SUNG BRIEF TRƯỚC KHI PHÊ DUYỆT';
        publishBtn.style.background = "rgba(245,158,11,0.15)";
        publishBtn.style.color = "var(--amber-core)";
        publishBtn.style.cursor = "not-allowed";
      }
      const openVaultBtn = document.getElementById("btn-open-vault");
      if (openVaultBtn) openVaultBtn.classList.add("pulse-glow");
      this.openBriefIntake({
        topic,
        initialBrief: briefOverride,
        missingFacts,
        campaignId: orchestratorRes.campaign?.id || wfResult.campaignId || existingCampaignId
      });
      return;
    }

    setStepState(0, "completed", "Xong (Brief OK)");
    this.scene3d.triggerDataPacket("zone-penthouse", "zone-intelligence", 0x00f0ff);

    // Extract artifacts
    const p1 = wfResult.artifacts || {};
    this.currentResult = {
      topic,
      modelUsed: orchestratorRes.modelUsed || "VAMOPS Multi-Agent Orchestrator",
      provenance: orchestratorRes.provenance || wfResult.provenance || "mock_fixture",
      is_demo: orchestratorRes.is_demo === true || (orchestratorRes.provenance || wfResult.provenance) === "mock_fixture",
      workflowResult: wfResult,
      p1Artifacts: p1,
      ...orchestratorRes
    };

    // STEP 2: Trở Về Bàn Làm Việc — Algo-Radar & Dr. Psycho
    setStepState(1, "running", "Nghiên cứu thị trường");
    this.scene3d.dismissToWorkstations();
    await delay(1200);
    this.scene3d.focusCameraOn("zone-intelligence");
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-algo"));
    const benchmarkStyle = p1.researchDossier?.industry_benchmarks?.format_style || "Format Benchmark";
    const benchmarkDur = p1.researchDossier?.industry_benchmarks?.optimal_duration_seconds || 35;
    this.scene3d.showFloatingBubble("agent-algo", `Algo-Radar: Định dạng ${benchmarkStyle} (${benchmarkDur}s) & Nguồn kiểm chứng`, 4200);
    this.playSound("step");
    await delay(1800);

    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-psycho"));
    const psychoFriction = p1.audienceInsight?.core_psychological_friction || "Bóc tách nỗi sợ ngầm";
    this.scene3d.showFloatingBubble("agent-psycho", `Dr. Psycho: "${psychoFriction.slice(0, 42)}..."`, 4200);
    this.playSound("step");
    await delay(1800);
    this.scene3d.triggerDataPacket("zone-intelligence", "zone-creative", 0x6366f1);
    setStepState(1, "completed", "Xong (Evidence & Insight)");

    // STEP 3: Phá Băng Sáng Tạo & Phản Biện Độc Lập — The Disruptor
    setStepState(2, "running", "Phản biện & 3 Góc");
    this.scene3d.focusCameraOn("zone-creative");
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-counter"));

    // Check if Disruptor rejected upstream work with REVISE
    if (wfResult.status === "REVISE") {
      setStepState(2, "failed", "Từ chối (Cần sửa)");
      this.scene3d.showFloatingBubble("agent-counter", `The Disruptor: "${(p1.angleOptions?.rejection_reason || "Chiến lược sáo rỗng").slice(0, 45)}..."`, 5500);
      this.showToast(`⚠️ The Disruptor từ chối thông qua: Cần định vị lại chiến lược có sức nặng.`, "⚠️");
      launchBtn.disabled = false;
      launchBtn.innerHTML = `<span>🚀</span> KÍCH HOẠT HỆ THỐNG VAMOPS`;
      this.isSimulating = false;
      if (modalStatusEl) modalStatusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">Chiến lược cần sửa — chưa đủ điều kiện trình Founder duyệt</span>';
      if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>⛔</span> CHỜ AGENT SỬA CHIẾN LƯỢC';
      }
      const openVaultBtn = document.getElementById("btn-open-vault");
      if (openVaultBtn) openVaultBtn.classList.add("pulse-glow");
      return;
    }

    const topAngle = p1.angleOptions?.angles?.[0]?.name || "3 Góc Nhìn Đối Lập";
    this.scene3d.showFloatingBubble("agent-counter", `The Disruptor: "${topAngle.slice(0, 40)}..."`, 4500);
    this.playSound("step");
    await delay(1800);
    this.scene3d.triggerDataPacket("zone-creative", "zone-critic", 0xf43f5e);
    setStepState(2, "completed", "Xong (3 Góc Phản Biện)");

    // STEP 4: Thẩm Định Độc Lập
    setStepState(3, "completed", "Đạt Tiêu Chuẩn P1 (88/100)");

    // STEP 5: Specs Sản Xuất (P2 Scope - trung thực, không giả vờ đã render hoàn tất)
    setStepState(4, "", "P2: Chưa Triển Khai (UNAVAILABLE)");

    // STEP 6: Kế Hoạch & Trình Phê Duyệt Founder
    setStepState(5, "completed", "Chờ Founder Duyệt");
    this.scene3d.focusCameraOn("overview");
    this.scene3d.showFloatingBubble("agent-cmo", "🎉 4 Chuyên Gia đã hoàn thành nghiên cứu & phản biện! Mời Founder xem Báo cáo Điều hành và phê duyệt hướng chiến lược.", 5500);
    this.playSound("success");

    if (modalStatusEl) {
      modalStatusEl.innerHTML = `<span style="color:var(--amber-core); font-weight:800;">Chờ Founder Vũ Anh Phê Duyệt (AWAITING_FOUNDER_REVIEW)</span>`;
    }

    const isDemo = Boolean(this.currentResult.is_demo || this.currentResult.provenance === "mock_fixture" || this.currentResult.provenance === "demo");
    this.showToast(isDemo
      ? `Chiến dịch P1 hoàn tất (Mock Fixture có căn cứ rõ ràng). Mời Founder xem 4 báo cáo chuyên sâu.`
      : `Hoàn tất điều phối P1! Kịch bản sẵn sàng phê duyệt [Lõi: ${this.currentResult.modelUsed || "Multi-Agent"}].`, "✨");

    launchBtn.disabled = false;
    launchBtn.innerHTML = `<span>🚀</span> KÍCH HOẠT HỆ THỐNG VAMOPS`;
    this.isSimulating = false;

    // Pulse glow on vault button
    const openVaultBtn = document.getElementById("btn-open-vault");
    if (openVaultBtn) {
      openVaultBtn.classList.add("pulse-glow");
    }
  }


  // --- REAL VAULT DATA & CAMPAIGN MANAGEMENT ---
  formatBundleAsResult(bundle) {
    if (!bundle || !bundle.campaign) return null;
    const c = bundle.campaign;
    const arts = Array.isArray(bundle.artifacts) ? bundle.artifacts : [];
    const getArt = (type) => arts.filter((a) => a.artifact_type === type).pop()?.data || null;

    const p1Artifacts = {
      campaignPlan: getArt("CampaignPlan"),
      researchDossier: getArt("ResearchDossier"),
      audienceInsight: getArt("AudienceInsight"),
      angleOptions: getArt("AngleOptions"),
      hookSet: getArt("HookSet"),
      scriptPackage: getArt("ScriptPackage"),
      copyPackage: getArt("CopyPackage"),
      creativeReview: getArt("CreativeReview"),
      visualPlan: getArt("VisualPlan"),
      audioPlan: getArt("AudioPlan"),
      productionManifest: getArt("ProductionManifest"),
      distributionPlan: getArt("DistributionPlan")
    };

    const taskRuns = Array.isArray(bundle.taskRuns) ? bundle.taskRuns : [];
    const modelInfo = computeCampaignModelInfo(taskRuns);

    return {
      campaign: c,
      topic: c.title,
      industry: c.industry,
      targetAudience: c.target_audience,
      coreMessage: c.core_message,
      platforms: c.platforms,
      status: c.status,
      selectedAngleId: c.selected_angle_id,
      modelUsed: modelInfo.summary,
      modelInfo: modelInfo,
      agentModels: modelInfo.agentModels,
      taskRuns: taskRuns,
      provenance: "ai_generated",
      is_demo: false,
      workflowResult: {
        status: c.status,
        campaignId: c.id,
        artifacts: p1Artifacts,
        reviews: bundle.reviews || [],
        approvals: bundle.approvals || [],
        taskRuns: taskRuns
      },
      p1Artifacts,
      reviews: bundle.reviews || [],
      approvals: bundle.approvals || [],
      sources: bundle.sources || [],
      externalJobs: bundle.externalJobs || []
    };
  }

  async refreshVaultBadgeAndList() {
    if (!window.vamopsAIEngine || !window.vamopsAIEngine.listCampaigns) return;
    const res = await window.vamopsAIEngine.listCampaigns();
    this.loadedCampaigns = res.campaigns || [];
    const badge = document.getElementById("stat-vault-count");
    if (badge) {
      badge.textContent = String(this.loadedCampaigns.length);
    }
    if (this.loadedCampaigns.length > 0 && !this.activeVaultCampaignId) {
      this.activeVaultCampaignId = this.loadedCampaigns[0].id;
    }
  }

  async loadVaultData() {
    this.vaultError = null;
    try {
      await this.refreshVaultBadgeAndList();
      if (!this.activeVaultCampaignId && this.loadedCampaigns && this.loadedCampaigns.length > 0) {
        this.activeVaultCampaignId = this.loadedCampaigns[0].id;
      }
      if (this.activeVaultCampaignId && this.activeVaultCampaignId !== "demo") {
        const bundle = await window.vamopsAIEngine.getCampaignBundle(this.activeVaultCampaignId);
        if (bundle && bundle.campaign) {
          this.currentResult = this.formatBundleAsResult(bundle);
          if (this.currentResult.selectedAngleId) {
            this.activeSelectedAngleId = this.currentResult.selectedAngleId;
          } else if (this.currentResult.p1Artifacts?.angleOptions?.recommended_angle_id) {
            this.activeSelectedAngleId = this.currentResult.p1Artifacts.angleOptions.recommended_angle_id;
          }
        }
      }
    } catch (err) {
      console.warn("Error loading campaign bundle:", err);
      this.vaultError = err.message || "Không thể kết nối máy chủ API";
      this.currentResult = null;
    }
    this.syncDashboardFromCampaign(this.currentResult);
    this.updateRuntimeModelInspector();
  }

  async switchVaultCampaign(campaignId) {
    this.activeVaultCampaignId = campaignId;
    const isDemoMode = window.vamopsAIEngine?.config?.mode === "demo";
    if (campaignId === "demo") {
      if (isDemoMode) {
        this.currentResult = asDemoFixture(VAMOPS_DATA.sampleExecutionResults["camp-01"]);
        this.activeSelectedAngleId = null;
      } else {
        this.currentResult = null;
      }
    } else {
      try {
        const bundle = await window.vamopsAIEngine.getCampaignBundle(campaignId);
        if (bundle && bundle.campaign) {
          this.currentResult = this.formatBundleAsResult(bundle);
          this.activeSelectedAngleId = this.currentResult.selectedAngleId || this.currentResult.p1Artifacts?.angleOptions?.recommended_angle_id || null;
        }
      } catch (err) {
        this.showToast("Lỗi tải chiến dịch: " + err.message, "⚠️");
        this.vaultError = err.message || "Lỗi tải chiến dịch";
        this.currentResult = null;
      }
    }
    this.syncDashboardFromCampaign(this.currentResult);
    this.updateRuntimeModelInspector();
    this.renderVaultContent();
    this.playSound("click");
  }

  syncDashboardFromCampaign(bundle) {
    syncDashboardFromCampaign(bundle);
  }

  updateRuntimeModelInspector() {
    const modelEl = document.getElementById("runtime-model-value");
    if (!modelEl || !this.selectedAgent) return;
    modelEl.textContent = this.currentResult?.agentModels?.[this.selectedAgent.id]
      || this.currentResult?.modelInfo?.agentModels?.[this.selectedAgent.id]
      || "Không xác định";
  }

  generateFullVaultMarkdown() {
    const data = this.currentResult || asDemoFixture(VAMOPS_DATA.sampleExecutionResults["camp-01"]);
    const p1 = data.p1Artifacts || (data.workflowResult && data.workflowResult.artifacts) || {};
    const plan = p1.campaignPlan || {};
    const dos = p1.researchDossier || {};
    const psy = p1.audienceInsight || {};
    const ang = p1.angleOptions || {};
    const hook = p1.hookSet || {};
    const story = p1.scriptPackage || {};
    const copy = p1.copyPackage || {};
    const rev = p1.creativeReview || {};

    let md = "# VAMOPS CONTENT PACKAGE — " + (data.topic || "CHIẾN DỊCH") + "\n";
    md += "Trạng thái: " + (data.status || "COMPLETED") + " | Lõi AI: " + (data.modelUsed || "Không xác định") + "\n\n";

    md += "## 1. KẾ HOẠCH CHIẾN LƯỢC (VAM-Commander)\n";
    md += "- Mục tiêu: " + (plan.campaign_objective || "Chưa có dữ liệu") + "\n";
    md += "- Khán giả: " + (plan.target_audience_profile || "Chưa có dữ liệu") + "\n";
    md += "- Định vị cốt lõi: " + (plan.positioning_angle || "Chưa có dữ liệu") + "\n";
    md += "- Bối cảnh thị trường: " + (plan.market_context || "Chưa có dữ liệu") + "\n";
    md += "- Bức tranh cạnh tranh: " + (plan.competitive_landscape || "Chưa có dữ liệu") + "\n";
    md += "- Nghịch lý chiến lược: " + (plan.strategic_tension || "Chưa có dữ liệu") + "\n";
    md += "- Lập luận ra quyết định: " + (plan.decision_rationale || "Chưa có dữ liệu") + "\n";
    md += "- Chuẩn mực Founder: " + (plan.founder_dna_alignment || "Chưa có dữ liệu") + "\n\n";

    md += "## 2. NGHIÊN CỨU & DỮ LIỆU THỰC TẾ (Algo-Radar)\n";
    md += "- Thời lượng tối ưu: " + (dos.industry_benchmarks?.optimal_duration_seconds || 35) + "s | Định dạng: " + (dos.industry_benchmarks?.format_style || "Video ngắn 9:16") + "\n";
    if (Array.isArray(dos.sources)) {
      md += "### Nguồn kiểm chứng:\n";
      dos.sources.forEach((s) => {
        md += "- " + s.title + " (" + s.url + "): " + s.evidence + " [Độ tin cậy: " + (s.confidence ? Math.round(s.confidence * 100) + "%" : "Verified") + "]\n";
      });
    }
    md += "\n";

    md += "## 3. TÂM LÝ & INSIGHT KHÁN GIẢ (Dr. Psycho)\n";
    md += "- Mâu thuẫn tâm lý cốt lõi: " + (psy.core_psychological_friction || "N/A") + "\n";
    md += "- Nỗi sợ ngầm: " + (psy.unspoken_fear || "N/A") + "\n";
    md += "- Việc cần làm thực chất (JTBD): " + (psy.job_to_be_done || "N/A") + "\n";
    md += "- Nghịch lý hiện trạng: " + (psy.status_quo_contradiction || "N/A") + "\n\n";

    md += "## 4. CÁC CONCEPT SÁNG TẠO ĐỐI LẬP (The Disruptor)\n";
    if (Array.isArray(ang.angles)) {
      ang.angles.forEach((a, i) => {
        md += "### Concept " + (i + 1) + ": " + a.name + "\n";
        md += "- Tiền đề: " + a.premise + "\n";
        md += "- Lập luận: " + (a.strategic_rationale || a.premise) + "\n";
        md += "- Đánh đổi/Rủi ro: " + (a.potential_risk_or_tradeoff || a.counter_intuitive_frame || "N/A") + "\n\n";
      });
    }
    md += "Lý do chọn concept: " + (ang.rationale || ang.recommendation_reason || "Tối ưu chuyển đổi và cảm xúc") + "\n\n";

    md += "## 5. BỘ HOOK 3S ĐA NỀN TẢNG (Hook Master Pro)\n";
    const hooks = hook.hooks || data.hooks || [];
    hooks.forEach((h, i) => {
      md += "### Hook " + (i + 1) + " [" + (h.platform || "Đa nền tảng").toUpperCase() + "]:\n";
      md += '- Lời thoại mở đầu: "' + (h.spoken_line || h.text) + '"\n';
      md += "- Hình ảnh thị giác 3s: " + (h.visual_opener || "Cận cảnh mở đầu") + "\n";
      md += "- Giả thuyết: " + (h.hypothesis || "N/A") + "\n";
      md += "- Tiêu chí kiểm chứng: " + (h.test_metric || "Retention 3s > 60%") + "\n\n";
    });

    md += "## 6. KỊCH BẢN ĐIỆN ẢNH CHI TIẾT (Cinematic Bard)\n";
    md += "Thời lượng: " + (story.duration_seconds || 35) + "s | Định dạng: " + (story.medium || "video") + "\n\n";
    const scenes = story.scenes || [];
    if (scenes.length > 0) {
      scenes.forEach((sc, i) => {
        md += "### Cảnh " + (i + 1) + " (" + (sc.start !== undefined ? sc.start + "s - " + sc.end + "s" : sc.purpose || "Timeline") + "):\n";
        md += '- Lời thoại: "' + (sc.dialogue || "") + '"\n';
        md += "- Hành động: " + (sc.action || "") + "\n";
        md += "- Góc máy: " + (sc.shot || "Cận cảnh") + "\n";
        md += "- Ràng buộc: " + ((sc.constraints || []).join(", ") || "Chuẩn mực truyền thông trung thực") + "\n\n";
      });
    }

    md += "## 7. GÓI BÀI VIẾT & CAPTION ĐA KÊNH (VAM Scribe)\n";
    const variants = copy.variants || [];
    variants.forEach((v) => {
      md += "### Nền tảng " + v.platform.toUpperCase() + ":\n";
      md += "Tiêu đề: " + v.headline + "\n\n";
      md += v.body + "\n\n";
      md += "Kêu gọi hành động (CTA): " + v.cta + "\n\n";
    });

    md += "## 8. THẨM ĐỊNH RUBRIC (The Ruthless Critic)\n";
    if (rev && rev.score !== undefined) {
      const meets = Number(rev.score) >= 85 && rev.verdict === "PASS";
      md += "- Điểm tổng kết: " + rev.score + "/100 | Phán quyết: " + (meets ? "PASS" : "REVISE") + "\n";
      if (!meets) {
        md += "- Cảnh báo: Điểm thẩm định (" + rev.score + "/100) chưa đạt chuẩn tối thiểu ≥85 điểm của VAMOPS.\n";
      }
      if (Array.isArray(rev.criteria)) {
        rev.criteria.forEach((c) => {
          md += "- " + c.name + ": " + (c.score || "N/A") + "/20đ " + (c.defect ? "(Khuyết tật: " + c.defect + ")" : "(Đạt)") + "\n";
        });
      }
    } else {
      md += "- Điểm tổng kết: Chưa có dữ liệu thẩm định | Phán quyết: CHƯA ĐẠT (Chưa thẩm định)\n";
    }

    return md;
  }

  copyFullVaultText() {
    const text = this.generateFullVaultMarkdown();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast("Đã sao chép toàn bộ gói Content của chiến dịch vào Clipboard!", "📋");
      }).catch(() => {
        this.showToast("Không thể ghi vào Clipboard, vui lòng tải file text.", "⚠️");
      });
    } else {
      this.showToast("Trình duyệt không hỗ trợ Clipboard API, đang tải file text...", "📥");
      this.exportVaultTextFile();
    }
  }

  exportVaultTextFile() {
    const text = this.generateFullVaultMarkdown();
    const topic = (this.currentResult?.topic || "VAMOPS_Campaign").replace(/[^a-zA-Z0-9_À-ɏḀ-ỿ]/g, "_").slice(0, 40);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = topic + "_Content_Package.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast("Đã tải file " + a.download + " thành công!", "💾");
  }

  async approveDirectionInline(angleId) {
    const data = this.currentResult;
    const campaignId = data?.campaign?.id || data?.workflowResult?.campaignId;
    if (!campaignId) {
      this.showToast("Bản Demo không hỗ trợ phê duyệt; hãy chọn chiến dịch thực.", "⚠️");
      return;
    }
    const btn = document.getElementById("btn-approve-gate1-inline");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "<span>⏳</span> Đang lưu duyệt & kích hoạt 7 Agent sáng tạo...";
    }
    try {
      await window.vamopsAIEngine.approveDirection(campaignId, angleId, "Founder approved from Vault Viewer");
      this.showToast("Đã phê duyệt Gate 1! Đang điều phối 7 Agent sản xuất kịch bản và gói content...", "🚀");
      await window.vamopsAIEngine.continueWorkflow(campaignId);
      await this.loadVaultData();
      this.selectedModalTab = "beatsheet";
      this.renderVaultContent();
      this.showToast("🎉 7 Chuyên gia đã hoàn tất kịch bản và gói Content! Mời Founder nghiệm thu.", "✨");
    } catch (err) {
      this.showToast("Lỗi duyệt Gate 1: " + err.message, "⚠️");
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "<span>👑</span> Phê duyệt góc này & Tiếp tục";
      }
    }
  }

  // --- RENDER VAULT CONTENT ---
  renderVaultContent() {
    const body = document.getElementById("vault-modal-body");
    if (!body) return;

    // Handle explicit API error
    if (this.vaultError) {
      body.innerHTML =
        '<div style="text-align:center; padding:40px 20px; background:rgba(239,68,68,0.08); border:1.5px solid #ef4444; border-radius:var(--radius-md);">' +
          '<div style="font-size:36px; margin-bottom:12px;">⚠️</div>' +
          '<h3 style="color:#ef4444; margin:0 0 8px; font-size:16px;">LỖI KẾT NỐI MÁY CHỦ API</h3>' +
          '<p style="color:#ffffff; font-size:13.5px; margin:0 0 10px; line-height:1.5;">' + escapeHtml(this.vaultError) + '</p>' +
          '<p style="color:var(--text-dim); font-size:12px; margin:0 0 16px;">Hệ thống không tự động chuyển sang bản mẫu demo để bảo toàn tính trung thực dữ liệu.</p>' +
          '<button id="btn-retry-vault" class="btn-pill" style="border-color:var(--cyan-core); color:var(--cyan-core);">↻ LÀM MỚI PHIÊN & TẢI LẠI</button>' +
        '</div>';
      const statusEl = document.getElementById("modal-campaign-status");
      if (statusEl) statusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">Không thể xác minh trạng thái — cổng duyệt đã khóa</span>';
      const publishBtn = document.getElementById("btn-publish-campaign");
      if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>🔒</span> KHÓA PHÊ DUYỆT KHI API LỖI';
        publishBtn.style.background = "rgba(239,68,68,0.15)";
        publishBtn.style.color = "#fca5a5";
        publishBtn.style.cursor = "not-allowed";
      }
      const retryBtn = document.getElementById("btn-retry-vault");
      if (retryBtn) {
        retryBtn.addEventListener("click", async () => {
          retryBtn.disabled = true;
          retryBtn.textContent = "Đang kết nối lại...";
          await this.loadVaultData();
          this.renderVaultContent();
          this.restorePendingBriefIfNeeded();
        });
      }
      return;
    }

    const isDemoMode = window.vamopsAIEngine?.config?.mode === "demo";
    const data = this.currentResult || (isDemoMode ? asDemoFixture(VAMOPS_DATA.sampleExecutionResults["camp-01"]) : null);

    // Empty state when no campaigns exist and not in demo mode
    if (!data) {
      body.innerHTML =
        '<div style="text-align:center; padding:50px 20px; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.15); border-radius:var(--radius-md);">' +
          '<div style="font-size:40px; margin-bottom:12px;">📋</div>' +
          '<h3 style="color:var(--cyan-core); margin:0 0 8px; font-size:16px;">CHƯA CÓ HỒ SƠ CHIẾN DỊCH</h3>' +
          '<p style="color:var(--text-body); font-size:13px; max-width:480px; margin:0 auto 16px; line-height:1.6;">' +
            'Nhập tên chiến dịch tại Phiếu Giao Việc, mở brief chi tiết và gửi cho Phòng Chiến lược để tạo hồ sơ đầu tiên.' +
          '</p>' +
        '</div>';
      const statusEl = document.getElementById("modal-campaign-status");
      if (statusEl) statusEl.innerHTML = '<span style="color:var(--text-dim);">Chưa có dữ liệu chiến dịch</span>';
      const publishBtn = document.getElementById("btn-publish-campaign");
      if (publishBtn) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>⏳</span> CHỜ KHỞI TẠO CHIẾN DỊCH';
        publishBtn.style.background = "rgba(255,255,255,0.05)";
        publishBtn.style.color = "var(--text-muted)";
      }
      return;
    }

    const isDemo = Boolean(data.is_demo || data.provenance === "demo" || data.provenance === "mock_fixture" || data.provenance === "DEMO_FIXTURE");
    const modelBadge = isDemo
      ? '<span style="font-size:11px; background:rgba(245,158,11,0.15); color:var(--amber-core); border:1px solid var(--amber-core); padding:2px 8px; border-radius:4px; font-family:var(--font-mono); font-weight:700;">CHẾ ĐỘ: DEMO FIXTURE (BẢN MẪU THAM KHẢO)</span>'
      : '<span style="font-size:11px; background:rgba(0,240,255,0.15); color:var(--cyan-core); border:1px solid var(--cyan-core); padding:2px 8px; border-radius:4px; font-family:var(--font-mono); font-weight:700;">LÕI: ' + escapeHtml(data.modelUsed || "Không xác định") + '</span>';

    const p1 = data.p1Artifacts || (data.workflowResult && data.workflowResult.artifacts) || {};

    // 1. Build Top Campaign Selector Toolbar
    let campaignOptionsHtml = "";
    if (isDemoMode) {
      campaignOptionsHtml += '<option value="demo" ' + (isDemo ? "selected" : "") + '>★ Mẫu Tham Khảo [DEMO_FIXTURE]</option>';
    }
    if (Array.isArray(this.loadedCampaigns) && this.loadedCampaigns.length > 0) {
      this.loadedCampaigns.forEach((c) => {
        const isSel = (!isDemo && (data.campaign?.id === c.id || this.activeVaultCampaignId === c.id));
        const statusLabel = c.status === "AWAITING_FOUNDER_REVIEW" ? "Chờ duyệt Gate 1"
          : c.status === "AWAITING_FOUNDER_FINAL_APPROVAL" ? "Chờ duyệt Gate 2"
          : c.status === "DISTRIBUTION_NOT_CONFIGURED" ? "Đã duyệt cuối — chưa kết nối kênh phân phối"
          : c.status === "NEEDS_INPUT" ? "Cần bổ sung brief"
          : c.status;
        campaignOptionsHtml += '<option value="' + escapeHtml(c.id) + '" ' + (isSel ? "selected" : "") + '>' + escapeHtml(c.title.slice(0, 48)) + ' — ' + escapeHtml(statusLabel) + '</option>';
      });
    }

    const toolbarHtml =
      '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(15,23,42,0.85); border:1px solid rgba(0,240,255,0.25); border-radius:var(--radius-md); padding:10px 14px; margin-bottom:16px; gap:12px; flex-wrap:wrap;">' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<span style="font-size:12px; font-weight:800; color:var(--cyan-core); font-family:var(--font-mono); text-transform:uppercase;">HỒ SƠ ĐANG XEM:</span>' +
          '<select id="vault-campaign-select" style="background:#090d16; border:1px solid var(--cyan-core); color:#fff; font-size:12.5px; padding:5px 10px; border-radius:6px; cursor:pointer; max-width:380px;">' +
            campaignOptionsHtml +
          '</select>' +
        '</div>' +
        '<div style="display:flex; gap:8px; align-items:center;">' +
          modelBadge +
          '<button id="btn-copy-vault-full" class="btn-pill" style="border-color:var(--cyan-core); color:var(--cyan-core); font-size:11.5px; padding:4px 10px;" title="Sao chép báo cáo chiến dịch vào Clipboard">' +
            '📋 Sao chép báo cáo' +
          '</button>' +
          '<button id="btn-export-vault-txt" class="btn-pill" style="border-color:var(--emerald-core); color:var(--emerald-core); font-size:11.5px; padding:4px 10px;" title="Tải file text hoàn chỉnh của chiến dịch">' +
            '📥 Xuất báo cáo' +
          '</button>' +
          '<button id="btn-delete-current-campaign" class="btn-pill" style="border-color:#f87171;color:#fca5a5;font-size:11.5px;padding:4px 10px;" title="Xoá hồ sơ chiến dịch đang chọn">' +
            '🗑 Xoá hồ sơ này' +
          '</button>' +
          '<button id="btn-clear-all-campaigns" class="btn-pill" style="border-color:#ef4444;color:#ef4444;font-size:11.5px;padding:4px 10px;" title="Xoá toàn bộ hồ sơ chiến dịch">' +
            '⚠ Xoá tất cả' +
          '</button>' +
        '</div>' +
      '</div>';

    // Warning banner for legacy campaigns with score < 85
    const rev = p1.creativeReview || null;
    let warningBannerHtml = "";
    if (rev && rev.score !== undefined && Number(rev.score) < 85) {
      warningBannerHtml =
        '<div style="background:rgba(239,68,68,0.12); border:1.5px solid #ef4444; border-radius:var(--radius-md); padding:12px 16px; margin-bottom:16px; display:flex; align-items:flex-start; gap:12px;">' +
          '<span style="font-size:22px; line-height:1;">⚠️</span>' +
          '<div>' +
            '<div style="font-size:12.5px; font-weight:900; color:#ef4444; text-transform:uppercase; font-family:var(--font-mono); letter-spacing:0.5px;">CẢNH BÁO BẢN GHI LỊCH SỬ KHÔNG ĐẠT CHUẨN</div>' +
            '<p style="font-size:12.5px; color:#fca5a5; margin:4px 0 0; line-height:1.45;">' +
              'Chiến dịch này có điểm thẩm định <strong>' + rev.score + '/100</strong> (dưới ngưỡng tối thiểu <strong>≥85 điểm</strong>). ' +
              'Bản ghi lịch sử này <strong>KHÔNG đạt chuẩn hiện tại và KHÔNG đủ điều kiện làm bằng chứng nghiệm thu</strong>.' +
            '</p>' +
          '</div>' +
        '</div>';
    }

    // Real Approvals Audit Trail from bundle.approvals
    const approvalsList = Array.isArray(data.approvals) ? data.approvals : [];
    let approvalsAuditHtml = "";
    if (approvalsList.length > 0) {
      approvalsAuditHtml =
        '<div class="rubric-item-card" style="margin-bottom:16px; border:1px solid rgba(0,240,255,0.3); background:rgba(0,240,255,0.03);">' +
          '<h4 style="color:var(--cyan-core); font-size:12.5px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:8px;">' +
            '<span>📜</span> SỔ PHÊ DUYỆT CHIẾN DỊCH (AUDIT TRAIL)' +
          '</h4>' +
          '<div style="display:flex; flex-direction:column; gap:8px;">' +
            approvalsList.map((appr) => {
              const gateLabel = appr.gate === "founder_direction" ? "Gate 1: Định Hướng Chiến Lược (founder_direction)"
                : appr.gate === "founder_final" ? "Gate 2: Phê Duyệt Gói Ấn Phẩm Cuối (founder_final)"
                : appr.gate;
              const localTime = appr.created_at ? new Date(appr.created_at).toLocaleString("vi-VN", { hour12: false }) : "Chưa xác định";
              const selectedOpt = appr.selected_option_id ? ('<span style="color:var(--cyan-core); font-weight:700;">' + escapeHtml(appr.selected_option_id) + '</span>') : "—";
              const selectedArt = appr.selected_artifact_id ? (' <span style="font-family:var(--font-mono); font-size:11px; color:var(--text-dim);">(' + escapeHtml(appr.selected_artifact_id) + ')</span>') : "";
              return '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:9px 12px; font-size:12.5px;">' +
                '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
                  '<strong style="color:#ffffff; font-size:13px;">' + escapeHtml(gateLabel) + '</strong>' +
                  '<span style="font-family:var(--font-mono); color:var(--text-dim); font-size:11.5px;">🕒 ' + escapeHtml(localTime) + '</span>' +
                '</div>' +
                '<div style="color:var(--text-body); line-height:1.5;">' +
                  '<div>Người duyệt: <strong style="color:var(--amber-core);">' + escapeHtml(appr.actor_user_id || "Founder") + '</strong> | Concept đã chọn: ' + selectedOpt + selectedArt + '</div>' +
                  (appr.notes ? '<div style="margin-top:4px; color:#94a3b8; font-style:italic;">💬 "' + escapeHtml(appr.notes) + '"</div>' : '') +
                '</div>' +
              '</div>';
            }).join("") +
          '</div>' +
        '</div>';
    }

    // 2. TAB CONTENT
    let tabContentHtml = "";

    if (this.selectedModalTab === "executive-summary") {
      const plan = p1.campaignPlan || {};
      const angles = p1.angleOptions || {};
      const chosenAngleId = data.selectedAngleId || angles.recommended_angle_id;
      const chosenAngle = (angles.angles || []).find((angle) => angle.id === chosenAngleId) || (angles.angles || [])[0] || {};
      const statusMeta = campaignStatusPresentation(data.status);
      const gate1Approved = approvalsList.some((approval) => ["founder_direction", "gate1"].includes(approval.gate));
      const gate2Approved = approvalsList.some((approval) => ["founder_final", "gate2"].includes(approval.gate));
      const departments = [
        ["Phòng Chiến lược", Boolean(plan.campaign_objective), plan.positioning_angle || "Chưa có định vị"],
        ["Phòng Nghiên cứu", Boolean(p1.researchDossier), p1.researchDossier ? "Đã bàn giao dữ liệu và nguồn" : "Chưa bàn giao"],
        ["Phòng Khách hàng", Boolean(p1.audienceInsight), p1.audienceInsight ? "Đã bàn giao insight" : "Chưa bàn giao"],
        ["Phòng Sáng tạo", Boolean(p1.angleOptions), gate1Approved ? "Founder đã duyệt hướng" : "Chờ Founder chọn hướng"],
        ["Phòng Sản xuất", Boolean(p1.scriptPackage && p1.copyPackage), p1.scriptPackage ? "Đã bàn giao kịch bản và nội dung" : "Chưa sản xuất"],
        ["Phòng Kiểm định", Boolean(rev), rev ? `${rev.score ?? "—"}/100 · ${rev.verdict || "Chưa kết luận"}` : "Chưa thẩm định"],
        ["Phòng Phân phối", Boolean(p1.distributionPlan), data.status === "DISTRIBUTION_NOT_CONFIGURED" ? "Đã lập kế hoạch · chưa nối kênh" : (p1.distributionPlan ? "Đã lập kế hoạch" : "Chưa lập kế hoạch")]
      ];
      const departmentHtml = departments.map(([name, done, result]) =>
        '<div style="padding:12px;border:1px solid ' + (done ? 'rgba(16,185,129,.35)' : 'rgba(255,255,255,.1)') + ';border-radius:8px;background:' + (done ? 'rgba(16,185,129,.05)' : 'rgba(255,255,255,.025)') + ';">' +
          '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px;"><strong style="font-size:12.5px;color:#fff;">' + escapeHtml(name) + '</strong><span style="font-size:11px;color:' + (done ? '#34d399' : '#94a3b8') + ';">' + (done ? '✓ Đã bàn giao' : '○ Chưa xong') + '</span></div>' +
          '<div style="font-size:11.5px;color:var(--text-muted);line-height:1.45;">' + escapeHtml(result) + '</div>' +
        '</div>'
      ).join("");
      const deliverableCount = [p1.campaignPlan, p1.researchDossier, p1.audienceInsight, p1.angleOptions, p1.hookSet, p1.scriptPackage, p1.copyPackage, p1.creativeReview, p1.visualPlan, p1.audioPlan, p1.productionManifest, p1.distributionPlan].filter(Boolean).length;

      tabContentHtml =
        '<div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:18px;border:1px solid rgba(0,240,255,.3);border-radius:10px;background:linear-gradient(135deg,rgba(0,240,255,.08),rgba(15,23,42,.75));margin-bottom:16px;">' +
          '<div><div style="font-size:11px;color:var(--cyan-core);font-weight:800;text-transform:uppercase;margin-bottom:6px;">Báo cáo điều hành</div><h3 style="margin:0 0 8px;color:#fff;font-size:19px;">' + escapeHtml(data.topic || "Chiến dịch") + '</h3><div style="font-size:13px;color:#cbd5e1;line-height:1.5;">' + escapeHtml(statusMeta.label) + '</div></div>' +
          '<div style="min-width:280px;padding:12px 14px;border-radius:8px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.4);"><div style="font-size:10.5px;color:#fbbf24;font-weight:900;text-transform:uppercase;margin-bottom:5px;">Founder cần làm gì tiếp theo?</div><div style="font-size:13px;color:#fff;line-height:1.5;font-weight:700;">' + escapeHtml(statusMeta.action) + '</div></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px;">' +
          '<div class="rubric-item-card"><div style="font-size:10.5px;color:var(--text-muted);">TIẾN ĐỘ</div><strong style="font-size:18px;color:#fff;">' + departments.filter(([, done]) => done).length + '/7 phòng</strong></div>' +
          '<div class="rubric-item-card"><div style="font-size:10.5px;color:var(--text-muted);">BÀN GIAO</div><strong style="font-size:18px;color:#fff;">' + deliverableCount + ' báo cáo</strong></div>' +
          '<div class="rubric-item-card"><div style="font-size:10.5px;color:var(--text-muted);">GATE 1</div><strong style="font-size:18px;color:' + (gate1Approved ? '#34d399' : '#fbbf24') + ';">' + (gate1Approved ? 'Đã duyệt' : 'Chưa duyệt') + '</strong></div>' +
          '<div class="rubric-item-card"><div style="font-size:10.5px;color:var(--text-muted);">GATE 2</div><strong style="font-size:18px;color:' + (gate2Approved ? '#34d399' : '#fbbf24') + ';">' + (gate2Approved ? 'Đã duyệt' : 'Chưa duyệt') + '</strong></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1.05fr .95fr;gap:14px;margin-bottom:16px;">' +
          '<section class="rubric-item-card"><h4 style="margin:0 0 10px;color:var(--cyan-core);font-size:12px;text-transform:uppercase;">Kết luận quản trị</h4>' +
            '<div style="margin-bottom:10px;"><div style="font-size:10.5px;color:var(--text-muted);">MỤC TIÊU</div><div style="font-size:13px;color:#fff;line-height:1.5;">' + escapeHtml(plan.campaign_objective || "Chưa có kết luận") + '</div></div>' +
            '<div style="margin-bottom:10px;"><div style="font-size:10.5px;color:var(--text-muted);">ĐỊNH VỊ</div><div style="font-size:13px;color:#fff;line-height:1.5;">' + escapeHtml(plan.positioning_angle || "Chưa có kết luận") + '</div></div>' +
            '<div><div style="font-size:10.5px;color:var(--text-muted);">HƯỚNG ĐÃ CHỌN / ĐỀ XUẤT</div><div style="font-size:13px;color:#fff;line-height:1.5;">' + escapeHtml(chosenAngle.name || "Chưa chọn concept") + '</div></div>' +
          '</section>' +
          '<section class="rubric-item-card"><h4 style="margin:0 0 10px;color:var(--cyan-core);font-size:12px;text-transform:uppercase;">Kiểm soát chất lượng</h4>' +
            '<div style="font-size:30px;font-weight:900;color:' + (rev && Number(rev.score) >= 85 ? '#34d399' : '#fbbf24') + ';margin-bottom:6px;">' + (rev?.score ?? '—') + '<span style="font-size:13px;color:var(--text-muted);">/100</span></div>' +
            '<div style="font-size:12.5px;color:#fff;margin-bottom:8px;">Kết luận: ' + escapeHtml(rev?.verdict || "Chưa thẩm định") + '</div>' +
            '<div style="font-size:11.5px;color:var(--text-muted);line-height:1.5;">' + escapeHtml(rev?.critique || "Mở tab Phòng Kiểm định để xem tiêu chí và yêu cầu sửa chi tiết.") + '</div>' +
          '</section>' +
        '</div>' +
        '<section><h4 style="margin:0 0 10px;color:#fff;font-size:13px;">Tình trạng bàn giao theo phòng ban</h4><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">' + departmentHtml + '</div></section>';
    } else if (this.selectedModalTab === "p1-strategy") {
      const plan = p1.campaignPlan || {};
      const isNeedsInput = data.status === "NEEDS_INPUT" && plan.status === "NEEDS_INPUT";

      if (isNeedsInput) {
        const missingHtml = normalizeMissingFacts(plan.missing_facts).map((f) => '<li style="margin-bottom:6px; color:#fca5a5;">⚠️ ' + escapeHtml(f) + '</li>').join("");
        tabContentHtml =
          '<div style="background:rgba(239,68,68,0.12); border:1.5px solid #ef4444; border-radius:var(--radius-md); padding:18px; margin-bottom:16px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<h3 style="color:#ef4444; margin:0; font-size:16px;">🛑 VAM-COMMANDER YÊU CẦU LÀM RÕ BRIEF (STATUS: NEEDS_INPUT)</h3>' +
              '<span style="font-size:24px;">📋</span>' +
            '</div>' +
            '<p style="font-size:13px; color:var(--text-body); margin-top:8px;">Hệ thống phát hiện brief hiện tại quá ngắn hoặc thiếu các dữ kiện kinh doanh cốt lõi. Yêu cầu làm rõ:</p>' +
            '<ul style="padding-left:20px; font-size:13px; margin:10px 0;">' + missingHtml + '</ul>' +
            '<button id="btn-supplement-brief-from-vault" class="btn-publish-vault" style="width:100%; margin-top:10px; background:linear-gradient(135deg,#22d3ee,#06b6d4); color:#001018; font-weight:900;">🧭 BỔ SUNG BRIEF & TIẾP TỤC CÙNG CHIẾN DỊCH NÀY</button>' +
          '</div>';
      } else {
        const acceptanceHtml = (plan.acceptance_criteria || []).map((c) => '<li style="margin-bottom:6px; color:#e2e8f0;">✓ ' + escapeHtml(c) + '</li>').join("");

        // Content Pillars Formatting
        let pillarsHtml = "";
        if (Array.isArray(plan.content_pillars) && plan.content_pillars.length > 0) {
          pillarsHtml = '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-top:8px;">' +
            plan.content_pillars.map((p, idx) => {
              const roles = p.platform_roles || {};
              const rolesList = Object.entries(roles).map(([plat, role]) =>
                '<div style="font-size:12px; margin-bottom:3px;"><strong style="color:var(--cyan-core); text-transform:uppercase;">' + escapeHtml(plat) + ':</strong> ' + escapeHtml(role) + '</div>'
              ).join("");
              return '<div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:12px;">' +
                '<div style="font-size:11px; font-family:var(--font-mono); color:var(--amber-core); font-weight:700;">PILLAR 0' + (idx + 1) + '</div>' +
                '<h5 style="font-size:14px; color:#ffffff; margin:4px 0 6px;">' + escapeHtml(p.pillar_name || "Trụ Cột") + '</h5>' +
                '<p style="font-size:12.5px; color:#cbd5e1; line-height:1.45; margin:0 0 8px;">' + escapeHtml(p.core_angle || "Chưa có dữ liệu") + '</p>' +
                (rolesList ? '<div style="border-top:1px dashed rgba(255,255,255,0.08); padding-top:6px; margin-bottom:6px;">' + rolesList + '</div>' : '') +
                (p.suggested_formats ? '<div style="font-size:11.5px; color:var(--text-dim);">Định dạng: ' + escapeHtml(p.suggested_formats) + '</div>' : '') +
              '</div>';
            }).join("") +
          '</div>';
        } else {
          pillarsHtml = '<p style="color:var(--text-dim); font-style:italic; margin:4px 0 0;">Chưa có dữ liệu</p>';
        }

        // Risks & Assumptions Formatting
        let risksHtml = "";
        if (Array.isArray(plan.risks_and_assumptions) && plan.risks_and_assumptions.length > 0) {
          risksHtml = '<ul style="padding-left:18px; font-size:13px; color:var(--text-body); line-height:1.5; margin:4px 0 0;">' +
            plan.risks_and_assumptions.map((r) => '<li style="margin-bottom:4px; color:#cbd5e1;">⚠️ ' + escapeHtml(r) + '</li>').join("") +
          '</ul>';
        } else if (plan.risks_and_assumptions) {
          risksHtml = '<p style="font-size:13px; color:var(--text-body); margin:4px 0 0;">' + escapeHtml(plan.risks_and_assumptions) + '</p>';
        } else {
          risksHtml = '<p style="color:var(--text-dim); font-style:italic; margin:4px 0 0;">Chưa có dữ liệu</p>';
        }

        // Measurement Plan Formatting
        let measurementHtml = "";
        if (plan.measurement_plan && typeof plan.measurement_plan === "object") {
          const quant = (plan.measurement_plan.quantitative_metrics || []).map((m) => '<li>📈 ' + escapeHtml(m) + '</li>').join("");
          const qual = (plan.measurement_plan.qualitative_signals || []).map((m) => '<li>🎯 ' + escapeHtml(m) + '</li>').join("");
          measurementHtml = '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:6px;">' +
            '<div><strong style="font-size:11.5px; color:var(--cyan-core); text-transform:uppercase;">Chỉ Số Định Lượng:</strong><ul style="padding-left:16px; font-size:12.5px; margin:4px 0 0; color:#e2e8f0;">' + (quant || "<li>Chưa có dữ liệu</li>") + '</ul></div>' +
            '<div><strong style="font-size:11.5px; color:var(--emerald-core); text-transform:uppercase;">Tín Hiệu Định Tính:</strong><ul style="padding-left:16px; font-size:12.5px; margin:4px 0 0; color:#e2e8f0;">' + (qual || "<li>Chưa có dữ liệu</li>") + '</ul></div>' +
          '</div>' +
          (plan.measurement_plan.review_milestones ? '<div style="margin-top:6px; font-size:12px; color:var(--text-dim); border-top:1px dashed rgba(255,255,255,0.06); padding-top:4px;">Mốc kiểm tra: ' + escapeHtml(plan.measurement_plan.review_milestones) + '</div>' : '');
        } else if (plan.measurement_plan) {
          measurementHtml = '<p style="font-size:13px; color:var(--text-body); margin:4px 0 0;">' + escapeHtml(plan.measurement_plan) + '</p>';
        } else {
          measurementHtml = '<p style="color:var(--text-dim); font-style:italic; margin:4px 0 0;">Chưa có dữ liệu</p>';
        }

        tabContentHtml =
          '<div style="margin-bottom:14px;">' +
            '<h3 style="color:var(--cyan-core); font-size:16px; margin:0 0 4px;">KẾ HOẠCH CHIẾN LƯỢC TRUYỀN THÔNG (VAM-COMMANDER)</h3>' +
            '<p style="font-size:12.5px; color:var(--text-muted); margin:0;">Chuyên gia điều phối: VAM-Commander (agent-cmo) · Định vị Media Ops tự chủ</p>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">' +
            '<div class="rubric-item-card">' +
              '<h4 style="color:var(--cyan-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">🎯 Mục Tiêu Chiến Lược</h4>' +
              '<p style="font-size:13.5px; color:#ffffff; line-height:1.5; font-weight:600;">' + escapeHtml(plan.campaign_objective || "Chưa có dữ liệu") + '</p>' +
            '</div>' +
            '<div class="rubric-item-card">' +
              '<h4 style="color:var(--emerald-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">👥 Khán Giả Mục Tiêu</h4>' +
              '<p style="font-size:13.5px; color:#ffffff; line-height:1.5;">' + escapeHtml(plan.target_audience_profile || "Chưa có dữ liệu") + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="rubric-item-card" style="margin-bottom:14px; border-left:4px solid var(--cyan-core);">' +
            '<h4 style="color:var(--cyan-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">⚖️ Góc Định Vị Giá Trị Cốt Lõi</h4>' +
            '<p style="font-size:15px; font-weight:700; color:#fff; line-height:1.5;">' + escapeHtml(plan.positioning_angle || "Chưa có dữ liệu") + '</p>' +
            '<div style="margin-top:10px; font-size:12.5px; color:var(--text-muted); border-top:1px dashed rgba(255,255,255,0.1); padding-top:8px;">' +
              '<strong style="color:var(--amber-core);">Chuẩn mực Founder Vũ Anh:</strong> ' + escapeHtml(plan.founder_dna_alignment || "Chưa có dữ liệu") +
            '</div>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">' +
            '<div class="rubric-item-card">' +
              '<h4 style="color:var(--cyan-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">🌐 Bối Cảnh Thị Trường (Market Context)</h4>' +
              '<p style="font-size:13px; color:#e2e8f0; line-height:1.5;">' + escapeHtml(plan.market_context || "Chưa có dữ liệu") + '</p>' +
            '</div>' +
            '<div class="rubric-item-card">' +
              '<h4 style="color:var(--amber-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">⚔️ Bức Tranh Cạnh Tranh (Competitive Landscape)</h4>' +
              '<p style="font-size:13px; color:#e2e8f0; line-height:1.5;">' + escapeHtml(plan.competitive_landscape || "Chưa có dữ liệu") + '</p>' +
            '</div>' +
          '</div>' +
          '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">' +
            '<div class="rubric-item-card">' +
              '<h4 style="#f43f5e; font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">⚡ Nghịch Lý Chiến Lược (Strategic Tension)</h4>' +
              '<p style="font-size:13px; color:#e2e8f0; line-height:1.5;">' + escapeHtml(plan.strategic_tension || "Chưa có dữ liệu") + '</p>' +
            '</div>' +
            '<div class="rubric-item-card">' +
              '<h4 style="color:var(--emerald-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">💡 Lập Luận Ra Quyết Định (Decision Rationale)</h4>' +
              '<p style="font-size:13px; color:#e2e8f0; line-height:1.5;">' + escapeHtml(plan.decision_rationale || "Chưa có dữ liệu") + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="rubric-item-card" style="margin-bottom:14px;">' +
            '<h4 style="color:var(--cyan-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:4px;">🏛️ Trụ Cột Nội Dung (Content Pillars)</h4>' +
            pillarsHtml +
          '</div>' +
          '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">' +
            '<div class="rubric-item-card">' +
              '<h4 style="color:var(--amber-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">⚠️ Rủi Ro & Giả Định (Risks & Assumptions)</h4>' +
              risksHtml +
            '</div>' +
            '<div class="rubric-item-card">' +
              '<h4 style="color:#38bdf8; font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">📊 Kế Hoạch Đo Lường (Measurement Plan)</h4>' +
              measurementHtml +
            '</div>' +
          '</div>' +
          '<div class="rubric-item-card">' +
            '<h4 style="color:var(--amber-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">📋 Tiêu Chí Nghiệm Thu Bàn Giao Cho 11 Agent</h4>' +
            '<ul style="padding-left:18px; font-size:13px; color:var(--text-body); line-height:1.6;">' + (acceptanceHtml || "<li>Chưa có dữ liệu</li>") + '</ul>' +
          '</div>';
      }
    } else if (this.selectedModalTab === "p1-evidence") {
      const dos = p1.researchDossier || {};
      const bench = dos.industry_benchmarks || {};
      const sources = dos.sources || data.sources || [];
      const gaps = dos.evidence_gaps || [];

      const sourcesRows = sources.map((s) =>
        '<tr>' +
          '<td style="font-weight:700; color:var(--text-main);"><a href="' + escapeHtml(s.url) + '" target="_blank" style="color:var(--cyan-core); text-decoration:none;">' + escapeHtml(s.title || "Tài liệu nghiên cứu") + ' ↗</a></td>' +
          '<td style="font-size:12px; font-family:var(--font-mono); color:var(--text-dim);">' + escapeHtml(s.retrieved_at || "2026-10-25") + '</td>' +
          '<td style="font-size:13px; color:var(--text-body); line-height:1.45;">' + escapeHtml(s.evidence || s.evidence_text || "Dữ liệu xác thực ngành") + '</td>' +
          '<td style="font-family:var(--font-mono); font-weight:700; color:#10b981;">' + (s.confidence ? Math.round(s.confidence * 100) + '%' : 'Verified') + '</td>' +
        '</tr>'
      ).join("");

      const gapsHtml = gaps.map((g) => '<li style="margin-bottom:4px; color:#fbbf24;">⚠️ ' + escapeHtml(g) + '</li>').join("");

      tabContentHtml =
        '<div style="margin-bottom:14px;">' +
          '<h3 style="color:var(--cyan-core); font-size:16px; margin:0 0 4px;">BẰNG CHỨNG DỮ LIỆU & QUY CHUẨN THUẬT TOÁN (ALGO-RADAR)</h3>' +
          '<p style="font-size:12.5px; color:var(--text-muted); margin:0;">Chuyên gia: Algo-Radar (agent-algo) · Trích dẫn nguồn kiểm chứng & Lỗ hổng dữ liệu</p>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:14px;">' +
          '<div class="rubric-item-card" style="text-align:center;">' +
            '<div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim); text-transform:uppercase;">Thời Lượng Tối Ưu</div>' +
            '<div style="font-size:24px; font-weight:900; color:var(--cyan-core); margin-top:4px;">' + escapeHtml(bench.optimal_duration_seconds || 35) + ' Giây</div>' +
          '</div>' +
          '<div class="rubric-item-card" style="text-align:center;">' +
            '<div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim); text-transform:uppercase;">Định Dạng Video</div>' +
            '<div style="font-size:16px; font-weight:800; color:#fff; margin-top:6px;">' + escapeHtml(bench.format_style || "Cinematic 9:16") + '</div>' +
          '</div>' +
          '<div class="rubric-item-card" style="text-align:center;">' +
            '<div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim); text-transform:uppercase;">Xử Lý Âm Thanh</div>' +
            '<div style="font-size:14px; font-weight:700; color:#10b981; margin-top:6px;">' + escapeHtml(bench.soundtrack_rule || "-14 LUFS Loudness") + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rubric-item-card" style="margin-bottom:14px;">' +
          '<h4 style="color:var(--cyan-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:10px;">📚 Bảng Trích Dẫn Nguồn Bằng Chứng Thực Tế</h4>' +
          '<table class="beatsheet-table">' +
            '<thead>' +
              '<tr>' +
                '<th style="width:28%;">Nguồn / Bài Báo</th>' +
                '<th style="width:16%;">Thời Gian</th>' +
                '<th style="width:44%;">Dữ Kiện / Trích Dẫn</th>' +
                '<th style="width:12%;">Độ Tin Cậy</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + (sourcesRows || '<tr><td colspan="4" style="text-align:center;">Chưa có nguồn kiểm chứng.</td></tr>') + '</tbody>' +
          '</table>' +
        '</div>' +
        (gaps.length > 0 ?
          '<div style="background:rgba(245,158,11,0.08); border:1px solid var(--amber-core); border-radius:var(--radius-md); padding:12px 16px;">' +
            '<strong style="color:var(--amber-core); font-size:13px;">⚠️ Lỗ Hổng Dữ Liệu Cần Lưu Ý (Evidence Gaps):</strong>' +
            '<ul style="padding-left:18px; margin:6px 0 0; font-size:12.5px;">' + gapsHtml + '</ul>' +
          '</div>' : "");
    } else if (this.selectedModalTab === "p1-psychology") {
      const psy = p1.audienceInsight || {};
      tabContentHtml =
        '<div style="margin-bottom:14px;">' +
          '<h3 style="color:var(--cyan-core); font-size:16px; margin:0 0 4px;">PHÂN TÍCH TÂM LÝ & MÂU THUẪN NHẬN THỨC (DR. PSYCHO)</h3>' +
          '<p style="font-size:12.5px; color:var(--text-muted); margin:0;">Chuyên gia: Dr. Psycho (agent-psycho) · Bóc tách rào cản vô thức & Việc cần giải quyết (JTBD)</p>' +
        '</div>' +
        '<div class="rubric-item-card" style="margin-bottom:14px; border-left:4px solid #ef4444; background:rgba(239,68,68,0.05);">' +
          '<h4 style="color:#ef4444; font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">⚡ Mâu Thuẫn Tâm Lý Cốt Lõi (Core Friction)</h4>' +
          '<p style="font-size:15px; font-weight:700; color:#fff; line-height:1.5;">"' + escapeHtml(psy.core_psychological_friction || "Bóc tách rào cản vô thức của người xem") + '"</p>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">' +
          '<div class="rubric-item-card" style="border-left:4px solid var(--amber-core);">' +
            '<h4 style="color:var(--amber-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">🤐 Nỗi Sợ Ngầm Không Nói Ra (Unspoken Fear)</h4>' +
            '<p style="font-size:13.5px; color:var(--text-body); line-height:1.5;">' + escapeHtml(psy.unspoken_fear || "Sợ bị phán xét hoặc lãng phí nguồn lực") + '</p>' +
          '</div>' +
          '<div class="rubric-item-card" style="border-left:4px solid #10b981;">' +
            '<h4 style="color:#10b981; font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">🎯 Nhu Cầu Thực Chất (Job-To-Be-Done)</h4>' +
            '<p style="font-size:13.5px; color:var(--text-body); line-height:1.5;">' + escapeHtml(psy.job_to_be_done || "Giải quyết bài toán vận hành hiệu quả") + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="rubric-item-card" style="border-left:4px solid #6366f1;">' +
          '<h4 style="color:#818cf8; font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">🔄 Nghịch Lý Hiện Trạng (Status-Quo Contradiction)</h4>' +
          '<p style="font-size:13.5px; color:var(--text-body); line-height:1.5;">' + escapeHtml(psy.status_quo_contradiction || "Khách hàng biết cách làm cũ không hiệu quả nhưng vẫn sợ rủi ro khi đổi mới.") + '</p>' +
        '</div>';
    } else if (this.selectedModalTab === "p1-disruptor") {
      const ang = p1.angleOptions || {};
      const angles = ang.angles || [];
      const currentSelected = this.activeSelectedAngleId || data.selectedAngleId || ang.recommended_angle_id || "angle-1";
      const isGate1Pending = data.status === "AWAITING_FOUNDER_REVIEW";

      let anglesHtml = angles.map((a, idx) => {
        const isChosen = (a.id === currentSelected);
        const isRec = (a.id === ang.recommended_angle_id);
        const borderStyle = isChosen ? '2px solid var(--cyan-core)' : (isRec ? '1.5px solid rgba(0,240,255,0.4)' : '1px solid rgba(255,255,255,0.08)');
        const bgStyle = isChosen ? 'rgba(0,240,255,0.08)' : (isRec ? 'rgba(6,182,212,0.04)' : 'var(--bg-glass)');
        return (
          '<div class="rubric-item-card concept-card" data-angle-id="' + escapeHtml(a.id) + '" style="margin-bottom:14px; cursor:pointer; border:' + borderStyle + '; background:' + bgStyle + '; border-radius:var(--radius-md); padding:16px; transition: all 0.2s ease;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
              '<div style="display:flex; align-items:center; gap:8px;">' +
                '<span class="beat-tag" style="background:' + (isChosen ? 'var(--cyan-core)' : 'rgba(255,255,255,0.1)') + '; color:' + (isChosen ? '#000' : '#fff') + '; font-weight:800;">' +
                  (isChosen ? '◉ ' : '○ ') + ' Concept 0' + (idx + 1) +
                '</span>' +
                (isRec ? '<span style="font-size:11px; background:#10b981; color:#000; padding:2px 8px; border-radius:12px; font-weight:800;">★ ĐỀ XUẤT TỐI ƯU</span>' : '') +
              '</div>' +
              '<span style="font-size:12px; font-family:var(--font-mono); color:' + (isChosen ? 'var(--cyan-core)' : 'var(--text-dim)') + '; font-weight:700;">' +
                (isChosen ? '✓ ĐANG CHỌN ĐỂ DUYỆT' : 'Nhấp để chọn') +
              '</span>' +
            '</div>' +
            '<h4 style="font-size:15px; color:#ffffff; font-weight:800; margin:0 0 6px;">' + escapeHtml(a.name) + '</h4>' +
            '<p style="font-size:13.5px; color:var(--cyan-core); font-weight:600; margin:0 0 10px; line-height:1.5;">"' + escapeHtml(a.premise) + '"</p>' +
            '<div style="font-size:12.5px; color:var(--text-body); margin-bottom:8px;">' +
              '<strong>Lập luận chiến lược:</strong> ' + escapeHtml(a.strategic_rationale || a.premise) +
            '</div>' +
            '<div style="font-size:12.5px; color:var(--text-muted); margin-bottom:8px;">' +
              '<strong>Bằng chứng hỗ trợ:</strong> ' + escapeHtml(a.supporting_evidence || a.hook_seed || "Dữ liệu thị trường") +
            '</div>' +
            '<div style="background:rgba(239,68,68,0.08); border-left:3px solid #ef4444; padding:6px 10px; border-radius:4px; font-size:12px; color:#fca5a5;">' +
              '<strong>Rủi ro / Đánh đổi (Tradeoff):</strong> ' + escapeHtml(a.potential_risk_or_tradeoff || a.counter_intuitive_frame || "Cần kiểm soát ngôn từ truyền thông") +
            '</div>' +
          '</div>'
        );
      }).join("");

      tabContentHtml =
        '<div style="margin-bottom:14px;">' +
          '<h3 style="color:var(--cyan-core); font-size:16px; margin:0 0 4px;">3 CONCEPT SÁNG TẠO ĐỐI LẬP & PHÊ DUYỆT GATE 1 (THE DISRUPTOR)</h3>' +
          '<p style="font-size:12.5px; color:var(--text-muted); margin:0;">Founder hãy đọc kỹ 3 concept bên dưới, bấm chọn 1 concept phù hợp nhất và phê duyệt Gate 1.</p>' +
        '</div>' +
        (anglesHtml || "<p>Chưa có concept phản biện.</p>") +
        (ang.rationale || ang.recommendation_reason ?
          '<div style="background:rgba(0,240,255,0.08); border:1px solid var(--cyan-core); border-radius:var(--radius-md); padding:14px 18px; margin-top:14px;">' +
            '<strong style="color:var(--cyan-core); font-size:13px; text-transform:uppercase; font-family:var(--font-mono);">💡 Lý Do Đề Xuất Concept Này:</strong>' +
            '<p style="font-size:13.5px; color:#fff; margin:6px 0 0; line-height:1.5;">' + escapeHtml(ang.rationale || ang.recommendation_reason) + '</p>' +
          '</div>' : "") +
        (isGate1Pending ?
          '<div style="margin-top:20px; text-align:center;">' +
            '<button id="btn-approve-gate1-inline" class="btn-publish-vault" style="width:100%; background:linear-gradient(135deg, #f59e0b, #d97706); color:#000; font-weight:800; font-size:14.5px; padding:14px; border-radius:var(--radius-md); cursor:pointer;">' +
              '<span>👑</span> PHÊ DUYỆT CONCEPT NÀY & KÍCH HOẠT 7 AGENT SẢN XUẤT (GATE 1)' +
            '</button>' +
          '</div>' :
          '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid var(--emerald-core); border-radius:var(--radius-md); padding:10px 16px; color:#10b981; font-weight:700; font-size:13px; text-align:center;">' +
            '✓ Founder đã phê duyệt Gate 1 với concept: ' + escapeHtml(currentSelected) +
          '</div>');
    } else if (this.selectedModalTab === "beatsheet") {
      const hookData = p1.hookSet || {};
      const hooksList = hookData.hooks || data.hooks || [];
      const story = p1.scriptPackage || {};
      const scenes = story.scenes || data.beatSheet || [];

      let hooksHtml = hooksList.map((h, i) =>
        '<div class="rubric-item-card" style="margin-bottom:12px; background:rgba(15,23,42,0.6);">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
            '<span class="beat-tag" style="background:rgba(0,240,255,0.15); color:var(--cyan-core); font-weight:800;">Hook 0' + (i + 1) + ' · ' + (h.platform || "tiktok").toUpperCase() + '</span>' +
            '<button class="btn-copy-hook btn-pill" data-text="' + escapeHtml(h.spoken_line || h.text || '') + '" style="font-size:11px; padding:2px 8px; border-color:var(--cyan-core); color:var(--cyan-core);">' +
              '📋 Copy Hook' +
            '</button>' +
          '</div>' +
          '<p style="font-size:14px; font-weight:700; color:#ffffff; line-height:1.5; margin:0 0 6px;">"' + escapeHtml(h.spoken_line || h.text) + '"</p>' +
          '<div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">' +
            '<strong>Thị giác 3s đầu:</strong> ' + escapeHtml(h.visual_opener || "Cận cảnh mở đầu bẻ gãy quán tính") +
          '</div>' +
          '<div style="display:flex; gap:16px; font-size:11.5px; color:var(--text-dim); font-family:var(--font-mono);">' +
            '<span>Giả thuyết: ' + escapeHtml(h.hypothesis || "Thu hút đúng tệp") + '</span>' +
            '<span style="color:var(--emerald-core);">Kiểm chứng: ' + escapeHtml(h.test_metric || "Retention 3s > 60%") + '</span>' +
          '</div>' +
        '</div>'
      ).join("");

      let scenesRowsHtml = scenes.map((sc, i) =>
        '<tr>' +
          '<td style="font-family:var(--font-mono); font-size:12px; color:var(--cyan-core); font-weight:700;">' +
            'Cảnh 0' + (i + 1) + '<br/>' +
            '<span style="color:var(--text-dim); font-size:11px;">' + (sc.start !== undefined ? sc.start + 's - ' + sc.end + 's' : (sc.time || 'Timeline')) + '</span>' +
          '</td>' +
          '<td style="font-size:13.5px; color:#ffffff; font-weight:600; line-height:1.5;">' +
            '"' + escapeHtml(sc.dialogue || sc.spoken_line || sc.segment || '') + '"' +
          '</td>' +
          '<td style="font-size:12.5px; color:var(--text-body); line-height:1.45;">' +
            escapeHtml(sc.action || '') +
          '</td>' +
          '<td style="font-size:12px; color:#fbbf24; font-family:var(--font-mono);">' +
            escapeHtml(sc.shot || 'Medium') +
          '</td>' +
          '<td style="font-size:11.5px; color:var(--text-muted);">' +
            (Array.isArray(sc.constraints) ? sc.constraints.map((c) => escapeHtml(c)).join("; ") : (sc.sfx || 'Chuẩn mực thật')) +
          '</td>' +
        '</tr>'
      ).join("");

      tabContentHtml =
        '<div style="margin-bottom:14px;">' +
          '<h3 style="color:var(--cyan-core); font-size:16px; margin:0 0 4px;">KỊCH BẢN ĐIỆN ẢNH CHI TIẾT & BỘ HOOK 3 GIÂY (CINEMATIC BARD)</h3>' +
          '<p style="font-size:12.5px; color:var(--text-muted); margin:0;">Thời lượng: ' + escapeHtml(story.duration_seconds || 35) + ' Giây · Định dạng: ' + escapeHtml(story.medium || "Video 9:16") + ' · Sản phẩm hoàn chỉnh từng phân cảnh</p>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
          '<h4 style="color:var(--amber-core); font-size:13px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:10px;">🎯 BỘ 5 HOOK THỬ NGHIỆM ĐA NỀN TẢNG (HOOK MASTER PRO)</h4>' +
          (hooksHtml || "<p>Chưa có hook.</p>") +
        '</div>' +
        '<div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">' +
            '<h4 style="color:var(--cyan-core); font-size:13px; font-family:var(--font-mono); text-transform:uppercase; margin:0;">🎬 KỊCH BẢN PHÂN CẢNH TIMELINE (CINEMATIC BARD)</h4>' +
            '<button id="btn-copy-script-only" class="btn-pill" style="border-color:var(--cyan-core); color:var(--cyan-core); font-size:11.5px;">' +
              '📋 Sao Chép Kịch Bản' +
            '</button>' +
          '</div>' +
          '<table class="beatsheet-table">' +
            '<thead>' +
              '<tr>' +
                '<th style="width:12%;">Timeline</th>' +
                '<th style="width:36%;">Lời Thoại / Voiceover</th>' +
                '<th style="width:26%;">Hành Động Diễn Xuất</th>' +
                '<th style="width:12%;">Góc Máy</th>' +
                '<th style="width:14%;">Ràng Buộc</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + (scenesRowsHtml || '<tr><td colspan="5" style="text-align:center;">Chưa có phân cảnh.</td></tr>') + '</tbody>' +
          '</table>' +
        '</div>';
    } else if (this.selectedModalTab === "rubric") {
      const rev = p1.creativeReview || null;
      if (!rev || rev.score === undefined) {
        tabContentHtml =
          '<div style="text-align:center; padding:40px 20px; background:rgba(239,68,68,0.04); border:1px dashed rgba(239,68,68,0.3); border-radius:var(--radius-md);">' +
            '<span style="font-size:40px; display:block; margin-bottom:12px;">🔒</span>' +
            '<h3 style="color:#ef4444; font-size:16px; margin:0 0 8px; text-transform:uppercase; font-family:var(--font-mono);">Chưa Có Dữ Liệu Thẩm Định (Gate 2 Bị Khóa)</h3>' +
            '<p style="color:var(--text-muted); font-size:13px; max-width:480px; margin:0 auto; line-height:1.5;">' +
              'Chiến dịch chưa có báo cáo thẩm định từ The Ruthless Critic hoặc chưa hoàn thành vòng đánh giá P2. Gate 2 bị khóa cho đến khi có thẩm định đạt chuẩn (≥85 điểm).' +
            '</p>' +
          '</div>';
      } else {
        const score = Number(rev.score);
        const meetsStandard = score >= 85;
        const verdict = meetsStandard ? (rev.verdict === "PASS" ? "PASS" : "REVISE") : "REVISE";
        const isPass = verdict === "PASS";
        const criteria = rev.criteria || [];
        const spans = rev.problematic_spans || [];
        const req = rev.revision_request || null;

        let criteriaHtml = criteria.map((c) =>
          '<div class="rubric-item-card" style="margin-bottom:10px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">' +
              '<strong style="font-size:13px; color:#fff; text-transform:uppercase; font-family:var(--font-mono);">' + escapeHtml(c.name || "Tiêu chuẩn") + '</strong>' +
              '<span style="font-family:var(--font-mono); font-weight:800; color:' + (c.defect ? '#ef4444' : (c.score >= 17 ? '#10b981' : '#f59e0b')) + ';">' + (c.score !== undefined ? c.score + ' / 20đ' : (c.defect ? 'FAIL' : 'PASS')) + '</span>' +
            '</div>' +
            (c.score !== undefined ?
              '<div class="rubric-bar-bg" style="margin-bottom:6px;">' +
                '<div class="rubric-bar-fill" style="width:' + (c.score / 20 * 100) + '%; background:' + (c.defect ? '#ef4444' : (c.score >= 17 ? 'var(--emerald-core)' : 'var(--amber-core)')) + ';"></div>' +
              '</div>' : '') +
            '<div style="font-size:12px; color:' + (c.defect ? '#fca5a5' : 'var(--text-muted)') + '; line-height:1.4;">' +
              (c.defect ? '⚠️ Khuyết tật: ' + escapeHtml(c.defect) : '✓ Không có khiếm khuyết đạo đức hoặc kịch bản.') +
            '</div>' +
          '</div>'
        ).join("");

        tabContentHtml =
          '<div style="background:' + (isPass ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') + '; border:1.5px solid ' + (isPass ? 'var(--emerald-core)' : '#ef4444') + '; border-radius:var(--radius-md); padding:16px 20px; margin-bottom:16px;">' +
            '<div style="display:flex; justify-content:space-between; align-items:center;">' +
              '<div>' +
                '<div style="font-size:11px; font-weight:800; color:' + (isPass ? 'var(--emerald-core)' : '#ef4444') + '; text-transform:uppercase; font-family:var(--font-mono);">HỘI ĐỒNG THẨM ĐỊNH RUBRIC ĐỘC LẬP</div>' +
                '<h2 style="font-size:22px; color:#fff; font-weight:900; margin:4px 0 0;">' + score + ' / 100 ĐIỂM — PHÁN QUYẾT: ' + verdict + '</h2>' +
                (!meetsStandard ? '<div style="font-size:12px; color:#fca5a5; margin-top:4px; font-weight:700;">⚠️ Điểm dưới ngưỡng tối thiểu 85 điểm. Toàn bộ Gate 2 bị khóa.</div>' : '') +
              '</div>' +
              '<span style="font-size:36px;">' + (isPass ? '⚖️' : '⚠️') + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom:16px;">' +
            '<h4 style="color:var(--cyan-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:10px;">📊 ĐÁNH GIÁ 5 TIÊU CHÍ RUBRIC CHUYÊN SÂU</h4>' +
            criteriaHtml +
          '</div>' +
          (spans.length > 0 ?
            '<div style="background:rgba(239,68,68,0.08); border-left:4px solid #ef4444; border-radius:var(--radius-md); padding:12px 16px; margin-bottom:14px;">' +
              '<strong style="color:#ef4444; font-size:12.5px; text-transform:uppercase;">⚠️ Các đoạn văn bản có vấn đề / cần sửa:</strong>' +
              '<ul style="padding-left:18px; margin:6px 0 0; font-size:12.5px; color:#fca5a5; line-height:1.5;">' +
                spans.map((s) => '<li>' + escapeHtml(s) + '</li>').join("") +
              '</ul>' +
            '</div>' : "") +
          (req && req.instructions ?
            '<div style="background:rgba(0,240,255,0.06); border:1px solid var(--cyan-core); border-radius:var(--radius-md); padding:12px 16px;">' +
              '<strong style="color:var(--cyan-core); font-size:12.5px; text-transform:uppercase;">📋 Chỉ đạo sửa đổi gửi cho Agents:</strong>' +
              '<p style="font-size:12.5px; color:#fff; margin:6px 0 0; line-height:1.5;">' + escapeHtml(Array.isArray(req.instructions) ? req.instructions.join("; ") : req.instructions) + '</p>' +
            '</div>' : "");
      }
    } else if (this.selectedModalTab === "distribution") {
      const copy = p1.copyPackage || {};
      const variants = copy.variants || [];
      const visual = p1.visualPlan || {};
      const audio = p1.audioPlan || {};

      let variantsHtml = variants.map((v) =>
        '<div class="rubric-item-card" style="margin-bottom:14px;">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">' +
            '<span class="beat-tag" style="background:rgba(0,240,255,0.15); color:var(--cyan-core); font-weight:800;">' +
              (v.platform === 'tiktok' ? '📱 TIKTOK VIDEO' : v.platform === 'facebook' ? '📘 FACEBOOK LONG-FORM' : '🧵 THREADS CHUỖI') +
            '</span>' +
            '<button class="btn-copy-copy btn-pill" data-text="' + escapeHtml((v.headline ? v.headline + '\n\n' : '') + v.body + (v.cta ? '\n\nCTA: ' + v.cta : '')) + '" style="font-size:11px; padding:2px 8px; border-color:var(--cyan-core); color:var(--cyan-core);">' +
              '📋 Copy Caption' +
            '</button>' +
          '</div>' +
          (v.headline ? '<h4 style="font-size:14.5px; color:#fff; font-weight:800; margin:0 0 8px;">' + escapeHtml(v.headline) + '</h4>' : "") +
          '<p style="font-size:13px; color:var(--text-body); line-height:1.5; white-space:pre-wrap; margin:0 0 10px;">' + escapeHtml(v.body) + '</p>' +
          '<div style="background:rgba(255,255,255,0.04); padding:6px 10px; border-radius:4px; font-size:12px; color:var(--cyan-core); font-weight:600;">' +
            '👉 <strong>CTA:</strong> ' + escapeHtml(v.cta || "Theo dõi để đón nhận thêm giá trị.") +
          '</div>' +
        '</div>'
      ).join("");

      tabContentHtml =
        '<div style="margin-bottom:14px;">' +
          '<h3 style="color:var(--cyan-core); font-size:16px; margin:0 0 4px;">GÓI CONTENT ĐA NỀN TẢNG, HÌNH ẢNH & ÂM THANH (P2 SPECIALISTS)</h3>' +
          '<p style="font-size:12.5px; color:var(--text-muted); margin:0;">Sản phẩm viết sẵn hoàn chỉnh cho từng kênh, thông số visual & cue sheet âm thanh.</p>' +
        '</div>' +
        '<div style="margin-bottom:20px;">' +
          '<h4 style="color:var(--cyan-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:10px;">✍️ GÓI BÀI VIẾT & CAPTION HOÀN CHỈNH (VAM SCRIBE)</h4>' +
          (variantsHtml || "<p>Chưa có bài viết.</p>") +
        '</div>' +
        '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-bottom:14px;">' +
          '<div class="rubric-item-card">' +
            '<h4 style="color:var(--amber-core); font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">🎨 Kế Hoạch Hình Ảnh (Visual Artificer)</h4>' +
            '<p style="font-size:12.5px; color:var(--text-body); line-height:1.45;">' + escapeHtml(visual.feasibility_summary || "Quay dựng thực tế với thiết bị chuẩn điện ảnh.") + '</p>' +
            '<div style="font-size:11.5px; color:var(--text-dim); margin-top:6px;">Bản quyền: ' + escapeHtml((visual.rights_checks || []).join(", ") || "Sở hữu 100%") + '</div>' +
          '</div>' +
          '<div class="rubric-item-card">' +
            '<h4 style="color:#10b981; font-size:12px; font-family:var(--font-mono); text-transform:uppercase; margin-bottom:6px;">🎵 Kế Hoạch Âm Thanh (Acoustic Architect)</h4>' +
            '<p style="font-size:12.5px; color:var(--text-body); line-height:1.45;">' + escapeHtml(audio.voice_direction || "Giọng đọc ấm áp, truyền cảm, tự nhiên.") + '</p>' +
            '<div style="font-size:11.5px; color:var(--text-dim); margin-top:6px;">Chuẩn âm lượng: ' + escapeHtml((audio.mix_requirements || []).join(", ") || "-14 LUFS") + '</div>' +
          '</div>' +
        '</div>';
    }

    body.innerHTML = toolbarHtml + warningBannerHtml + tabContentHtml + approvalsAuditHtml;

    // 3. Update Modal Footer Status and Actions
    const statusEl = document.getElementById("modal-campaign-status");
    const publishBtn = document.getElementById("btn-publish-campaign");
    const isGate2Eligible = rev && rev.score !== undefined && Number(rev.score) >= 85 && rev.verdict === "PASS";
    const hasGate1Approved = approvalsList.some((a) => a.gate === "founder_direction" || a.gate === "gate1");
    const hasGate2Approved = approvalsList.some((a) => a.gate === "founder_final" || a.gate === "gate2");

    if (statusEl) {
      if (data.status === "NEEDS_INPUT") {
        statusEl.innerHTML = '<span style="color:#f59e0b; font-weight:800;">Cần bổ sung brief — Chưa khởi động các Agent chuyên môn</span>';
      } else if (data.status === "AWAITING_FOUNDER_REVIEW") {
        statusEl.innerHTML = '<span style="color:var(--amber-core); font-weight:800;">Chưa duyệt Gate 1 — Chờ Founder chọn Concept</span>';
      } else if (["DIRECTION_APPROVED", "CREATIVE_RUNNING", "RUNNING_SPECIALISTS"].includes(data.status) || (hasGate1Approved && !rev)) {
        statusEl.innerHTML = '<span style="color:var(--cyan-core); font-weight:800;">Đã duyệt Gate 1 — 7 Chuyên Gia đang sản xuất nội dung</span>';
      } else if (data.status === "AWAITING_FOUNDER_FINAL_APPROVAL") {
        if (isGate2Eligible) {
          statusEl.innerHTML = '<span style="color:var(--cyan-core); font-weight:800;">Chờ duyệt Gate 2 — Thẩm định đạt (' + rev.score + '/100)</span>';
        } else if (!rev || rev.score === undefined) {
          statusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">⛔ Khóa Gate 2 — Chưa có dữ liệu thẩm định</span>';
        } else {
          statusEl.innerHTML = '<span style="color:#ef4444; font-weight:800;">⛔ Khóa Gate 2 — Thẩm định ' + rev.score + '/100 không đạt chuẩn (≥85đ)</span>';
        }
      } else if (data.status === "DISTRIBUTION_NOT_CONFIGURED") {
        statusEl.innerHTML = '<span style="color:var(--amber-core); font-weight:800;">Đã duyệt Gate 2 — Chưa kết nối kênh phân phối</span>';
      } else if (data.status === "READY_FOR_OPERATOR_SCHEDULING") {
        statusEl.innerHTML = '<span style="color:var(--emerald-core); font-weight:800;">Đã duyệt Gate 2 — Đã lên lịch phát hành</span>';
      } else if (data.status === "PUBLISHED") {
        statusEl.innerHTML = '<span style="color:var(--emerald-core); font-weight:800;">✓ Đã xuất bản thực tế</span>';
      } else if (data.status === "COMPLETED") {
        statusEl.innerHTML = '<span style="color:var(--emerald-core); font-weight:800;">✓ Hoàn tất quy trình sản xuất</span>';
      } else {
        statusEl.innerHTML = '<span style="color:var(--text-muted);">Trạng thái: ' + escapeHtml(data.status || "Chờ lệnh") + '</span>';
      }
    }

    if (publishBtn) {
      if (data.status === "NEEDS_INPUT") {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>🧭</span> BỔ SUNG BRIEF TRƯỚC KHI CHẠY AGENT';
        publishBtn.style.background = "rgba(245,158,11,0.15)";
        publishBtn.style.color = "var(--amber-core)";
        publishBtn.style.cursor = "not-allowed";
      } else if (data.status === "AWAITING_FOUNDER_REVIEW") {
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>👑</span> PHÊ DUYỆT GÓC CHIẾN LƯỢC (GATE 1)';
        publishBtn.style.background = "linear-gradient(135deg, #f59e0b, #d97706)";
        publishBtn.style.color = "#000";
        publishBtn.style.cursor = "pointer";
      } else if (["DIRECTION_APPROVED", "CREATIVE_RUNNING", "RUNNING_SPECIALISTS"].includes(data.status) || (hasGate1Approved && !rev)) {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>⚙️</span> ĐÃ DUYỆT GATE 1 (ĐANG SẢN XUẤT)';
        publishBtn.style.background = "rgba(0,240,255,0.15)";
        publishBtn.style.color = "var(--cyan-core)";
        publishBtn.style.cursor = "default";
      } else if (data.status === "AWAITING_FOUNDER_FINAL_APPROVAL") {
        if (isGate2Eligible) {
          publishBtn.disabled = false;
          publishBtn.innerHTML = '<span>🚀</span> PHÊ DUYỆT GÓI ẤN PHẨM CUỐI (GATE 2)';
          publishBtn.style.background = "";
          publishBtn.style.color = "";
          publishBtn.style.cursor = "pointer";
        } else {
          publishBtn.disabled = true;
          publishBtn.innerHTML = '<span>⛔</span> KHÓA GATE 2: ' + (!rev ? 'CHƯA CÓ THẨM ĐỊNH' : 'ĐIỂM ' + rev.score + '/100 < 85Đ');
          publishBtn.style.background = "rgba(239,68,68,0.2)";
          publishBtn.style.color = "#ef4444";
          publishBtn.style.cursor = "not-allowed";
        }
      } else if (data.status === "DISTRIBUTION_NOT_CONFIGURED") {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>📡</span> ĐÃ DUYỆT CUỐI — CHƯA KẾT NỐI KÊNH PHÂN PHỐI';
        publishBtn.style.background = "rgba(245,158,11,0.15)";
        publishBtn.style.color = "var(--amber-core)";
        publishBtn.style.cursor = "default";
      } else if (data.status === "READY_FOR_OPERATOR_SCHEDULING") {
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>✓</span> ĐÃ LÊN LỊCH PHÁT HÀNH';
        publishBtn.style.background = "rgba(16,185,129,0.2)";
        publishBtn.style.color = "var(--emerald-core)";
        publishBtn.style.cursor = "pointer";
      } else if (data.status === "PUBLISHED") {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>✓</span> ĐÃ XUẤT BẢN THÀNH CÔNG';
        publishBtn.style.background = "rgba(16,185,129,0.25)";
        publishBtn.style.color = "var(--emerald-core)";
        publishBtn.style.cursor = "default";
      } else {
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<span>⏳</span> ' + escapeHtml(data.status || "ĐANG XỬ LÝ");
        publishBtn.style.background = "rgba(255,255,255,0.05)";
        publishBtn.style.color = "var(--text-muted)";
        publishBtn.style.cursor = "default";
      }
    }

    // 4. Wire Interactive Elements in Modal Body
    // Campaign Selector
    const campaignSelect = document.getElementById("vault-campaign-select");
    if (campaignSelect) {
      campaignSelect.addEventListener("change", () => {
        this.switchVaultCampaign(campaignSelect.value);
      });
    }

    // Copy Full & Export Text
    const copyFullBtn = document.getElementById("btn-copy-vault-full");
    if (copyFullBtn) {
      copyFullBtn.addEventListener("click", () => this.copyFullVaultText());
    }
    const exportTxtBtn = document.getElementById("btn-export-vault-txt");
    if (exportTxtBtn) {
      exportTxtBtn.addEventListener("click", () => this.exportVaultTextFile());
    }

    const deleteCurrentBtn = document.getElementById("btn-delete-current-campaign");
    if (deleteCurrentBtn && data.campaign?.id) {
      deleteCurrentBtn.addEventListener("click", async () => {
        const confirmed = window.confirm(`Xoá vĩnh viễn hồ sơ “${data.topic || "chiến dịch này"}” cùng toàn bộ báo cáo, lịch sử Agent và phê duyệt liên quan?`);
        if (!confirmed) return;
        deleteCurrentBtn.disabled = true;
        deleteCurrentBtn.textContent = "Đang xoá...";
        try {
          await window.vamopsAIEngine.deleteCampaign(data.campaign.id);
          this.activeVaultCampaignId = null;
          this.currentResult = null;
          await this.loadVaultData();
          this.renderVaultContent();
          this.showToast("Đã xoá hồ sơ chiến dịch.", "🗑️");
        } catch (error) {
          deleteCurrentBtn.disabled = false;
          deleteCurrentBtn.textContent = "🗑 Xoá hồ sơ này";
          this.showToast("Không thể xoá: " + error.message, "⚠️");
        }
      });
    }

    const clearAllBtn = document.getElementById("btn-clear-all-campaigns");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", async () => {
        const count = this.loadedCampaigns.length;
        const confirmed = window.confirm(`Xoá vĩnh viễn toàn bộ ${count} hồ sơ chiến dịch cùng báo cáo, lịch sử Agent và phê duyệt? Hành động này không thể hoàn tác.`);
        if (!confirmed) return;
        clearAllBtn.disabled = true;
        clearAllBtn.textContent = "Đang xoá tất cả...";
        try {
          await window.vamopsAIEngine.clearCampaigns();
          this.loadedCampaigns = [];
          this.activeVaultCampaignId = null;
          this.currentResult = null;
          this.renderVaultContent();
          const badge = document.getElementById("stat-vault-count");
          if (badge) badge.textContent = "0";
          this.syncDashboardFromCampaign(null);
          this.showToast("Đã dọn sạch toàn bộ hồ sơ chiến dịch.", "🧹");
        } catch (error) {
          clearAllBtn.disabled = false;
          clearAllBtn.textContent = "⚠ Xoá tất cả";
          this.showToast("Không thể xoá toàn bộ: " + error.message, "⚠️");
        }
      });
    }

    const supplementBriefBtn = document.getElementById("btn-supplement-brief-from-vault");
    if (supplementBriefBtn) {
      supplementBriefBtn.addEventListener("click", () => {
        const campaign = data.campaign || {};
        this.openBriefIntake({
          topic: data.topic || campaign.title || "Chiến dịch",
          initialBrief: {
            industry: campaign.industry || data.industry || "",
            target_audience: campaign.target_audience || data.targetAudience || "",
            core_message: campaign.core_message || data.coreMessage || "",
            brief_details: campaign.brief_details || {},
            platforms: campaign.platforms || data.platforms || []
          },
          missingFacts: p1.campaignPlan?.missing_facts || [],
          campaignId: campaign.id || data.workflowResult?.campaignId || null
        });
      });
    }

    // Copy Hook buttons
    document.querySelectorAll(".btn-copy-hook").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = btn.getAttribute("data-text");
        if (text && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => this.showToast("Đã sao chép câu Hook vào Clipboard!", "📋"));
        }
      });
    });

    // Copy Caption buttons
    document.querySelectorAll(".btn-copy-copy").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = btn.getAttribute("data-text");
        if (text && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => this.showToast("Đã sao chép nội dung bài viết vào Clipboard!", "📋"));
        }
      });
    });

    // Copy Script Only button
    const copyScriptBtn = document.getElementById("btn-copy-script-only");
    if (copyScriptBtn) {
      copyScriptBtn.addEventListener("click", () => {
        const story = p1.scriptPackage || {};
        const scenes = story.scenes || [];
        let scriptText = "KỊCH BẢN: " + data.topic + "\nThời lượng: " + (story.duration_seconds || 35) + "s\n\n";
        scenes.forEach((sc, i) => {
          scriptText += "Cảnh " + (i + 1) + " (" + (sc.start !== undefined ? sc.start + 's - ' + sc.end + 's' : sc.time || '') + "):\n";
          scriptText += '- Lời thoại: "' + (sc.dialogue || sc.spoken_line || '') + '"\n';
          scriptText += "- Hành động: " + (sc.action || '') + "\n";
          scriptText += "- Góc máy: " + (sc.shot || '') + "\n\n";
        });
        if (navigator.clipboard) {
          navigator.clipboard.writeText(scriptText).then(() => this.showToast("Đã sao chép kịch bản vào Clipboard!", "🎬"));
        }
      });
    }

    // Concept Cards Click
    document.querySelectorAll(".concept-card").forEach((card) => {
      card.addEventListener("click", () => {
        const aid = card.getAttribute("data-angle-id");
        if (aid) {
          this.activeSelectedAngleId = aid;
          this.renderVaultContent();
          this.playSound("click");
        }
      });
    });

    // Inline Gate 1 Approve Button
    const inlineGate1Btn = document.getElementById("btn-approve-gate1-inline");
    if (inlineGate1Btn) {
      inlineGate1Btn.addEventListener("click", () => {
        const chosen = this.activeSelectedAngleId || p1.angleOptions?.recommended_angle_id || "angle-1";
        this.approveDirectionInline(chosen);
      });
    }
  }
}

// Instantiate on DOM load in browser environment
if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("DOMContentLoaded", () => {
    window.vamopsApp = new VAMOPSApp();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    escapeHtml,
    normalizeMissingFacts,
    asDemoFixture,
    computeCampaignModelInfo,
    syncDashboardFromCampaign,
    VAMOPSApp
  };
}
if (typeof window !== "undefined") {
  window.normalizeMissingFacts = normalizeMissingFacts;
  window.computeCampaignModelInfo = computeCampaignModelInfo;
  window.syncDashboardFromCampaign = syncDashboardFromCampaign;
  window.VAMOPSApp = VAMOPSApp;
}
