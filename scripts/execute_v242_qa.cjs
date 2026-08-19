const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const puppeteer = require('puppeteer-core');

const BYPASS_SECRET = 'DHFrIJkcyuWmbaaMAPfCEnfX7g9Rdrt2';
const BASE_URL = 'https://prosthetics-hero-1evyhry96-vuanhmedia.vercel.app';
const URL_WITH_BYPASS = `${BASE_URL}?x-vercel-protection-bypass=${BYPASS_SECRET}&x-vercel-set-bypass-cookie=samesitenone`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../screenshots_v242');
const MOTION_DIR = path.resolve(__dirname, '../motion_recordings_v24');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(MOTION_DIR)) fs.mkdirSync(MOTION_DIR, { recursive: true });

async function runQA() {
  console.log('Launching Chrome for V2.4.2 QA...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    // -----------------------------------------------------------------
    // 1. CAPTURE HERO & MEDIA OPS SCREENSHOTS
    // -----------------------------------------------------------------
    console.log('\n--- CAPTURING SECTION SCREENSHOTS ---');
    const pSnap = await browser.newPage();
    await pSnap.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pSnap.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    await pSnap.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Scroll slightly to trigger intersection observer
    await pSnap.evaluate(async () => {
      window.scrollBy(0, 300);
      await new Promise(r => setTimeout(r, 300));
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 600));

    // 01 Hero Screenshot
    const heroEl = await pSnap.$('#top');
    if (heroEl) {
      await heroEl.screenshot({ path: path.join(OUT_DIR, '01_hero.png') });
      console.log('Saved: 01_hero.png');
    }

    // 04 Media Ops Screenshot
    await pSnap.evaluate(() => document.getElementById('media-ops')?.scrollIntoView());
    await new Promise(r => setTimeout(r, 1000));
    const mediaOpsEl = await pSnap.$('#media-ops');
    if (mediaOpsEl) {
      await mediaOpsEl.screenshot({ path: path.join(OUT_DIR, '04_media_ops.png') });
      console.log('Saved: 04_media_ops.png');
    }

    // Full desktop screenshot
    await pSnap.evaluate(async () => {
      while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
        document.scrollingElement.scrollBy(0, 400);
        await new Promise(r => setTimeout(r, 100));
      }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 800));
    await pSnap.screenshot({ path: path.join(OUT_DIR, 'desktop_1440_full.png'), fullPage: true });
    console.log('Saved: desktop_1440_full.png');
    await pSnap.close();

    // -----------------------------------------------------------------
    // 2. DESKTOP MOTION REVIEW RECORDING (1440x900)
    // -----------------------------------------------------------------
    console.log('\n--- RECORDING DESKTOP MP4 (1440x900) ---');
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

    console.log('Recording Desktop: Hero...');
    await pDesk.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3500));

    console.log('Recording Desktop: Projects...');
    await pDesk.evaluate(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));

    console.log('Recording Desktop: Media Ops sticky sequence...');
    await pDesk.evaluate(() => document.getElementById('media-ops')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));
    await pDesk.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));

    console.log('Recording Desktop: Team...');
    await pDesk.evaluate(() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4000));

    console.log('Recording Desktop: Contact...');
    await pDesk.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));

    isDRecording = false;
    await cdpDesk.send('Page.stopScreencast');
    await pDesk.close();

    console.log(`Captured ${dCount} desktop frames. Encoding to H.264 MP4 (1440x900)...`);
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
        '-y',
        '-framerate', '30',
        '-i', path.join(tempDesktopFrames, 'frame_%06d.jpg'),
        '-vf', 'scale=1440:900,format=yuv420p',
        '-c:v', 'libx264',
        '-crf', '18',
        '-preset', 'medium',
        desktopMp4
      ]);
      ffmpeg.on('close', (c) => c === 0 ? resolve() : reject(new Error(`ffmpeg desk error code ${c}`)));
    });
    fs.rmSync(tempDesktopFrames, { recursive: true, force: true });
    console.log(`Desktop MP4 generated: ${desktopMp4}`);

    // -----------------------------------------------------------------
    // 3. MOBILE MOTION REVIEW RECORDING (375x812 PORTRAIT -> 750x1624 or 376x812)
    // -----------------------------------------------------------------
    console.log('\n--- RECORDING MOBILE MP4 (375x812 PORTRAIT) ---');
    const mobileMp4 = path.join(MOTION_DIR, 'Vu_Anh_Media_V2_4_Mobile_Review.mp4');
    const tempMobileFrames = path.join(MOTION_DIR, `temp_mob_${Date.now()}`);
    fs.mkdirSync(tempMobileFrames, { recursive: true });

    const pMob = await browser.newPage();
    // Device Scale Factor 2 for crisp retina text
    await pMob.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
    await pMob.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': BYPASS_SECRET });
    const cdpMob = await pMob.target().createCDPSession();

    let mCount = 0;
    let isMRecording = true;

    // Screencast with exact 750x1624 portrait dimensions
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

    console.log('Recording Mobile: Team...');
    await pMob.evaluate(() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 4500));

    console.log('Recording Mobile: Contact...');
    await pMob.evaluate(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }));
    await new Promise(r => setTimeout(r, 5000));

    isMRecording = false;
    await cdpMob.send('Page.stopScreencast');
    await pMob.close();

    console.log(`Captured ${mCount} mobile frames. Encoding to H.264 Portrait MP4 (750x1624)...`);
    await new Promise((resolve, reject) => {
      const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
        '-y',
        '-framerate', '30',
        '-i', path.join(tempMobileFrames, 'frame_%06d.jpg'),
        '-vf', 'scale=750:1624,format=yuv420p',
        '-c:v', 'libx264',
        '-crf', '18',
        '-preset', 'medium',
        mobileMp4
      ]);
      ffmpeg.on('close', (c) => c === 0 ? resolve() : reject(new Error(`ffmpeg mob error code ${c}`)));
    });
    fs.rmSync(tempMobileFrames, { recursive: true, force: true });
    console.log(`Mobile MP4 generated: ${mobileMp4}`);

    // -----------------------------------------------------------------
    // 4. RUN FFPROBE TO VERIFY EXACT DIMENSIONS
    // -----------------------------------------------------------------
    console.log('\n--- RUNNING FFPROBE ON OUTPUT MP4s ---');
    const ffprobeDesk = execSync(`/opt/homebrew/bin/ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of json "${desktopMp4}"`).toString();
    const ffprobeMob = execSync(`/opt/homebrew/bin/ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,duration -of json "${mobileMp4}"`).toString();

    console.log('Desktop FFPROBE:\n', ffprobeDesk);
    console.log('Mobile FFPROBE:\n', ffprobeMob);

    console.log('\nV2.4.2 QA AND VIDEO EXPORTS COMPLETE!');
  } catch (err) {
    console.error('QA Execution Error:', err);
  } finally {
    await browser.close();
  }
}

runQA();
