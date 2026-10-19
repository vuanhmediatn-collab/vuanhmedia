/**
 * VŨ ANH MEDIA - AGENCY STUDIO PRO ENHANCER (LIGHT THEME & 50MB DAM PICKER)
 * Tự động chuyển giao diện sang chuẩn Agency Quốc Tế (Trắng sáng, rõ ràng, chi tiết)
 * Sửa triệt để nút [🖼️ Chọn] và thanh công cụ Media 11 Sections
 */

(function () {
  const SCRIPT_ID = 'va-agency-enhancer-injected';
  if (document.getElementById(SCRIPT_ID)) {
    console.log('[VŨ ANH] Agency Enhancer already loaded.');
    return;
  }

  const marker = document.createElement('div');
  marker.id = SCRIPT_ID;
  marker.style.display = 'none';
  document.body.appendChild(marker);

  // 1. INJECT WHITE AGENCY CSS
  const styleEl = document.createElement('style');
  styleEl.id = 'va-agency-light-theme-styles';
  styleEl.innerHTML = `
    /* ========================================================= */
    /* VŨ ANH STUDIO PRO - INTERNATIONAL AGENCY LIGHT THEME      */
    /* ========================================================= */
    :root {
      --studio-bg: #F8FAFC !important;
      --studio-panel-bg: #FFFFFF !important;
      --studio-panel-subtle: #F1F5F9 !important;
      --studio-card-bg: #FFFFFF !important;
      --studio-input-bg: #FFFFFF !important;
      --studio-border: #E2E8F0 !important;
      --studio-border-hover: #CBD5E1 !important;
      --studio-border-active: #0284C7 !important;
      --studio-text-main: #0F172A !important;
      --studio-text-secondary: #475569 !important;
      --studio-text-muted: #64748B !important;
      --studio-cyan: #0284C7 !important;
      --studio-cyan-glow: rgba(2, 132, 199, 0.15) !important;
      --studio-cyan-hover: #0369A1 !important;
      --studio-danger: #EF4444 !important;
      --studio-success: #10B981 !important;
      --studio-warning: #F59E0B !important;
    }

    body, .cms-dark-app, [class*="studio-pro-container"], [class*="appRoot"] {
      background: #F8FAFC !important;
      color: #0F172A !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif !important;
    }

    /* Sidebars & Panels */
    aside, [class*="studio-sidebar"], [class*="studio-inspector"], [class*="studio-control-group"], [class*="studio-panel"] {
      background-color: #FFFFFF !important;
      border-color: #E2E8F0 !important;
      color: #0F172A !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
    }

    /* Topbar */
    header, [class*="studio-topbar"], [class*="studio-header"] {
      background-color: #FFFFFF !important;
      border-bottom: 1px solid #E2E8F0 !important;
      color: #0F172A !important;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03) !important;
    }

    /* Section Navigation Buttons */
    [class*="studio-section-btn"], [class*="studio-nav-item"], button[class*="sectionItem"] {
      background-color: #FFFFFF !important;
      color: #334155 !important;
      border: 1px solid #E2E8F0 !important;
      font-weight: 600 !important;
      transition: all 0.15s ease !important;
    }
    [class*="studio-section-btn"]:hover, [class*="studio-nav-item"]:hover {
      background-color: #F1F5F9 !important;
      color: #0F172A !important;
      border-color: #CBD5E1 !important;
    }
    [class*="studio-section-btn"][class*="active"], [class*="studio-nav-item"][class*="active"] {
      background-color: #0284C7 !important;
      color: #FFFFFF !important;
      border-color: #0284C7 !important;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25) !important;
    }

    /* Form Inputs, Dropdowns, Textareas */
    input[type="text"], input[type="number"], select, textarea, [class*="studio-input"] {
      background-color: #FFFFFF !important;
      color: #0F172A !important;
      border: 1px solid #CBD5E1 !important;
      border-radius: 8px !important;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02) !important;
    }
    input[type="text"]:focus, select:focus, textarea:focus, [class*="studio-input"]:focus {
      border-color: #0284C7 !important;
      outline: 2px solid rgba(2, 132, 199, 0.2) !important;
    }

    /* Field Labels */
    label, [class*="studio-field-label"], [class*="studio-group-title"] {
      color: #1E293B !important;
      font-weight: 700 !important;
    }

    /* Focal Point Matrix */
    div[style*="gridTemplateColumns: repeat(3, 36px)"] {
      background: #F1F5F9 !important;
      border: 1px solid #CBD5E1 !important;
    }
    div[style*="gridTemplateColumns: repeat(3, 36px)"] button {
      background: #FFFFFF !important;
      color: #0F172A !important;
      border: 1px solid #CBD5E1 !important;
    }
    div[style*="gridTemplateColumns: repeat(3, 36px)"] button:hover {
      background: #E2E8F0 !important;
    }

    /* Toast Notifications */
    [class*="studio-toast"] {
      background: #0F172A !important;
      color: #FFFFFF !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
      border-radius: 12px !important;
    }

    /* Floating Agency Badge */
    #va-floating-agency-badge {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 9999px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      color: #0F172A;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    #va-floating-agency-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
      border-color: #0284C7;
    }

    /* Media Picker Modal */
    #va-dam-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    #va-dam-modal-card {
      background: #FFFFFF;
      border-radius: 20px;
      width: 100%;
      max-width: 900px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      border: 1px solid #E2E8F0;
    }
    .va-dam-head {
      padding: 18px 24px;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .va-dam-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
      padding: 20px;
      overflow-y: auto;
      max-height: 55vh;
    }
    .va-dam-item {
      aspect-ratio: 1;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      background: #F8FAFC;
      transition: all 0.15s ease;
    }
    .va-dam-item:hover {
      border-color: #0284C7;
      transform: scale(1.03);
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);
    }
    .va-dam-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .va-dam-item .va-tag {
      position: absolute;
      bottom: 4px;
      left: 4px;
      right: 4px;
      background: rgba(0,0,0,0.6);
      color: #fff;
      font-size: 9px;
      padding: 2px 4px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(styleEl);

  // 2. CREATE FLOATING BADGE
  const badge = document.createElement('div');
  badge.id = 'va-floating-agency-badge';
  badge.innerHTML = `
    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10B981;"></span>
    <span>AGENCY LIGHT MODE 50MB</span>
  `;
  document.body.appendChild(badge);

  // 3. ATTACH MEDIA PICKER HANDLER TO [🖼️ Chọn] BUTTONS
  const SUPABASE_URL = 'https://rjylcqtiicmhhhpuxuyw.supabase.co';
  const ANON_KEY = 'sb_publishable_8eg-XoTohtULfR_xHBpm6A_bLNf5qUs';

  async function openDAMModal(targetInput) {
    let overlay = document.getElementById('va-dam-modal-overlay');
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = 'va-dam-modal-overlay';
    overlay.innerHTML = `
      <div id="va-dam-modal-card">
        <div class="va-dam-head">
          <div>
            <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 0;">Kho Media DAM (Hạn mức 50MB Miễn phí)</h3>
            <span style="font-size: 11px; color: #64748B;">Nhấp chọn ảnh/video hoặc tải tệp mới từ máy tính</span>
          </div>
          <button id="va-dam-close-btn" style="background:#F1F5F9; border:none; border-radius:8px; padding:6px 12px; cursor:pointer; font-weight:700; color:#475569;">Đóng ✕</button>
        </div>
        <div style="padding: 14px 20px; border-bottom: 1px solid #E2E8F0; background: #F8FAFC; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
          <input type="file" id="va-dam-upload-input" accept="image/*,video/mp4" style="font-size: 11px;" />
          <button id="va-dam-upload-btn" style="background:#0284C7; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:700; font-size:11px; cursor:pointer;">⬆ Tải lên Supabase (Max 50MB)</button>
        </div>
        <div id="va-dam-loading" style="padding: 40px; text-align: center; color: #64748B; font-size: 12px; font-weight: 600;">
          Đang nạp danh sách tài sản Media...
        </div>
        <div class="va-dam-grid" id="va-dam-grid" style="display:none;"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('va-dam-close-btn').onclick = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    // Load assets from cms_media
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cms_media?select=*&order=created_at.desc&limit=80`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
      });
      const items = await res.json();
      const grid = document.getElementById('va-dam-grid');
      const loader = document.getElementById('va-dam-loading');

      if (grid && loader) {
        loader.style.display = 'none';
        grid.style.display = 'grid';
        grid.innerHTML = '';

        items.forEach((item) => {
          const div = document.createElement('div');
          div.className = 'va-dam-item';
          const url = item.public_url || item.storage_path;
          const isVideo = item.media_type === 'video' || (url && url.endsWith('.mp4'));

          div.innerHTML = `
            ${isVideo 
              ? `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#0F172A; color:#fff; font-size:24px;">🎬</div>`
              : `<img src="${url}" loading="lazy" />`
            }
            <div class="va-tag">${item.file_name || 'Media Item'}</div>
          `;

          div.onclick = () => {
            if (targetInput) {
              targetInput.value = url;
              // Dispatch native React events
              targetInput.dispatchEvent(new Event('input', { bubbles: true }));
              targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            overlay.remove();
          };
          grid.appendChild(div);
        });
      }
    } catch (err) {
      console.error('[VŨ ANH] Error fetching DAM:', err);
    }

    // Direct Upload Handler
    const uploadInput = document.getElementById('va-dam-upload-input');
    const uploadBtn = document.getElementById('va-dam-upload-btn');
    uploadBtn.onclick = async () => {
      const file = uploadInput.files[0];
      if (!file) {
        alert('Vui lòng chọn 1 tệp ảnh hoặc video từ máy tính trước!');
        return;
      }
      if (file.size > 52428800) {
        alert('Tệp vượt quá 50MB (giới hạn miễn phí an toàn của Supabase)!');
        return;
      }

      uploadBtn.innerText = 'Đang tải lên...';
      uploadBtn.disabled = true;

      const path = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      try {
        const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/vuanhmedia-assets/${path}`, {
          method: 'POST',
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            'Content-Type': file.type
          },
          body: file
        });

        if (uploadRes.ok) {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/vuanhmedia-assets/${path}`;
          if (targetInput) {
            targetInput.value = publicUrl;
            targetInput.dispatchEvent(new Event('input', { bubbles: true }));
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          alert('Tải lên thành công! Đường dẫn đã được điền vào mục Media.');
          overlay.remove();
        } else {
          alert('Lỗi tải tệp: ' + uploadRes.statusText);
        }
      } catch (e) {
        alert('Lỗi kết nối khi tải: ' + e.message);
      } finally {
        uploadBtn.innerText = '⬆ Tải lên Supabase (Max 50MB)';
        uploadBtn.disabled = false;
      }
    };
  }

  // Intercept button clicks globally
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const txt = btn.innerText || '';
    if (txt.includes('Chọn') || txt.includes('🖼️') || txt.includes('📁')) {
      const parent = btn.parentElement;
      const input = parent ? parent.querySelector('input') : null;
      if (input) {
        e.preventDefault();
        e.stopPropagation();
        openDAMModal(input);
      }
    }
  }, true);

  console.log('[VŨ ANH] Agency Enhancer Loaded Successfully.');
})();
