// One-off: remaining visual checks — error notice above dropzone, consulta offline notice.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(ROOT, 'shots');
const { createRequire } = await import('node:module');
let puppeteer = null;
for (const name of ['puppeteer-core', 'puppeteer']) {
  try {
    const req = createRequire(join(process.cwd(), 'noop.js'));
    const resolved = req.resolve(name);
    puppeteer = (await import(`file://${resolved.replace(/\\/g, '/')}`)).default;
    if (puppeteer) break;
  } catch {}
}
if (!puppeteer) throw new Error('puppeteer-core not found');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });

const settle = (page) => page.evaluate(async () => {
  if (document.fonts && document.fonts.status !== 'loaded') {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
});

const results = [];
const assert = (name, ok, detail = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

// error notice above the dropzone at 375
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:5173/#/upload', { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate(() => {
  const bytes = Uint8Array.from(atob('PD94bWwgdmVyc2lvbj0iMS4wIj48bm90LXJlbWVzcGEvPg=='), (c) => c.charCodeAt(0));
  const input = document.querySelector('input[type="file"]');
  const file = new File([bytes], 'invalido.txt', { type: 'text/plain' });
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForSelector('p.notice[role="alert"]', { timeout: 10000 });
assert('error notice renders above dropzone', await page.evaluate(() => {
  const notice = document.querySelector('p.notice[role="alert"]');
  const dz = document.querySelector('.dropzone');
  if (!notice || !dz) return false;
  return Boolean(notice.compareDocumentPosition(dz) & Node.DOCUMENT_POSITION_FOLLOWING);
}));
await settle(page);
await page.screenshot({ path: join(SHOTS, 'fix-upload-error-375.png') });
await page.close();

// consulta offline notice: override navigator.onLine, then remount via hash navigation
const page2 = await browser.newPage();
await page2.setViewport({ width: 1440, height: 900 });
await page2.goto('http://localhost:5173/#/consulta', { waitUntil: 'networkidle0', timeout: 30000 });
await page2.evaluate(() => {
  Object.defineProperty(Navigator.prototype, 'onLine', {
    get() { return false; }, configurable: true,
  });
  location.hash = '#/dashboard';
});
await new Promise((r) => setTimeout(r, 400));
await page2.evaluate(() => { location.hash = '#/consulta'; });
await page2.waitForSelector('.notice--quiet[role="status"]', { timeout: 10000 });
assert('offline notice shows on consulta', await page2.evaluate(() =>
  /Sem conex[ãa]o/.test(document.querySelector('.notice--quiet[role="status"]').textContent)));
await settle(page2);
await page2.screenshot({ path: join(SHOTS, 'fix-consulta-offline-1440.png') });
await page2.close();

await browser.close();
console.log(results.join('\n'));
