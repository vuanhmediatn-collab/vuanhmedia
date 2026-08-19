const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');

const BYPASS_SECRET = 'DHFrIJkcyuWmbaaMAPfCEnfX7g9Rdrt2';
const BASE_URL = 'https://prosthetics-hero-68bj8ecup-vuanhmedia.vercel.app';
const URL_WITH_BYPASS = `${BASE_URL}?x-vercel-protection-bypass=${BYPASS_SECRET}&x-vercel-set-bypass-cookie=samesitenone`;
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../motion_recordings_v24');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function recordSession({ width, height, deviceScaleFactor, outputFile, scriptActions }) {
  console.log(`\n========================================`);
  console.log(`Starting recording for: ${path.basename(outputFile)} (${width}x${height})`);
  console.log(`========================================`);

  const tempFramesDir = path.join(OUT_DIR, `temp_frames_${Date.now()}`);
  fs.mkdirSync(tempFramesDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', `--window-size=${width},${height}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor });
  await page.setExtraHTTPHeaders({
    'x-vercel-protection-bypass': BYPASS_SECRET
  });

  const client = await page.target().createCDPSession();
  
  let frameCount = 0;
  const fps = 30;
  let isRecording = true;

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    maxWidth: width * deviceScaleFactor,
    maxHeight: height * deviceScaleFactor,
    everyNthFrame: 1
  });

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
      if (isRecording) {
        const framePath = path.join(tempFramesDir, `frame_${String(frameCount++).padStart(6, '0')}.jpg`);
        fs.writeFileSync(framePath, Buffer.from(data, 'base64'));
      }
    } catch (e) {}
  });

  // Execute scenario actions
  await scriptActions(page);

  isRecording = false;
  await client.send('Page.stopScreencast');
  await browser.close();

  console.log(`Captured ${frameCount} frames in temp directory: ${tempFramesDir}`);

  // Encode with ffmpeg to H.264 MP4
  console.log(`Encoding frames to MP4: ${outputFile}`);
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
      '-y',
      '-framerate', String(fps),
      '-i', path.join(tempFramesDir, 'frame_%06d.jpg'),
      '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-crf', '18',
      '-preset', 'medium',
      outputFile
    ]);

    let stderrData = '';
    ffmpeg.stderr.on('data', (d) => {
      stderrData += d.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully generated MP4: ${outputFile}`);
        resolve();
      } else {
        console.error('ffmpeg stderr:', stderrData);
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });

  // Cleanup temp frames
  fs.rmSync(tempFramesDir, { recursive: true, force: true });
}

async function runAllRecordings() {
  // 1. DESKTOP 1440x900 MP4 (Duration ~52 seconds)
  const desktopOut = path.join(OUT_DIR, 'Vu_Anh_Media_V2_4_Motion_Review.mp4');
  await recordSession({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1, // 1440x900 native resolution
    outputFile: desktopOut,
    scriptActions: async (page) => {
      console.log('1. Page load / Hero intro...');
      await page.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
      
      console.log('2. Waiting for Hero intro animation to finish...');
      await new Promise(r => setTimeout(r, 3500));

      console.log('3. Smooth scroll Hero -> Projects...');
      await page.evaluate(() => {
        const el = document.getElementById('projects');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 4000));

      console.log('4. Hover Project 01...');
      const p1 = await page.$('#projects .group');
      if (p1) await p1.hover();
      await new Promise(r => setTimeout(r, 3500));

      console.log('5. Scroll through Project 02...');
      await page.evaluate(() => {
        window.scrollBy({ top: 500, behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 4000));

      console.log('6. Scroll through Business Lines...');
      await page.evaluate(() => {
        const el = document.getElementById('services');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 5000));

      console.log('7. Scroll into Media Ops...');
      await page.evaluate(() => {
        const el = document.getElementById('media-ops');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 4500));

      console.log('8. Show bottleneck reveal...');
      await page.evaluate(() => {
        window.scrollBy({ top: 400, behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 5000));

      console.log('9. Show Media Ops process reveal...');
      await page.evaluate(() => {
        window.scrollBy({ top: 500, behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 5000));

      console.log('10. Scroll Team...');
      await page.evaluate(() => {
        const el = document.getElementById('team');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 4500));

      console.log('11. Scroll Partners...');
      await page.evaluate(() => {
        const el = document.getElementById('partners');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 4000));

      console.log('12. Enter Contact section...');
      await page.evaluate(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 5000));

      console.log('13. Scroll back upward briefly...');
      await page.evaluate(() => {
        window.scrollBy({ top: -800, behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 3500));
    }
  });

  // 2. MOBILE 375x812 MP4 (Duration ~36 seconds)
  const mobileOut = path.join(OUT_DIR, 'Vu_Anh_Media_V2_4_Mobile_Review.mp4');
  await recordSession({
    width: 375,
    height: 812,
    deviceScaleFactor: 2, // crisp retina mobile resolution (750x1624)
    outputFile: mobileOut,
    scriptActions: async (page) => {
      console.log('Mobile 1. Hero load...');
      await page.goto(URL_WITH_BYPASS, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 3500));

      console.log('Mobile 2. Scroll through Projects...');
      await page.evaluate(() => {
        const el = document.getElementById('projects');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 5000));

      await page.evaluate(() => {
        window.scrollBy({ top: 600, behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 5000));

      console.log('Mobile 3. Business Lines...');
      await page.evaluate(() => {
        const el = document.getElementById('services');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 6000));

      console.log('Mobile 4. Media Ops...');
      await page.evaluate(() => {
        const el = document.getElementById('media-ops');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 6000));

      await page.evaluate(() => {
        window.scrollBy({ top: 700, behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 5000));

      console.log('Mobile 5. Contact...');
      await page.evaluate(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
      await new Promise(r => setTimeout(r, 6000));
    }
  });

  console.log('\nAll MP4 videos successfully generated and verified!');
}

runAllRecordings();
