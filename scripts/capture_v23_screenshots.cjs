const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BYPASS_SECRET = 'DHFrIJkcyuWmbaaMAPfCEnfX7g9Rdrt2';
const BASE_URL = 'https://prosthetics-hero-3y1u3ejrn-vuanhmedia.vercel.app';
const URL_WITH_BYPASS = `${BASE_URL}?x-vercel-protection-bypass=${BYPASS_SECRET}&x-vercel-set-bypass-cookie=samesitenone`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    // 1. Desktop Full Page (1440px)
    console.log('Capturing Desktop 1440px...');
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': BYPASS_SECRET
    });
    
    await pageDesktop.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500)); // wait for transitions & imagery
    
    await pageDesktop.screenshot({
      path: path.join(OUT_DIR, 'desktop_1440_full.png'),
      fullPage: true
    });
    console.log('Saved: desktop_1440_full.png');

    // Section Screenshots
    const sectionsToCapture = [
      { id: 'top', filename: '01_hero.png' },
      { id: 'projects', filename: '02_projects.png' },
      { id: 'services', filename: '03_business_lines.png' },
      { id: 'media-ops', filename: '04_media_ops.png' },
      { id: 'team', filename: '08_team.png' },
      { id: 'partners', filename: '09_partners.png' },
      { id: 'contact', filename: '10_contact.png' }
    ];

    for (const item of sectionsToCapture) {
      const el = await pageDesktop.$(`#${item.id}`);
      if (el) {
        await el.screenshot({ path: path.join(OUT_DIR, item.filename) });
        console.log(`Saved section: ${item.filename}`);
      } else {
        console.warn(`Could not find #${item.id}`);
      }
    }

    const allSections = await pageDesktop.$$('section');
    console.log(`Total sections found: ${allSections.length}`);
    
    if (allSections[4]) {
      await allSections[4].screenshot({ path: path.join(OUT_DIR, '05_bottlenecks.png') });
      console.log('Saved: 05_bottlenecks.png');
    }
    if (allSections[5]) {
      await allSections[5].screenshot({ path: path.join(OUT_DIR, '06_07_process_and_scope.png') });
      console.log('Saved: 06_07_process_and_scope.png');
    }

    await pageDesktop.close();

    // 2. Tablet Full Page (768px)
    console.log('Capturing Tablet 768px...');
    const pageTablet = await browser.newPage();
    await pageTablet.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
    await pageTablet.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': BYPASS_SECRET
    });
    await pageTablet.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await pageTablet.screenshot({
      path: path.join(OUT_DIR, 'tablet_768_full.png'),
      fullPage: true
    });
    console.log('Saved: tablet_768_full.png');
    await pageTablet.close();

    // 3. Mobile Full Page (375px)
    console.log('Capturing Mobile 375px...');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await pageMobile.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': BYPASS_SECRET
    });
    await pageMobile.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await pageMobile.screenshot({
      path: path.join(OUT_DIR, 'mobile_375_full.png'),
      fullPage: true
    });
    console.log('Saved: mobile_375_full.png');
    await pageMobile.close();

    console.log('ALL SCREENSHOTS CAPTURED PERFECTLY!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
