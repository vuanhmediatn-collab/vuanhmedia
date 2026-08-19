const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BYPASS_SECRET = 'DHFrIJkcyuWmbaaMAPfCEnfX7g9Rdrt2';
const BASE_URL = 'https://prosthetics-hero-68bj8ecup-vuanhmedia.vercel.app';
const URL_WITH_BYPASS = `${BASE_URL}?x-vercel-protection-bypass=${BYPASS_SECRET}&x-vercel-set-bypass-cookie=samesitenone`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../screenshots_v24');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function runVisualQA() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    // 1. Desktop 1440px Full Page & Sections
    console.log('Capturing Desktop 1440px...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': BYPASS_SECRET
    });

    // Start performance tracing
    const tracePath = path.join(OUT_DIR, 'performance_trace_1440.json');
    await page.tracing.start({ path: tracePath, screenshots: true });

    await page.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    // Scroll through page to trigger all reveals
    console.log('Triggering scroll reveals...');
    await page.evaluate(async () => {
      const distance = 400;
      const delay = 100;
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, distance);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 300));
    });

    await new Promise(r => setTimeout(r, 1000));

    // Full page screenshot
    await page.screenshot({
      path: path.join(OUT_DIR, 'desktop_1440_full.png'),
      fullPage: true
    });
    console.log('Saved: desktop_1440_full.png');

    // Section Screenshots
    const sections = [
      { id: 'top', filename: '01_hero.png' },
      { id: 'projects', filename: '02_projects.png' },
      { id: 'services', filename: '03_business_lines.png' },
      { id: 'media-ops', filename: '04_media_ops.png' },
      { id: 'team', filename: '08_team.png' },
      { id: 'partners', filename: '09_partners.png' },
      { id: 'contact', filename: '10_contact.png' }
    ];

    for (const sec of sections) {
      const el = await page.$(`#${sec.id}`);
      if (el) {
        await el.screenshot({ path: path.join(OUT_DIR, sec.filename) });
        console.log(`Saved section: ${sec.filename}`);
      }
    }

    // Capture Bottlenecks & Process
    const allSections = await page.$$('section');
    console.log('Total sections found:', allSections.length);
    if (allSections.length >= 5) {
      await allSections[4].screenshot({ path: path.join(OUT_DIR, '05_bottlenecks.png') });
      console.log('Saved: 05_bottlenecks.png');
    }
    if (allSections.length >= 6) {
      await allSections[5].screenshot({ path: path.join(OUT_DIR, '06_process.png') });
      console.log('Saved: 06_process.png');
    }
    if (allSections.length >= 7) {
      await allSections[6].screenshot({ path: path.join(OUT_DIR, '07_scope.png') });
      console.log('Saved: 07_scope.png');
    }

    // Simulate smooth scroll through entire page to verify motion & performance
    console.log('Simulating smooth scroll motion sequence...');
    const scrollSteps = 12;
    for (let i = 1; i <= scrollSteps; i++) {
      await page.evaluate((step, total) => {
        const height = document.body.scrollHeight - window.innerHeight;
        window.scrollTo({
          top: (height / total) * step,
          behavior: 'smooth'
        });
      }, i, scrollSteps);
      await new Promise(r => setTimeout(r, 400));
    }

    await page.tracing.stop();
    console.log('Performance trace saved:', tracePath);
    await page.close();

    // 2. Tablet 768px Full Page
    console.log('Capturing Tablet 768px...');
    const pageTablet = await browser.newPage();
    await pageTablet.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
    await pageTablet.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': BYPASS_SECRET
    });
    await pageTablet.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0', timeout: 30000 });
    await pageTablet.evaluate(async () => {
      const distance = 400;
      const delay = 100;
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, distance);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 1000));
    await pageTablet.screenshot({
      path: path.join(OUT_DIR, 'tablet_768_full.png'),
      fullPage: true
    });
    console.log('Saved: tablet_768_full.png');
    await pageTablet.close();

    // 3. Mobile 375px Full Page
    console.log('Capturing Mobile 375px...');
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await pageMobile.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': BYPASS_SECRET
    });
    await pageMobile.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0', timeout: 30000 });
    await pageMobile.evaluate(async () => {
      const distance = 400;
      const delay = 100;
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, distance);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 1000));
    await pageMobile.screenshot({
      path: path.join(OUT_DIR, 'mobile_375_full.png'),
      fullPage: true
    });
    console.log('Saved: mobile_375_full.png');
    await pageMobile.close();

    console.log('ALL V2.4 SCREENSHOTS & PERFORMANCE TRACES RECORDED SUCCESSFULLY!');
  } catch (err) {
    console.error('Visual QA Error:', err);
  } finally {
    await browser.close();
  }
}

runVisualQA();
