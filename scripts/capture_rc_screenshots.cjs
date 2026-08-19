const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BYPASS_SECRET = 'DHFrIJkcyuWmbaaMAPfCEnfX7g9Rdrt2';
const BASE_URL = 'https://prosthetics-hero-llmp1ocxt-vuanhmedia.vercel.app';
const URL_WITH_BYPASS = `${BASE_URL}?x-vercel-protection-bypass=${BYPASS_SECRET}&x-vercel-set-bypass-cookie=samesitenone`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../screenshots_rc');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function captureRC() {
  console.log('Launching Chrome for RC screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    // 1. Desktop Hero Screenshot (1440x900)
    console.log('Capturing Desktop Hero...');
    const pageDesk = await browser.newPage();
    await pageDesk.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesk.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    await pageDesk.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    const heroEl = await pageDesk.$('#top');
    if (heroEl) {
      await heroEl.screenshot({ path: path.join(OUT_DIR, '01_desktop_hero_scaled.png') });
      console.log('Saved: 01_desktop_hero_scaled.png');
    }
    await pageDesk.close();

    // 2. Mobile Hero + Closed Nav Screenshot (375x812)
    console.log('Capturing Mobile Hero (Closed Nav)...');
    const pageMob = await browser.newPage();
    await pageMob.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await pageMob.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    await pageMob.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    await pageMob.screenshot({ path: path.join(OUT_DIR, '02_mobile_hero_closed_nav.png') });
    console.log('Saved: 02_mobile_hero_closed_nav.png');

    // 3. Mobile Open Menu Screenshot (375x812)
    console.log('Opening mobile menu...');
    const menuBtn = await pageMob.$('button[aria-label="Mở menu"], button[aria-label="Đóng menu"], .sm\\:hidden button');
    if (menuBtn) {
      await menuBtn.click();
      await new Promise(r => setTimeout(r, 500));
      await pageMob.screenshot({ path: path.join(OUT_DIR, '03_mobile_open_menu.png') });
      console.log('Saved: 03_mobile_open_menu.png');
    } else {
      console.warn('Mobile menu button not found!');
    }
    await pageMob.close();

    console.log('\nALL RC SCREENSHOTS CAPTURED SUCCESSFULLY!');
  } catch (err) {
    console.error('RC Capture Error:', err);
  } finally {
    await browser.close();
  }
}

captureRC();
