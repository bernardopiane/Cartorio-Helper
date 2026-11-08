// Measure horizontal overflow + tap target sizes at 375x812 and focus visibility.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const { createRequire } = await import('node:module');
let puppeteer = null;
for (const root of [process.cwd()]) {
  for (const name of ['puppeteer-core', 'puppeteer']) {
    try {
      const req = createRequire(join(root, 'noop.js'));
      puppeteer = (await import(`file://${req.resolve(name).replace(/\\/g, '/')}`)).default;
      if (puppeteer) break;
    } catch {}
  }
  if (puppeteer) break;
}
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });

const routes = ['/dashboard', '/upload', '/formatter', '/etiquetas', '/consulta', '/certidao'];
const report = [];
for (const route of routes) {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:5173/#${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 400));
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    const widest = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > 377 && r.width > 20) {
        widest.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 3).join('.') : ''} right=${Math.round(r.right)} w=${Math.round(r.width)}`);
      }
    }
    // small interactive elements (tap targets)
    const small = [];
    for (const el of document.querySelectorAll('button, a, input, [role="button"]')) {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.height < 30) small.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} h=${Math.round(r.height)} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`);
    }
    return {
      scrollW: de.scrollWidth,
      bodyScrollW: document.body.scrollWidth,
      overflowCount: widest.length,
      overflowSample: widest.slice(0, 8),
      smallTargets: small.slice(0, 10),
    };
  });
  report.push({ route, ...m });
  console.error(route, JSON.stringify(m, null, 1));
  await page.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
