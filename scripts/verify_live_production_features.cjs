const puppeteer = require('puppeteer-core');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function verifyProductionFeatures() {
  console.log('Auditing live production website: https://www.vuanhmedia.com/');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Desktop check (1440px)
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('https://www.vuanhmedia.com/', { waitUntil: 'networkidle0' });

    const checks = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h1Text = h1 ? h1.innerText : '';
      const hasWorkflowPlaceholder = document.body.innerText.includes('OPERATIONAL BLUEPRINT // WORKFLOW & QC MATRIX');
      const hasPublicCmsLink = Array.from(document.querySelectorAll('a, button')).some(el => (el.textContent || '').includes('CMS') || (el.textContent || '').includes('Admin') || (el.getAttribute('href') || '').includes('/admin'));
      const partnerText = document.querySelector('#partners')?.innerText || '';
      const lenisDefined = !!window.__lenis || document.documentElement.classList.contains('lenis') || !!document.querySelector('.lenis');
      const founderText = document.querySelector('#team')?.innerText || '';

      return {
        h1Text,
        hasWorkflowPlaceholder,
        hasPublicCmsLink,
        partnerText,
        founderText
      };
    });

    console.log('Desktop Checks:');
    console.log('- H1 Content:\n', checks.h1Text);
    console.log('- Has Fake Workflow Placeholder:', checks.hasWorkflowPlaceholder ? 'FAIL' : 'PASS (Removed)');
    console.log('- Has Public CMS/Admin Links:', checks.hasPublicCmsLink ? 'FAIL' : 'PASS (Zero public links)');
    console.log('- Founder text contains factual role:', checks.founderText.includes('Creative & Operations Director') ? 'PASS' : 'FAIL');

    // 2. Mobile check (375px)
    const pageMob = await browser.newPage();
    await pageMob.setViewport({ width: 375, height: 812 });
    await pageMob.goto('https://www.vuanhmedia.com/', { waitUntil: 'networkidle0' });

    const mobChecks = await pageMob.evaluate(() => {
      const menuBtn = document.querySelector('header .sm\\:hidden button');
      const desktopNavVisible = window.getComputedStyle(document.querySelector('header nav')).display !== 'none';
      return {
        hasMobileMenuButton: !!menuBtn,
        desktopNavHiddenOnMobile: !desktopNavVisible
      };
    });

    console.log('Mobile Checks:');
    console.log('- Has Mobile Menu Button:', mobChecks.hasMobileMenuButton ? 'PASS' : 'FAIL');
    console.log('- Desktop Nav Hidden on <=640px:', mobChecks.desktopNavHiddenOnMobile ? 'PASS' : 'FAIL');

    // Click menu
    await pageMob.click('header .sm\\:hidden button');
    await new Promise(r => setTimeout(r, 400));
    const isMenuOpen = await pageMob.evaluate(() => {
      const panel = document.querySelector('header .fixed');
      return !!panel && panel.innerText.includes('DỰ ÁN') && panel.innerText.includes('MEDIA OPS');
    });
    console.log('- Mobile Menu Panel Opens Cleanly:', isMenuOpen ? 'PASS' : 'FAIL');

    await page.close();
    await pageMob.close();
  } catch (err) {
    console.error('Audit Error:', err);
  } finally {
    await browser.close();
  }
}

verifyProductionFeatures();
