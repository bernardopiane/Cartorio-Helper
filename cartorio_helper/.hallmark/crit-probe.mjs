// Check computed fonts + focus/keyboard behaviors.
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

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/#/etiquetas', { waitUntil: 'networkidle0' });
const fonts = await page.evaluate(() => {
  const out = {};
  const ta = document.querySelector('textarea.field--out');
  if (ta) out.etqOutput = getComputedStyle(ta).fontFamily;
  const inp = document.querySelector('#etq-cpf1');
  if (inp) out.cpfField = getComputedStyle(inp).fontFamily;
  const lbl = document.querySelector('.field-label');
  if (lbl) out.fieldLabel = getComputedStyle(lbl).fontFamily;
  const h = document.querySelector('h1');
  if (h) out.h1 = getComputedStyle(h).fontFamily;
  const td = document.querySelector('td')?.textContent;
  out.tdSample = td || null;
  return out;
});

// tab order on dashboard: count stops to reach first tool row, focus outline
const page2 = await browser.newPage();
await page2.setViewport({ width: 1440, height: 900 });
await page2.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle0' });
await page2.keyboard.press('Tab'); // first nav item
const stops = [];
for (let i = 0; i < 9; i++) {
  const act = await page2.evaluate(() => {
    const el = document.activeElement;
    return el ? `${el.tagName}.${el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : ''} ${el.textContent ? el.textContent.trim().slice(0, 18) : el.getAttribute('aria-label') || ''}` : 'none';
  });
  stops.push(act);
  await page2.keyboard.press('Tab');
}
// focused row outline
await page2.evaluate(() => { const rows = document.querySelectorAll('tbody tr'); rows[0]?.focus(); });
const rowStyle = await page2.evaluate(() => {
  const r = document.querySelector('tbody tr');
  return getComputedStyle(r).outlineWidth + ' ' + getComputedStyle(r).outlineColor + ' offset=' + getComputedStyle(r).outlineOffset;
});

// upload: keyboard access to dropzone + file input
const page3 = await browser.newPage();
await page3.setViewport({ width: 1440, height: 900 });
await page3.goto('http://localhost:5173/#/upload', { waitUntil: 'networkidle0' });
const dz = await page3.evaluate(() => {
  const d = document.querySelector('[role="button"]');
  if (!d) return 'none';
  return { tabindex: d.tabIndex, role: d.getAttribute('role'), cursor: getComputedStyle(d).cursor };
});

console.error(JSON.stringify({ fonts, stops, rowStyle, dz }, null, 1));
await browser.close();
