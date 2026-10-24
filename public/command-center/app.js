/**
 * VAMOPS COMMAND CENTER — ỨNG DỤNG ĐIỀU PHỐI VÀ MÔ PHỎNG WORKFLOW (V2.5 PRODUCTION GRADE)
 * Vũ Anh Media Operations — Tích hợp Full AI Engine & DNA Founder Vũ Anh
 */

class VAMOPSApp {
  constructor() {
    this.scene3d = null;
    this.selectedAgent = null;
    this.selectedZone = null;
    this.isSimulating = false;
    this.soundEnabled = true;
    this.audioCtx = null;
    this.activeCampaignId = "camp-01";
    this.selectedModalTab = "beatsheet";
    this.selectedAITab = "models";
    this.currentResult = null;
    this.toastTimer = null;

    this.init();
  }

  init() {
    // 1. Initialize 3D Scene
    this.scene3d = new VAMOPSScene3D("canvas-3d-container");

    // 2. Setup Global Callbacks
    window.onAgentSelected = (agent) => this.selectAgent(agent);
    window.onZoneSelected = (zone) => this.selectZone(zone);

    // 3. Set initial campaign result
    this.currentResult = VAMOPS_DATA.sampleExecutionResults["camp-01"];

    // 4. Bind UI Events
    this.bindDOMEvents();

    // 5. Populate Agent Roster Bar
    this.renderAgentRoster();

    // 6. Select Default Agent (CMO) without hijacking initial overview camera
    this.selectAgent(VAMOPS_DATA.agents[0], false);

    // 7. Update Clock and AI Status
    this.startSystemClock();
    this.updateAIStatusBadge();
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
      if (window.vamopsAIEngine.isLive()) {
        headerLabel.classList.remove("highlight-cyan");
        headerLabel.classList.add("highlight-green");
      } else {
        headerLabel.classList.remove("highlight-green");
        headerLabel.classList.add("highlight-cyan");
      }
    }

    const footerLabel = document.getElementById("active-model-footer-label");
    if (footerLabel) {
      footerLabel.textContent = fullLabel;
    }
  }

  // --- UI BINDINGS ---
  bindDOMEvents() {
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
          this.currentResult = VAMOPS_DATA.sampleExecutionResults[campId] || window.vamopsAIEngine.generateOfflineDNA(camp.topic);
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
      launchBtn.addEventListener("click", () => this.runMissionSimulation());
    }

    // Vault Modal Open/Close
    const openVaultBtn = document.getElementById("btn-open-vault");
    const vaultModal = document.getElementById("vault-modal");
    const closeVaultBtn = document.getElementById("btn-close-vault");

    if (openVaultBtn && vaultModal) {
      openVaultBtn.addEventListener("click", () => {
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

    // Publish Campaign Button in Modal
    const publishBtn = document.getElementById("btn-publish-campaign");
    if (publishBtn) {
      publishBtn.addEventListener("click", () => {
        const statusEl = document.getElementById("modal-campaign-status");
        if (statusEl) {
          statusEl.innerHTML = `<span style="color:var(--emerald-core); font-weight:800;">✅ ĐÃ DUYỆT & ĐANG PHÁT HÀNH TỰ ĐỘNG</span>`;
        }
        publishBtn.disabled = true;
        publishBtn.innerHTML = `<span>🎉</span> ĐÃ XUẤT BẢN THÀNH CÔNG`;
        publishBtn.style.background = "#047857";

        // Increment Vault Counter
        const counter = document.getElementById("stat-vault-count");
        if (counter) {
          const current = parseInt(counter.textContent) || 7;
          counter.textContent = current + 1;
        }

        this.playSound("success");
        this.showToast("Founder Vũ Anh đã ký duyệt! Bài viết & Video đang được phân phối tự động.", "🚀");
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
      if (clockEl) clockEl.textContent = `SOL ${sol} · ${timeStr} MTC`;

      if (weatherEl) {
        const temp = (-62.2 + Math.sin(now.getTime() * 0.0001) * 0.8).toFixed(1);
        const wind = (8.2 + Math.cos(now.getTime() * 0.0002) * 1.4).toFixed(1);
        weatherEl.textContent = `${temp}°C · Gió ${wind} m/s · Bụi 0.18 Tau`;
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
      const providers = [
        { id: "gemini", name: "Google Gemini (Gemini 2.0 Flash / Pro) — Tốc độ cao, JSON Schema chuẩn", icon: "⚡" },
        { id: "openai", name: "OpenAI (GPT-4o, GPT-4o-mini, o3-mini) — Sắc bén & Toàn diện", icon: "🧠" },
        { id: "openrouter", name: "OpenRouter (Claude 3.7 Sonnet, DeepSeek V3, DeepSeek R1)", icon: "🌐" },
        { id: "offline", name: "VAMOPS DNA Native Engine (Không cần API Key — Chuẩn văn phong Vũ Anh)", icon: "🧬" }
      ];

      const providerOptions = providers
        .map((p) => `<option value="${p.id}" ${config.provider === p.id ? "selected" : ""}>${p.icon} ${p.name}</option>`)
        .join("");

      const currentModels = window.vamopsAIEngine.modelsByProvider[config.provider] || window.vamopsAIEngine.modelsByProvider.gemini;
      const modelOptions = currentModels
        .map((m) => `<option value="${m.id}" ${config.model === m.id ? "selected" : ""}>${m.name}</option>`)
        .join("");

      body.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <div class="ai-card-info">
            <strong style="color:var(--cyan-bright); font-size:14px;">💡 Hướng dẫn cấu hình AI Thực tế:</strong><br/>
            Bạn có thể kết nối bất kỳ mô hình AI hiện đại nào hoặc dùng trực tiếp <strong>VAMOPS DNA Native Engine</strong> (hoàn toàn miễn phí, không cần key). Mọi thiết lập được lưu an toàn trên máy của bạn (localStorage).
          </div>

          <div class="ai-form-grid">
            <div class="ai-form-group">
              <label class="ai-form-label">Chọn Nhà Cung Cấp (Provider)</label>
              <select id="ai-select-provider" class="ai-select">${providerOptions}</select>
            </div>

            <div class="ai-form-group">
              <label class="ai-form-label">Mô Hình AI (Model)</label>
              <select id="ai-select-model" class="ai-select">${modelOptions}</select>
            </div>
          </div>

          <div class="ai-form-group" id="group-api-key" style="${config.provider === "offline" ? "display:none;" : ""}">
            <label class="ai-form-label">
              <span>API Key của bạn</span>
              <span id="api-key-hint" style="color:var(--text-dim); font-size:11px;">Chỉ lưu cục bộ trên trình duyệt</span>
            </label>
            <div class="api-key-wrapper">
              <input type="password" id="ai-input-apikey" class="ai-input" placeholder="Dán API Key của bạn vào đây..." value="${config.apiKey || ""}">
              <button type="button" id="btn-toggle-apikey-vis" class="api-key-toggle-btn">👁️</button>
            </div>
          </div>

          <div class="ai-form-group">
            <label class="ai-form-label">
              <span>Nhiệt Độ Sáng Tạo (Temperature): <b id="val-temp" style="color:var(--cyan-core);">${config.temperature}</b></span>
              <span style="color:var(--text-dim); font-size:11px;">0.0 (Chuẩn xác kỷ luật) - 1.0 (Phóng khoáng)</span>
            </label>
            <input type="range" id="ai-slider-temp" min="0" max="1" step="0.05" value="${config.temperature}" class="ai-input" style="padding:4px 0;">
          </div>

          <div id="connection-status-box" style="display:none; padding:12px 16px; border-radius:var(--radius-sm); font-size:13px; font-weight:600;"></div>
        </div>
      `;

      // Event listeners for models tab
      const provSelect = document.getElementById("ai-select-provider");
      const modelSelect = document.getElementById("ai-select-model");
      const keyGroup = document.getElementById("group-api-key");
      const tempSlider = document.getElementById("ai-slider-temp");
      const tempVal = document.getElementById("val-temp");
      const keyInput = document.getElementById("ai-input-apikey");
      const toggleVisBtn = document.getElementById("btn-toggle-apikey-vis");

      if (provSelect && modelSelect) {
        provSelect.addEventListener("change", (e) => {
          const newProv = e.target.value;
          const models = window.vamopsAIEngine.modelsByProvider[newProv] || [];
          modelSelect.innerHTML = models
            .map((m) => `<option value="${m.id}">${m.name}</option>`)
            .join("");
          if (keyGroup) {
            keyGroup.style.display = newProv === "offline" ? "none" : "";
          }
        });
      }

      if (tempSlider && tempVal) {
        tempSlider.addEventListener("input", (e) => {
          tempVal.textContent = e.target.value;
        });
      }

      if (toggleVisBtn && keyInput) {
        toggleVisBtn.addEventListener("click", () => {
          const isPass = keyInput.type === "password";
          keyInput.type = isPass ? "text" : "password";
          toggleVisBtn.textContent = isPass ? "🔒" : "👁️";
        });
      }
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
    const provSelect = document.getElementById("ai-select-provider");
    const modelSelect = document.getElementById("ai-select-model");
    const keyInput = document.getElementById("ai-input-apikey");
    const tempSlider = document.getElementById("ai-slider-temp");

    if (!provSelect || !modelSelect || !window.vamopsAIEngine) return;

    const newConfig = {
      provider: provSelect.value,
      model: modelSelect.value,
      apiKey: keyInput ? keyInput.value.trim() : "",
      temperature: tempSlider ? parseFloat(tempSlider.value) : 0.7
    };

    window.vamopsAIEngine.saveConfig(newConfig);
    this.updateAIStatusBadge();
    this.playSound("success");
    this.showToast("Đã lưu cấu hình AI thành công: " + window.vamopsAIEngine.getActiveProviderLabel(), "💾");

    const modal = document.getElementById("ai-settings-modal");
    if (modal) modal.classList.remove("open");
  }

  async handleTestAIConnection() {
    const provSelect = document.getElementById("ai-select-provider");
    const modelSelect = document.getElementById("ai-select-model");
    const keyInput = document.getElementById("ai-input-apikey");
    const statusBox = document.getElementById("connection-status-box");

    const provider = provSelect ? provSelect.value : "gemini";
    const model = modelSelect ? modelSelect.value : "";
    const apiKey = keyInput ? keyInput.value.trim() : "";

    if (provider === "offline") {
      this.showToast("VAMOPS DNA Native Engine luôn sẵn sàng 100%!", "🧬");
      return;
    }

    if (!apiKey) {
      this.showToast("Vui lòng nhập API Key để kiểm tra kết nối.", "⚠️");
      if (keyInput) keyInput.focus();
      return;
    }

    if (statusBox) {
      statusBox.style.display = "block";
      statusBox.style.background = "rgba(0, 240, 255, 0.15)";
      statusBox.style.color = "var(--cyan-bright)";
      statusBox.textContent = `Đang kết nối thử nghiệm đến ${provider.toUpperCase()} (${model})...`;
    }

    try {
      await window.vamopsAIEngine.testConnection(provider, apiKey, model);
      if (statusBox) {
        statusBox.style.background = "rgba(16, 185, 129, 0.2)";
        statusBox.style.color = "var(--emerald-core)";
        statusBox.textContent = `✅ Kết nối thành công! API Key hợp lệ và Model ${model} sẵn sàng hoạt động.`;
      }
      this.playSound("success");
      this.showToast("Kết nối AI thành công tuyệt đối!", "✅");
    } catch (err) {
      if (statusBox) {
        statusBox.style.background = "rgba(244, 63, 94, 0.2)";
        statusBox.style.color = "var(--rose-core)";
        statusBox.textContent = `❌ Lỗi kết nối: ${err.message}`;
      }
      this.showToast("Lỗi kiểm tra kết nối AI!", "❌");
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
          <div class="spec-header">Lõi Mô Hình Tư Duy (AI Engine)</div>
          <div class="spec-text" style="color: var(--cyan-core); font-weight: 700; font-family: var(--font-mono);">
            ${agent.modelEngine}
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
            <span>💬</span> Trao Đổi Kịch Bản Trực Tiếp
          </button>
          <button class="btn-inspector-action" id="btn-inspector-vault">
            <span>📂</span> Mở Kho Ấn Phẩm Của Chuyên Gia
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
    VAMOPS_DATA.agents.forEach((agent) => {
      const chip = document.createElement("div");
      chip.className = "agent-chip";
      chip.setAttribute("data-agent-id", agent.id);
      chip.innerHTML = `
        <div class="avatar-sm" style="border-color:${agent.deptColor}">${agent.avatar}</div>
        <div class="agent-chip-info">
          <div class="chip-name">${agent.name}</div>
          <div class="chip-role">${agent.title.split("(")[0]}</div>
        </div>
      `;
      chip.addEventListener("click", () => this.selectAgent(agent));
      track.appendChild(chip);
    });
  }

  // --- MISSION SIMULATION (REAL AI EXECUTION) ---
  async runMissionSimulation() {
    if (this.isSimulating) return;
    this.isSimulating = true;

    const topicInput = document.getElementById("input-topic");
    const topic = topicInput ? topicInput.value.trim() : "Xây Dựng Cỗ Máy Media Tự Chủ B2B";
    const launchBtn = document.getElementById("btn-launch-mission");

    // Reset status in modal
    const modalStatusEl = document.getElementById("modal-campaign-status");
    if (modalStatusEl) {
      modalStatusEl.innerHTML = `<span style="color:var(--amber-core); font-weight:800;">Chờ Founder Vũ Anh Duyệt</span>`;
    }
    const publishBtn = document.getElementById("btn-publish-campaign");
    if (publishBtn) {
      publishBtn.disabled = false;
      publishBtn.innerHTML = `<span>🚀</span> DUYỆT & ĐĂNG NGAY TRÊN 3 NỀN TẢNG`;
      publishBtn.style.background = "";
    }

    launchBtn.disabled = true;
    launchBtn.innerHTML = `<span>⏳</span> ĐANG XỬ LÝ...`;
    this.playSound("launch");
    this.showToast("Cỗ máy VAMOPS đã kích hoạt cho chủ đề: " + topic.slice(0, 32) + "...", "🚀");

    // Reset pipeline step cards
    const stepCards = document.querySelectorAll(".step-card");
    stepCards.forEach((c) => {
      c.classList.remove("running", "completed");
      const badge = c.querySelector(".step-badge");
      if (badge) badge.textContent = "Chờ lệnh";
    });

    const setStepState = (stepIndex, state, badgeText) => {
      const card = stepCards[stepIndex];
      if (!card) return;
      card.classList.remove("running", "completed");
      if (state) card.classList.add(state);
      const badge = card.querySelector(".step-badge");
      if (badge) badge.textContent = badgeText;
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // ASYNC KICKOFF: Call AI Engine
    const aiPromise = window.vamopsAIEngine.generate(topic);

    // STEP 1: Họp Toàn Đội Tại Bàn Tròn Chiến Lược (War Room Meeting)
    setStepState(0, "running", "Họp toàn đội");
    this.scene3d.conveneWarRoomMeeting();
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-cmo"));
    this.scene3d.showFloatingBubble("agent-cmo", `Triệu tập 12 Chuyên Gia Sao Hoả: Triển khai chiến lược "${topic.substring(0, 30)}..."`, 4200);
    this.playSound("step");
    await delay(2800);
    this.scene3d.triggerDataPacket("zone-penthouse", "zone-intelligence", 0x00f0ff);
    setStepState(0, "completed", "Xong (Brief OK)");

    // STEP 2: Trở Về Bàn Làm Việc Độc Lập & Nghiên Cứu Chuyên Sâu
    setStepState(1, "running", "Về trạm đào sâu");
    this.scene3d.dismissToWorkstations();
    await delay(1200);
    this.scene3d.focusCameraOn("zone-intelligence");
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-psycho"));
    this.scene3d.showFloatingBubble("agent-psycho", "Hiểu khách trước khi định hướng: Bóc tách mạch kể và cảm xúc thật!", 4200);
    this.playSound("step");
    await delay(1800);
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-algo"));
    this.scene3d.showFloatingBubble("agent-algo", "Thuật toán nhịp thở 26s: Chuẩn bị 5 nhịp điện ảnh giàu cảm xúc!", 4200);
    await delay(2000);
    this.scene3d.triggerDataPacket("zone-intelligence", "zone-creative", 0x6366f1);
    setStepState(1, "completed", "Xong (3 Insights)");

    // Wait for AI generation result to be ready
    try {
      this.currentResult = await aiPromise;
      if (this.currentResult._fallbackNotice) {
        this.showToast(this.currentResult._fallbackNotice, "ℹ️");
      }
    } catch (e) {
      console.warn("AI generation failed, using offline fallback", e);
      this.currentResult = window.vamopsAIEngine.generateOfflineDNA(topic);
    }

    // STEP 3: Tạo Hook & Kịch Bản Điện Ảnh
    setStepState(2, "running", "Đang viết");
    this.scene3d.focusCameraOn("zone-creative");
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-hook"));
    const firstHook = this.currentResult.hooks?.[0]?.text || "Chế tác 3 Hook giữ chân: Bẻ gãy quán tính lướt!";
    this.scene3d.showFloatingBubble("agent-hook", `Hook 3s: "${firstHook.slice(0, 38)}..."`, 4200);
    this.playSound("step");
    await delay(1800);
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-story"));
    this.scene3d.showFloatingBubble("agent-story", "Phân cảnh Beat Sheet 05 nhịp chuẩn điện ảnh 26s hoàn tất!", 4200);
    await delay(2200);
    this.scene3d.triggerDataPacket("zone-creative", "zone-critic", 0xf43f5e);
    setStepState(2, "completed", "Xong (5 Beat Scenes)");

    // STEP 4: Thẩm Định Rubric & Phê Bình Khắt Khe
    setStepState(3, "running", "Đang chấm điểm");
    this.scene3d.focusCameraOn("zone-critic");
    const criticAgent = VAMOPS_DATA.agents.find((a) => a.id === "agent-critic");
    this.selectAgent(criticAgent);
    const score = this.currentResult.rubricScores?.total || 95;
    this.scene3d.showFloatingBubble("agent-critic", `Quét Rubric 5 tiêu chí: Tổng ${score}/100! Đạt chuẩn xuất sắc.`, 4500);
    this.playSound("step");
    await delay(2400);
    this.scene3d.triggerDataPacket("zone-critic", "zone-production", 0xf59e0b);
    setStepState(3, "completed", `Đạt ${score}/100 (Xuất sắc)`);

    // STEP 5: Visual Prompter, Sound & Swift Pipeline
    setStepState(4, "running", "Đang render");
    this.scene3d.focusCameraOn("zone-production");
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-visual"));
    this.scene3d.showFloatingBubble("agent-visual", "Sinh prompt 8K Kling / Runway: Anamorphic lens, amber & teal...", 4200);
    this.playSound("step");
    await delay(1500);
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-renderer"));
    this.scene3d.showFloatingBubble("agent-renderer", "Khớp mã lệnh render_pipeline.swift: Đổ kinetic text + SFX!", 4200);
    await delay(2400);
    this.scene3d.triggerDataPacket("zone-production", "zone-satellite", 0x10b981);
    setStepState(4, "completed", "Xong (Swift Ready)");

    // STEP 6: Lên Lịch & Cổng Phê Duyệt Founder
    setStepState(5, "running", "Lên sóng");
    this.scene3d.focusCameraOn("zone-penthouse");
    this.selectAgent(VAMOPS_DATA.agents.find((a) => a.id === "agent-seo"));
    this.scene3d.showFloatingBubble("agent-seo", "Lên lịch TikTok 20:00, Facebook 11:30, Threads 08:30!", 3800);
    this.playSound("step");
    await delay(1800);

    // FINISH
    setStepState(5, "completed", "Đã duyệt & Sẵn sàng");
    this.scene3d.focusCameraOn("overview");
    this.scene3d.showFloatingBubble("agent-cmo", "🎉 Chiến dịch hoàn tất! Mời Founder xem ấn phẩm trong Kho Bài Đã Duyệt.", 5500);
    this.playSound("success");

    this.showToast(`🎉 Hoàn tất! Kịch bản đã sẵn sàng trong Kho Bài [Lõi: ${this.currentResult.modelUsed || "VAMOPS DNA"}].`, "✨");

    launchBtn.disabled = false;
    launchBtn.innerHTML = `<span>🚀</span> KÍCH HOẠT HỆ THỐNG VAMOPS`;
    this.isSimulating = false;

    // Pulse glow on vault button
    const openVaultBtn = document.getElementById("btn-open-vault");
    if (openVaultBtn) {
      openVaultBtn.classList.add("pulse-glow");
    }
  }

  // --- RENDER VAULT CONTENT ---
  renderVaultContent() {
    const body = document.getElementById("vault-modal-body");
    if (!body) return;

    const data = this.currentResult || VAMOPS_DATA.sampleExecutionResults["camp-01"];
    if (!data) return;

    const modelBadge = data.modelUsed
      ? `<span style="font-size:11px; background:rgba(0,240,255,0.15); color:var(--cyan-core); border:1px solid var(--cyan-core); padding:2px 8px; border-radius:4px; font-family:var(--font-mono); font-weight:700;">LÕI: ${data.modelUsed}</span>`
      : "";

    if (this.selectedModalTab === "beatsheet") {
      let rowsHtml = data.beatSheet
        .map(
          (b) => `
        <tr>
          <td><span class="beat-tag">Cảnh ${b.beat}</span><br/><small style="color:var(--text-dim); font-family:var(--font-mono);">${b.time}</small></td>
          <td><strong style="color:var(--cyan-core);">${b.segment}</strong><br/><em>${b.kineticText}</em></td>
          <td style="color:#fbbf24; font-size:12px;">${b.sfx}</td>
          <td><div class="prompt-code">${b.prompt}</div></td>
        </tr>
      `
        )
        .join("");

      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
              <h3 style="color:var(--text-main); font-size:16px; margin:0;">${data.topic}</h3>
              ${modelBadge}
            </div>
            <p style="font-size:12.5px; color:var(--text-muted); margin:0;">Định dạng: 9:16 (1080 x 1920) · Thời lượng: 26.0 Giây · Phong cách: Cinematic High-End Studio Vũ Anh</p>
          </div>
          <button class="btn-pill" id="btn-copy-beatsheet">
            📋 Sao Chép Kịch Bản
          </button>
        </div>
        <table id="beatsheet-table" class="beatsheet-table">
          <thead>
            <tr>
              <th style="width:110px;">Phân Cảnh</th>
              <th style="width:280px;">Kinetic Text (Phụ Đề Chuyển Động)</th>
              <th style="width:230px;">Âm Thanh & SFX</th>
              <th>Prompt AI Video (Kling / Runway Gen-3 / Midjourney)</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;

      const copyBtn = document.getElementById("btn-copy-beatsheet");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          const text = document.getElementById("beatsheet-table").innerText;
          navigator.clipboard.writeText(text).then(() => {
            this.showToast("Đã sao chép toàn bộ kịch bản phân cảnh 26s!", "📋");
          });
        });
      }
    } else if (this.selectedModalTab === "rubric") {
      const r = data.rubricScores;
      let rubricCards = r.breakdown
        .map(
          (item) => `
        <div class="rubric-item-card">
          <div class="rubric-item-header">
            <span class="rubric-item-title">${item.name}</span>
            <span class="rubric-item-score">${item.score} đ</span>
          </div>
          <div class="rubric-bar-bg">
            <div class="rubric-bar-fill" style="width: ${(item.score / 25) * 100}%"></div>
          </div>
          <p class="rubric-note">${item.note}</p>
        </div>
      `
        )
        .join("");

      body.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.12); border:1.5px solid var(--emerald-core); border-radius: var(--radius-md); padding:18px; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:12px; font-weight:700; color:var(--emerald-core); text-transform:uppercase;">Kết Quả Hội Đồng Thẩm Định Khảo Thí VAMOPS</div>
              <h2 style="font-size:24px; color:var(--text-main); font-weight:900; margin-top:2px;">${r.total} / 100 ĐIỂM — ${r.status}</h2>
            </div>
            <span style="font-size:36px;">⚖️</span>
          </div>
          <p style="font-size:13.5px; color:var(--text-body); margin-top:10px;"><strong>Đánh giá của The Ruthless Critic:</strong> "${r.criticFeedback}"</p>
        </div>
        <div class="rubric-scorecard">${rubricCards}</div>
      `;
    } else if (this.selectedModalTab === "hooks") {
      let hooksHtml = data.hooks
        .map(
          (h, i) => `
        <div class="rubric-item-card" style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="beat-tag">Biến thể 0${i + 1} · ${h.type}</span>
            <span style="font-family:var(--font-mono); font-size:13px; color:var(--cyan-core); font-weight:800;">Dự báo giữ chân: ${h.retentionScore}%</span>
          </div>
          <p style="font-size:14px; font-weight:700; color:#ffffff; line-height:1.5;">"${h.text}"</p>
        </div>
      `
        )
        .join("");

      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="font-size:15px; color:var(--cyan-core); margin:0;">3 BIẾN THỂ HOOK ĐƯỢC CHẾ TÁC BỞI HOOK ARCHITECT:</h3>
          ${modelBadge}
        </div>
        ${hooksHtml}
      `;
    } else if (this.selectedModalTab === "distribution") {
      const dist = data.distribution;
      body.innerHTML = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:16px;">
          <div class="rubric-item-card">
            <h4 style="color:#00f0ff; font-size:14px; margin-bottom:10px;">📱 TIKTOK VIDEO (9:16)</h4>
            <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim); margin-bottom:8px;">LỊCH ĐĂNG: ${dist.tiktok.time}</div>
            <p style="font-size:13px; color:var(--text-body); line-height:1.45;">${dist.tiktok.caption}</p>
            <div style="margin-top:10px; font-size:11.5px; color:#fbbf24; font-family:var(--font-mono);">🎵 Âm thanh: ${dist.tiktok.soundtrack}</div>
          </div>

          <div class="rubric-item-card">
            <h4 style="color:#38bdf8; font-size:14px; margin-bottom:10px;">📘 FACEBOOK POST (LONG-FORM)</h4>
            <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim); margin-bottom:8px;">LỊCH ĐĂNG: ${dist.facebook.time}</div>
            <strong style="font-size:12.5px; color:#ffffff; display:block; margin-bottom:6px;">${dist.facebook.title}</strong>
            <p style="font-size:12.5px; color:var(--text-muted); line-height:1.45;">${dist.facebook.snippet}</p>
          </div>

          <div class="rubric-item-card">
            <h4 style="color:#f43f5e; font-size:14px; margin-bottom:10px;">🧵 THREADS CHUỖI 5 PHẦN</h4>
            <div style="font-size:11px; font-family:var(--font-mono); color:var(--text-dim); margin-bottom:8px;">LỊCH ĐĂNG: ${dist.threads.time}</div>
            <p style="font-size:12.5px; color:var(--text-body); line-height:1.45;">${dist.threads.threadSnippet}</p>
          </div>
        </div>
      `;
    } else if (this.selectedModalTab === "swiftcode") {
      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="color:var(--emerald-core); font-size:14px;">LỆNH KÍCH HOẠT DỰNG TỰ ĐỘNG BẰNG SWIFT ENGINE:</h4>
          <button class="btn-pill" id="btn-copy-swift">
            📋 Copy Lệnh Chạy
          </button>
        </div>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">
          Tệp kịch bản được liên kết trực tiếp với mã nguồn tự động hóa của Vũ Anh Media Ops tại <code>docs/video_automation/render_pipeline.swift</code>.
        </p>
        <pre class="prompt-code" style="padding:16px; font-size:12px; line-height:1.6; color:#34d399;">
# Mở Terminal trong thư mục video_automation và chạy:
cd /Users/vamops/Documents/WEBSITE/VuAnh-Media/docs/video_automation
swift render_pipeline.swift

# Kết quả: Tự động ghép 5 clips, render Kinetic Typography và xuất file:
# => output/vuanh_media_ops_26s.mp4 (1080x1920, 30fps)</pre>
      `;

      const copySwiftBtn = document.getElementById("btn-copy-swift");
      if (copySwiftBtn) {
        copySwiftBtn.addEventListener("click", () => {
          navigator.clipboard.writeText("cd /Users/vamops/Documents/WEBSITE/VuAnh-Media/docs/video_automation && swift render_pipeline.swift").then(() => {
            this.showToast("Đã copy lệnh swift render_pipeline.swift!", "⚙️");
          });
        });
      }
    }
  }
}

// Instantiate on DOM load
window.addEventListener("DOMContentLoaded", () => {
  window.vamopsApp = new VAMOPSApp();
});
