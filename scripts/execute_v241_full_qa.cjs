const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const BYPASS_SECRET = 'DHFrIJkcyuWmbaaMAPfCEnfX7g9Rdrt2';
const BASE_URL = 'https://prosthetics-hero-ghjs4b3b7-vuanhmedia.vercel.app';
const URL_WITH_BYPASS = `${BASE_URL}?x-vercel-protection-bypass=${BYPASS_SECRET}&x-vercel-set-bypass-cookie=samesitenone`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../screenshots_v241');
const MOTION_DIR = path.resolve(__dirname, '../motion_recordings_v24');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(MOTION_DIR)) fs.mkdirSync(MOTION_DIR, { recursive: true });

async function runQA() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    // -----------------------------------------------------------------
    // 1. HERO TYPOGRAPHY COMPARISON STUDY
    // -----------------------------------------------------------------
    console.log('\n--- EXECUTING HERO TYPOGRAPHY STUDY ---');
    const pageStudy = await browser.newPage();
    await pageStudy.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageStudy.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    await pageStudy.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Option A: Inter Tight
    await pageStudy.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) h1.style.fontFamily = '"Inter Tight", sans-serif';
    });
    await pageStudy.screenshot({ path: path.join(OUT_DIR, 'typo_study_option_A_inter_tight.png') });
    console.log('Saved: typo_study_option_A_inter_tight.png');

    // Option B: Archivo (Authoritative, sharp, cinematic grotesk)
    await pageStudy.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) h1.style.fontFamily = '"Archivo", sans-serif';
    });
    await pageStudy.screenshot({ path: path.join(OUT_DIR, 'typo_study_option_B_archivo.png') });
    console.log('Saved: typo_study_option_B_archivo.png');

    // Option C: Plus Jakarta Sans
    await pageStudy.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (h1) h1.style.fontFamily = '"Plus Jakarta Sans", sans-serif';
    });
    await pageStudy.screenshot({ path: path.join(OUT_DIR, 'typo_study_option_C_plus_jakarta.png') });
    console.log('Saved: typo_study_option_C_plus_jakarta.png');
    await pageStudy.close();

    // -----------------------------------------------------------------
    // 2. FULL PAGE SCREENSHOTS (1440, 768, 375)
    // -----------------------------------------------------------------
    console.log('\n--- CAPTURING FULL PAGE SCREENSHOTS ---');
    // Desktop 1440px
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDesktop.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    await pageDesktop.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    
    // Scroll through to reveal all sections
    await pageDesktop.evaluate(async () => {
      const distance = 400;
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, distance);
        await new Promise(r => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 1000));
    await pageDesktop.screenshot({ path: path.join(OUT_DIR, 'desktop_1440_full.png'), fullPage: true });
    console.log('Saved: desktop_1440_full.png');

    // Focus section captures
    const secList = [
      { id: 'top', name: '01_hero.png' },
      { id: 'projects', name: '02_projects.png' },
      { id: 'services', name: '03_business_lines.png' },
      { id: 'media-ops', name: '04_media_ops_sticky.png' },
      { id: 'team', name: '07_team.png' },
      { id: 'partners', name: '08_partners.png' },
      { id: 'contact', name: '09_contact.png' }
    ];

    for (const sec of secList) {
      const el = await pageDesktop.$(`#${sec.id}`);
      if (el) {
        await el.screenshot({ path: path.join(OUT_DIR, sec.name) });
        console.log(`Saved section: ${sec.name}`);
      }
    }
    await pageDesktop.close();

    // Tablet 768px
    const pageTablet = await browser.newPage();
    await pageTablet.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
    await pageTablet.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    await pageTablet.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await pageTablet.evaluate(async () => {
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, 400);
        await new Promise(r => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 800));
    await pageTablet.screenshot({ path: path.join(OUT_DIR, 'tablet_768_full.png'), fullPage: true });
    console.log('Saved: tablet_768_full.png');
    await pageTablet.close();

    // Mobile 375px
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await pageMobile.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    await pageMobile.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await pageMobile.evaluate(async () => {
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, 400);
        await new Promise(r => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 800));
    await pageMobile.screenshot({ path: path.join(OUT_DIR, 'mobile_375_full.png'), fullPage: true });
    console.log('Saved: mobile_375_full.png');
    await pageMobile.close();

    // -----------------------------------------------------------------
    // 3. MP4 MOTION REVIEWS (DESKTOP & MOBILE)
    // -----------------------------------------------------------------
    console.log('\n--- RECORDING MP4 REVIEWS ---');
    
    // Desktop MP4
    const desktopMp4 = path.join(MOTION_DIR, 'Vu_Anh_Media_V2_4_Motion_Review.mp4');
    const tempDesktopFrames = path.join(MOTION_DIR, `temp_desk_${Date.now()}`);
    fs.mkdirSync(tempDesktopFrames, { recursive: true });

    const pDesk = await browser.newPage();
    await pDesk.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await pDesk.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    const cdpDesk = await pDesk.target().createCDPSession();

    let dCount = 0;
    let isDRecording = true;

    await cdpDesk.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 88,
      maxWidth: 1440,
      maxHeight: 900,
      everyNthFrame: 1
    });

    cdpDesk.on('Page.screencastFrame', async ({ data, sessionId }) => {
      try {
        await cdpDesk.send('Page.screencastFrameAck', { sessionId });
        if (isDRecording) {
          fs.writeFileSync(path.join(tempDesktopFrames, `frame_${String(dCount++).padStart(6, '0')}.jpg`), Buffer.from(data, 'base64'));
        }
      } catch (e) {}
    });

    console.log('Recording Desktop: Hero load...');
    await pDesk.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3500));

    console.log('Recording Desktop: Projects...');
    await pDesk.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));

    console.log('Recording Desktop: Project 01 hover...');
    const pr1 = await pDesk.$('#projects .group');
    if (pr1) await pr1.hover();
    await new Promise(r => setTimeout(r, 3500));

    console.log('Recording Desktop: Project 02 tall portrait...');
    await pDesk.evaluate(() => window.scrollBy({ top: 550, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));

    console.log('Recording Desktop: Business Lines...');
    await pDesk.evaluate(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));

    console.log('Recording Desktop: Media Ops sticky sequence...');
    await pDesk.evaluate(() => document.getElementById('media-ops')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));
    await pDesk.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));

    console.log('Recording Desktop: Team...');
    await pDesk.evaluate(() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));

    console.log('Recording Desktop: Partners...');
    await pDesk.evaluate(() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 3500));

    console.log('Recording Desktop: Contact...');
    await pDesk.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));

    console.log('Recording Desktop: Scroll upward briefly...');
    await pDesk.evaluate(() => window.scrollBy({ top: -700, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 3000));

    isDRecording = false;
    await cdpDesk.send('Page.stopScreencast');
    await pDesk.close();

    console.log(`Captured ${dCount} desktop frames. Encoding MP4...`);
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
        '-y',
        '-framerate', '30',
        '-i', path.join(tempDesktopFrames, 'frame_%06d.jpg'),
        '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '18',
        '-preset', 'medium',
        desktopMp4
      ]);
      ffmpeg.on('close', (c) => c === 0 ? resolve() : reject(new Error(`ffmpeg desk code ${c}`)));
    });
    fs.rmSync(tempDesktopFrames, { recursive: true, force: true });
    console.log(`Generated Desktop MP4: ${desktopMp4}`);

    // Mobile MP4
    const mobileMp4 = path.join(MOTION_DIR, 'Vu_Anh_Media_V2_4_Mobile_Review.mp4');
    const tempMobileFrames = path.join(MOTION_DIR, `temp_mob_${Date.now()}`);
    fs.mkdirSync(tempMobileFrames, { recursive: true });

    const pMob = await browser.newPage();
    await pMob.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await pMob.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    const cdpMob = await pMob.target().createCDPSession();

    let mCount = 0;
    let isMRecording = true;

    await cdpMob.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 85,
      maxWidth: 750,
      maxHeight: 1624,
      everyNthFrame: 1
    });

    cdpMob.on('Page.screencastFrame', async ({ data, sessionId }) => {
      try {
        await cdpMob.send('Page.screencastFrameAck', { sessionId });
        if (isMRecording) {
          fs.writeFileSync(path.join(tempMobileFrames, `frame_${String(mCount++).padStart(6, '0')}.jpg`), Buffer.from(data, 'base64'));
        }
      } catch (e) {}
    });

    console.log('Recording Mobile: Hero load...');
    await pMob.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3500));

    console.log('Recording Mobile: Projects...');
    await pMob.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));
    await pMob.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));

    console.log('Recording Mobile: Business Lines...');
    await pMob.evaluate(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));

    console.log('Recording Mobile: Media Ops...');
    await pMob.evaluate(() => document.getElementById('media-ops')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 5000));

    console.log('Recording Mobile: Contact...');
    await pMob.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 5000));

    isMRecording = false;
    await cdpMob.send('Page.stopScreencast');
    await pMob.close();

    console.log(`Captured ${mCount} mobile frames. Encoding MP4...`);
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
        '-y',
        '-framerate', '30',
        '-i', path.join(tempMobileFrames, 'frame_%06d.jpg'),
        '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '18',
        '-preset', 'medium',
        mobileMp4
      ]);
      ffmpeg.on('close', (c) => c === 0 ? resolve() : reject(new Error(`ffmpeg mob code ${c}`)));
    });
    fs.rmSync(tempMobileFrames, { recursive: true, force: true });
    console.log(`Generated Mobile MP4: ${mobileMp4}`);

    console.log('\nALL V2.4.1 QA ARTIFACTS AND MP4 REVIEWS GENERATED SUCCESSFULLY!');
  } catch (err) {
    console.error('QA Execution Error:', err);
  } finally {
    await browser.close();
  }
}

runQA();
