const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BYPASS_SECRET = 'DHFrIJkcyuWmbaaMAPfCEnfX7g9Rdrt2';
const BASE_URL = 'https://prosthetics-hero-68bj8ecup-vuanhmedia.vercel.app';
const URL_WITH_BYPASS = `${BASE_URL}?x-vercel-protection-bypass=${BYPASS_SECRET}&x-vercel-set-bypass-cookie=samesitenone`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RECORDING_DIR = path.resolve(__dirname, '../motion_recordings_v24');

if (!fs.existsSync(RECORDING_DIR)) {
  fs.mkdirSync(RECORDING_DIR, { recursive: true });
}

async function recordMotionSequence() {
  console.log('Starting Motion QA Screen Recording...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.setExtraHTTPHeaders({
      'x-vercel-protection-bypass': BYPASS_SECRET
    });

    const client = await page.target().createCDPSession();
    
    // Start screencast frames capture
    const frames = [];
    let frameIndex = 0;

    await client.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 85,
      maxWidth: 1440,
      maxHeight: 900,
      everyNthFrame: 2
    });

    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      try {
        await client.send('Page.screencastFrameAck', { sessionId });
        const buf = Buffer.from(data, 'base64');
        const frameName = `frame_${String(frameIndex++).padStart(5, '0')}.jpg`;
        fs.writeFileSync(path.join(RECORDING_DIR, frameName), buf);
      } catch (e) {}
    });

    // 1. Hero load & intro sequence (1.5s)
    console.log('Stage 1: Recording Hero load & intro...');
    await page.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    // 2. Scroll Hero -> Projects (2.5s)
    console.log('Stage 2: Smooth scroll Hero -> Projects...');
    await page.evaluate(() => {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 2000));

    // 3. Projects Hover interaction (1.5s)
    console.log('Stage 3: Projects Hover interaction...');
    const projectCard = await page.$('#projects .group');
    if (projectCard) {
      await projectCard.hover();
    }
    await new Promise(r => setTimeout(r, 1500));

    // 4. Scroll to Business Lines (2s)
    console.log('Stage 4: Scroll to Business Lines...');
    await page.evaluate(() => {
      const el = document.getElementById('services');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 2000));

    // 5. Scroll to Media Ops & Diagnostic reveal (2.5s)
    console.log('Stage 5: Scroll to Media Ops & Diagnostics...');
    await page.evaluate(() => {
      const el = document.getElementById('media-ops');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 2500));

    // 6. Scroll to Contact entry (2.5s)
    console.log('Stage 6: Scroll to Contact entry...');
    await page.evaluate(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 2500));

    await client.send('Page.stopScreencast');
    console.log(`Recorded ${frameIndex} screencast frames in: ${RECORDING_DIR}`);

    // Create a summary log of the motion sequence
    const sequenceLog = {
      totalFrames: frameIndex,
      durationMs: 12000,
      stages: [
        { stage: '01_hero_load', description: 'Hero typography & project frame scale reveal' },
        { stage: '02_scroll_projects', description: 'Smooth scroll transition to Projects section' },
        { stage: '03_projects_hover', description: 'Hover scaling & play trigger interaction' },
        { stage: '04_business_lines', description: 'Asymmetric editorial service columns reveal' },
        { stage: '05_media_ops_diagnostics', description: 'Progressive diagnostic checklist and process sequence' },
        { stage: '06_contact_entry', description: 'Deep brand navy visual ending & intake form entry' }
      ]
    };

    fs.writeFileSync(
      path.join(RECORDING_DIR, 'motion_sequence_log.json'), 
      JSON.stringify(sequenceLog, null, 2)
    );

  } catch (err) {
    console.error('Motion recording error:', err);
  } finally {
    await browser.close();
  }
}

recordMotionSequence();
