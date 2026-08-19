const https = require('https');
const http = require('http');

const endpoints = [
  { url: 'https://www.vuanhmedia.com/', expectedCode: 200, name: 'WWW Production Homepage' },
  { url: 'https://vuanhmedia.com/', expectedCode: 308, name: 'Apex Redirect' },
  { url: 'https://www.vuanhmedia.com/admin', expectedCode: 200, name: 'WWW Admin Dashboard' },
  { url: 'https://admin.vuanhmedia.com/', expectedCode: 308, name: 'Admin Subdomain Redirect' }
];

function checkEndpoint({ url, expectedCode, name }) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (VercelProductionAudit/1.0)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isPass = res.statusCode === expectedCode || (expectedCode === 308 && [301, 302, 307, 308].includes(res.statusCode));
        console.log(`[${isPass ? 'PASS' : 'FAIL'}] ${name} (${url}): Status ${res.statusCode} ${res.headers.location ? `-> Location: ${res.headers.location}` : ''}`);
        resolve({ url, status: res.statusCode, location: res.headers.location, dataLength: data.length, pass: isPass });
      });
    });
    req.on('error', (err) => {
      console.log(`[ERROR] ${name} (${url}): ${err.message}`);
      resolve({ url, error: err.message, pass: false });
    });
    req.end();
  });
}

async function verifyAll() {
  console.log('==================================================');
  console.log('VERIFYING PRODUCTION DOMAINS & REDIRECTS');
  console.log('==================================================');
  for (const ep of endpoints) {
    await checkEndpoint(ep);
  }
}

verifyAll();
