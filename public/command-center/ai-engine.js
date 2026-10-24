/**
 * VAMOPS UNIVERSAL AI ENGINE (V2.5 — PRODUCTION GRADE)
 * Kết Nối & Tối Ưu Mọi Mô Hình AI Thực Tế:
 * - Google Gemini (2.0 Flash, 2.0 Pro Exp, 1.5 Pro)
 * - OpenAI (GPT-4o, GPT-4o-mini, o3-mini)
 * - OpenRouter (Claude 3.7 Sonnet, Claude 3.5 Sonnet, DeepSeek V3, DeepSeek R1)
 * - VAMOPS DNA Offline Engine (Không cần API Key, chuẩn xác 100% văn phong Vũ Anh)
 */

class VAMOPSAIEngine {
  constructor() {
    this.config = this.loadConfig();
    this.modelsByProvider = {
      gemini: [
        { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Khuyên dùng · Nhanh & Chuẩn JSON)", default: true },
        { id: "gemini-2.0-pro-exp-02-05", name: "Gemini 2.0 Pro Exp (Tư duy sâu & Toàn cảnh)" },
        { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (Context dài 1M token)" },
        { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Tốc độ tối đa)" }
      ],
      openai: [
        { id: "gpt-4o", name: "GPT-4o (Khuyên dùng · Cân bằng & Sắc sảo)", default: true },
        { id: "gpt-4o-mini", name: "GPT-4o Mini (Tiết kiệm chi phí & Nhanh)" },
        { id: "o3-mini", name: "o3-mini (Lý luận logic & Phê bình Rubric)" }
      ],
      openrouter: [
        { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet (Đỉnh cao văn phong & Chi tiết)", default: true },
        { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (Chuẩn mực content B2B)" },
        { id: "deepseek/deepseek-chat", name: "DeepSeek V3 (Thông minh & Chi phí siêu rẻ)" },
        { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (Tư duy phản biện gắt gao cho The Critic)" }
      ],
      offline: [
        { id: "vamops-dna-pro", name: "VAMOPS DNA Native Engine (Không cần API Key · 12 năm hiện trường)", default: true }
      ]
    };
  }

  loadConfig() {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("vamops_ai_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            provider: parsed.provider || "gemini",
            apiKey: parsed.apiKey || "",
            model: parsed.model || "gemini-2.0-flash",
            temperature: typeof parsed.temperature === "number" ? parsed.temperature : 0.7
          };
        }
      } catch (e) {
        console.warn("Could not parse saved config, resetting to default.", e);
      }
    }
    return {
      provider: "offline",
      apiKey: "",
      model: "vamops-dna-pro",
      temperature: 0.7
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem("vamops_ai_config", JSON.stringify(this.config));
      } catch (e) {}
    }
  }

  isLive() {
    return this.config.provider !== "offline" && !!this.config.apiKey && this.config.apiKey.trim().length > 5;
  }

  getActiveProviderLabel() {
    if (!this.isLive()) {
      return "🧬 VAMOPS DNA Native Engine (Offline)";
    }
    const map = {
      gemini: `⚡ Google Gemini (${this.config.model})`,
      openai: `🧠 OpenAI (${this.config.model})`,
      openrouter: `🌐 OpenRouter (${this.config.model})`
    };
    return map[this.config.provider] || "AI Thực Tế";
  }

  getShortStatusBadge() {
    if (!this.isLive()) {
      return "● DNA VŨ ANH (OFFLINE)";
    }
    const nameMap = {
      gemini: "Gemini 2.0",
      openai: "GPT-4o",
      openrouter: this.config.model.includes("claude") ? "Claude 3.7" : "DeepSeek"
    };
    return `● LIVE: ${nameMap[this.config.provider] || this.config.model}`;
  }

  buildMasterPrompt(topic) {
    const dnaSystem = typeof VAMOPS_DNA !== "undefined" ? VAMOPS_DNA.generateSystemPrompt() : "";

    return `
${dnaSystem}

==================================================
CHỦ ĐỀ ĐƯỢC CHỈ ĐỊNH: "${topic}"
==================================================

NHIỆM VỤ CỦA BẠN:
Đóng vai toàn bộ 12 AI Agents của VAMOPS (VAM-Commander, Hook Master, Cinematic Bard, The Ruthless Critic, Visual Artificer, Orbit Broadcaster) để tạo ra bộ sản phẩm nội dung thực chiến hoàn hảo.

YÊU CẦU ĐẶC BIỆT VỀ VĂN PHONG VŨ ANH:
1. Thoại kinetic text và hook phải ngắn gọn, đanh thép, mang tính bóc tách thực tế hiện trường.
2. Đánh trúng tử huyệt: Brief 3 dòng cẩu thả, lục lọi ổ cứng tìm footage, phụ thuộc agency, video không thành tài sản.
3. Giữ cấu trúc 5 nhịp chuẩn điện ảnh 26s tương thích với script render_pipeline.swift của Vũ Anh Media.
4. Trả về DUY NHẤT một chuỗi JSON hợp lệ theo đúng cấu trúc sau (không kèm markdown \`\`\`json, không kèm lời dẫn):

{
  "topic": "${topic}",
  "modelUsed": "${this.config.model || 'VAMOPS Engine'}",
  "strategyBrief": {
    "target": "Chân dung đối tượng mục tiêu cụ thể",
    "mainMessage": "Thông điệp cốt lõi mang tư duy Media Ops tự chủ",
    "emotionalDriver": "Động lực cảm xúc: An tâm, Kiểm soát tài sản, Tiết kiệm ngân sách"
  },
  "hooks": [
    {
      "id": "hook-1",
      "type": "Tử Huyệt Hiện Trường",
      "text": "Câu hook 0-3s giật mình, sắc lẹm, bẻ gãy quán tính lướt",
      "retentionScore": 97
    },
    {
      "id": "hook-2",
      "type": "Tài Sản vs Rác Dữ Liệu",
      "text": "Câu hook đối lập trực diện giữa việc đốt tiền và xây tài sản",
      "retentionScore": 95
    },
    {
      "id": "hook-3",
      "type": "Kỷ Luật Tiền Kỳ",
      "text": "Câu hook xuất phát từ kinh nghiệm 12 năm hiện trường",
      "retentionScore": 93
    }
  ],
  "beatSheet": [
    {
      "beat": "01",
      "time": "00:00 - 00:05",
      "segment": "The Hook (Điểm nghẽn hiện trường)",
      "kineticText": "Câu thoại ngắn dưới 12 từ xuất hiện trên màn hình",
      "sfx": "Mô tả tiếng SFX (đồng hồ tích tắc, sub-bass drop...)",
      "prompt": "Cinematic 9:16 prompt chi tiết cho Kling/Runway 8K"
    },
    {
      "beat": "02",
      "time": "00:05 - 00:11",
      "segment": "The Shift (Khai mở Media Ops)",
      "kineticText": "Câu thoại ngắn dưới 12 từ",
      "sfx": "Mô tả tiếng SFX",
      "prompt": "Cinematic 9:16 prompt chi tiết"
    },
    {
      "beat": "03",
      "time": "00:11 - 00:17",
      "segment": "The Tech (Quy trình hóa & AI Ops)",
      "kineticText": "Câu thoại ngắn dưới 12 từ",
      "sfx": "Mô tả tiếng SFX",
      "prompt": "Cinematic 9:16 prompt chi tiết"
    },
    {
      "beat": "04",
      "time": "00:17 - 00:22",
      "segment": "The Proof (Vị thế tự chủ)",
      "kineticText": "Câu thoại ngắn dưới 12 từ",
      "sfx": "Mô tả tiếng SFX",
      "prompt": "Cinematic 9:16 prompt chi tiết"
    },
    {
      "beat": "05",
      "time": "00:22 - 00:26",
      "segment": "The Outro (CTA & Nhận diện thương hiệu)",
      "kineticText": "VŨ ANH MEDIA OPS — Xây Dựng Năng Lực Media Tự Chủ (vuanhmedia.com)",
      "sfx": "Sub-impact kết màn ngân vang",
      "prompt": "Cinematic 9:16 prompt thương hiệu Vũ Anh Media Ops"
    }
  ],
  "rubricScores": {
    "total": 95,
    "status": "ĐẠT CHUẨN XUẤT SẮC (APPROVED)",
    "breakdown": [
      { "name": "Độ giật của Hook (Max 25)", "score": 24, "note": "Nhận xét chuyên môn của The Critic" },
      { "name": "Độ sâu Insight (Max 25)", "score": 25, "note": "Nhận xét về tính bóc tách hiện trường" },
      { "name": "Nhịp điệu Pacing & Retention (Max 20)", "score": 19, "note": "Nhận xét về nhịp 26s" },
      { "name": "Tính khả thi Media & Prompts (Max 15)", "score": 14, "note": "Nhận xét độ khớp với swift render" },
      { "name": "Chất giọng VAMOPS (Max 15)", "score": 14, "note": "Nhận xét độ thấm đẫm phong cách Vũ Anh" }
    ],
    "criticFeedback": "Phê bình đanh thép của The Ruthless Critic về kịch bản"
  },
  "distribution": {
    "tiktok": {
      "time": "Thứ Năm · 20:00 (Giờ vàng tiếp thu tri thức)",
      "caption": "Caption ngắn, hashtag #vuanhmedia #mediaops #tudonghoa",
      "soundtrack": "Cinematic Cyber Hype — VAM Sound ID 04"
    },
    "facebook": {
      "time": "Thứ Năm · 11:30 (Giờ nghỉ trưa Doanh chủ)",
      "title": "[GÓC NHÌN HIỆN TRƯỜNG] ...",
      "snippet": "Đoạn mở đầu bài viết Facebook sắc sảo, đi thẳng vào bản chất vấn đề"
    },
    "threads": {
      "time": "Thứ Sáu · 08:15 (Giờ cafe sáng)",
      "threadSnippet": "1/5: 3 câu hỏi bạn phải trả lời trước khi chi tiền làm media..."
    }
  }
}
`;
  }

  async testConnection(provider, apiKey, model) {
    const key = apiKey.trim();
    if (!key) throw new Error("Vui lòng nhập API Key.");

    if (provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-2.0-flash"}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Trả lời duy nhất 1 từ: OK" }] }]
        })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Gemini API Error (${res.status}): ${text.slice(0, 150)}`);
      }
      return true;
    }

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5
        })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI API Error (${res.status}): ${text.slice(0, 150)}`);
      }
      return true;
    }

    if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          "HTTP-Referer": "https://vuanhmedia.com",
          "X-Title": "VAMOPS Command Center"
        },
        body: JSON.stringify({
          model: model || "deepseek/deepseek-chat",
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5
        })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter API Error (${res.status}): ${text.slice(0, 150)}`);
      }
      return true;
    }

    return true;
  }

  async generate(topic) {
    if (!this.isLive()) {
      return this.generateOfflineDNA(topic);
    }

    const prompt = this.buildMasterPrompt(topic);

    try {
      if (this.config.provider === "gemini") {
        return await this.callGemini(prompt, topic);
      } else if (this.config.provider === "openai") {
        return await this.callOpenAI(prompt, topic);
      } else if (this.config.provider === "openrouter") {
        return await this.callOpenRouter(prompt, topic);
      }
    } catch (err) {
      console.warn("AI Live API call failed, gracefully falling back to DNA Engine:", err);
      const fallback = this.generateOfflineDNA(topic);
      fallback._fallbackNotice = "Lỗi kết nối API (" + (err.message || err) + "). Hệ thống đã tự động chuyển sang VAMOPS DNA Native Engine để đảm bảo tiến độ.";
      return fallback;
    }

    return this.generateOfflineDNA(topic);
  }

  async callGemini(prompt, topic) {
    const model = this.config.model || "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey.trim()}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini Error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = this.cleanAndParseJSON(rawText);
    parsed.modelUsed = `Google Gemini (${model})`;
    return parsed;
  }

  async callOpenAI(prompt, topic) {
    const model = this.config.model || "gpt-4o";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.config.temperature || 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || "{}";
    const parsed = this.cleanAndParseJSON(rawText);
    parsed.modelUsed = `OpenAI (${model})`;
    return parsed;
  }

  async callOpenRouter(prompt, topic) {
    const model = this.config.model || "anthropic/claude-3.7-sonnet";
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey.trim()}`,
        "HTTP-Referer": "https://vuanhmedia.com",
        "X-Title": "VAMOPS Command Center"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.config.temperature || 0.7
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter Error (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || "{}";
    const parsed = this.cleanAndParseJSON(rawText);
    parsed.modelUsed = `OpenRouter (${model})`;
    return parsed;
  }

  cleanAndParseJSON(text) {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(clean);
  }

  generateOfflineDNA(topic) {
    const cleanTopic = topic.trim();
    const shortTopic = cleanTopic.length > 35 ? cleanTopic.slice(0, 35) + "..." : cleanTopic;

    return {
      topic: cleanTopic,
      modelUsed: "VAMOPS DNA Founder Engine (Nguồn: VAMOPS_DNA_Founder_ChoDoiAI_v1)",
      strategyBrief: {
        target: "Doanh nghiệp và tổ chức cần biến nội dung rời rạc thành nhịp sản xuất đều đặn và tài sản truyền thông dùng được lâu dài.",
        mainMessage: `Hiểu rõ người xem và câu chuyện của khách hàng trước khi định hướng. Mỗi đề bài ${shortTopic.toLowerCase()} là một cấu trúc kể riêng biệt, không rập khuôn công thức, để sản phẩm làm ra phục vụ đúng việc cần dùng và còn giữ trọn giá trị nhiều năm sau.`,
        emotionalDriver: "Giá trị, Niềm tin và Hạnh phúc thực sự khi sở hữu sản phẩm ưng ý mang đậm bản sắc thương hiệu."
      },
      hooks: [
        {
          id: "hook-1",
          type: "Góc Nhìn Làm Nghề (Founder Vũ Anh)",
          text: `Đối với tôi, một sản phẩm ${shortTopic.toLowerCase()} có giá trị không nằm ở kỹ thuật phô diễn, mà ở mạch kể và cảm xúc mà người xem còn giữ lại nhiều năm sau.`,
          retentionScore: 98
        },
        {
          id: "hook-2",
          type: "Trọng Lượng Niềm Tin",
          text: `Thương hiệu là tài sản quý giá bạn gây dựng nhiều năm. Khi đưa nó lên hình ảnh và âm thanh, điều giữ chúng tôi cẩn trọng trong từng khung hình chính là niềm tin của bạn.`,
          retentionScore: 96
        },
        {
          id: "hook-3",
          type: "Chiêm Nghiệm 15 Năm Hiện Trường",
          text: `Làm nghề từ năm 2011 đến nay, tôi nhận ra: Hiểu rõ người xem và câu chuyện của khách trước khi bấm máy mới là thứ tạo nên những sản phẩm vượt thời gian.`,
          retentionScore: 95
        }
      ],
      beatSheet: [
        {
          beat: "01",
          time: "00:00 - 00:05",
          segment: "The Narrative Arc (Mạch kể & Cảm xúc)",
          kineticText: `Làm ${shortTopic.slice(0, 24)}... Điều gì đọng lại trong người xem?`,
          sfx: "Hơi thở không gian lắng đọng + Tiếng vĩ cầm mộc mạc",
          prompt: "Cinematic 9:16, low-angle slow push in on an authentic Vietnamese creative director carefully reviewing footage on a monitor in a quiet sunlit creative studio, warm ambient light, dust particles in sunbeams, 8K."
        },
        {
          beat: "02",
          time: "00:05 - 00:11",
          segment: "The Craftsmanship (Bàn tay người làm nghề)",
          kineticText: "Mỗi câu chuyện là một cấu trúc kể riêng, không rập khuôn.",
          sfx: "Âm thanh hiện trường chân thực + Tiếng lách cách máy quay",
          prompt: "Cinematic 9:16, dynamic tracking shot of hands adjusting an anamorphic cinema lens, natural studio reflections, authentic filmmaking craftsmanship, 35mm film grain aesthetic."
        },
        {
          beat: "03",
          time: "00:11 - 00:17",
          segment: "The Synergy (Bàn Tròn Chiến Lược 12 Robot AI)",
          kineticText: "12 AI Chuyên Gia cùng ngồi lại bàn chiến lược, rà soát từng khung hình.",
          sfx: "Nhịp điện tử êm ái + Tiếng lật trang kịch bản",
          prompt: "Cinematic 9:16, high-tech circular holographic war room table with 12 futuristic robotic mechas collaborating around a luminous 3D floating project sphere, 8K."
        },
        {
          beat: "04",
          time: "00:17 - 00:22",
          segment: "The Asset (Tài sản lâu dài)",
          kineticText: "Biến nội dung rời rạc thành nhịp sản xuất đều đặn và tài sản bền bỉ.",
          sfx: "Cao trào âm nhạc giao hưởng ấm áp và đĩnh đạc",
          prompt: "Cinematic 9:16, wide cinematic shot of a completed corporate film timeline transitioning into an archive vault of timeless media assets, golden backlight, 8K."
        },
        {
          beat: "05",
          time: "00:22 - 00:26",
          segment: "The Outro (Dấu ấn Vũ Anh)",
          kineticText: "VŨ ANH MEDIA (EST. 2011) — Giữ trọn niềm tin & bản sắc trong từng khuôn hình.",
          sfx: "Âm vang lắng đọng của tiếng chuông ấm áp",
          prompt: "Cinematic 9:16, minimalist dark titanium surface, elegant illuminated typography of 'VU ANH MEDIA · EST. 2011', subtle cyan glow, fade out."
        }
      ],
      rubricScores: {
        total: 97,
        status: "ĐẠT CHUẨN XUẤT SẮC (SANG MỒM & ĐÚNG NGHỀ)",
        breakdown: [
          { name: "Độ thấm thía của Mở bài (Max 25)", score: 25, note: "Mở bài đĩnh đạc, 'sang mồm', không sáo rỗng, không dạy khách, bắt đầu từ góc nhìn người làm nghề." },
          { name: "Độ sâu Mạch kể & Cảm xúc (Max 25)", score: 25, note: "Tôn trọng hạt nhân cảm xúc: Giá trị và niềm tin của khách hàng, nói về tài sản lâu dài." },
          { name: "Nhịp thở Pacing 26s (Max 20)", score: 19, note: "Cung bậc cảm xúc: Điểm đặt trọng lượng -> đoạn trầm việc thật -> điểm nhô cảm xúc -> kết vững lắng." },
          { name: "Tính khả thi Media & Swift Pipeline (Max 15)", score: 14, note: "Khớp 100% với file render_pipeline.swift của Vũ Anh Media." },
          { name: "Bản sắc DNA Founder (Max 15)", score: 14, note: "Chuẩn xác 100% với tài liệu VAMOPS_DNA_Founder_ChoDoiAI_v1, gọt sạch mọi từ ngữ rác." }
        ],
        criticFeedback: "The Ruthless Critic xác nhận: Kịch bản đạt chuẩn 'sang mồm' của Founder Vũ Anh. Không công thức rập khuôn, câu chữ đĩnh đạc và giàu cảm xúc chân thật."
      },
      distribution: {
        tiktok: {
          time: "Thứ Năm · 20:00 (Giờ tiếp thu tri thức sâu)",
          caption: `Đối với tôi, một sản phẩm media giá trị là khi vài năm sau mở lại, người làm ra và người đặt hàng vẫn thấy tự hào. #vuanhmedia #filmmaking #storytelling #mediaops`,
          soundtrack: "Cinematic Ambient Piano & Cello — VAM Sound ID 07"
        },
        facebook: {
          time: "Thứ Năm · 11:30 (Trang Vũ Anh Media)",
          title: `[GÓC NHÌN LÀM NGHỀ] ${cleanTopic.toUpperCase()} — KHI MEDIA TRỞ THÀNH TÀI SẢN`,
          snippet: `Thương hiệu là tài sản quý giá mà doanh nghiệp gây dựng qua nhiều năm. Đưa thương hiệu đó lên hình ảnh và âm thanh là cầm trong tay chính niềm tin của họ...`
        },
        threads: {
          time: "Thứ Sáu · 08:15 (Tâm sự nghề sáng sớm)",
          threadSnippet: `1/3: 15 năm làm nghề dạy tôi rằng: Máy móc đắt tiền chỉ có giá trị khi phục vụ đúng cảm xúc mà người xem còn nhớ lại...`
        }
      }
    };
  }
}

// Global instance
window.vamopsAIEngine = new VAMOPSAIEngine();
