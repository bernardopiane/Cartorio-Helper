// One-off: verify round-2 fixes — duplicate remessa dedupe + notice, etiquetas 375 no-clip,
// armed double-click guard.
import { readFileSync } from 'node:fs';
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

const xmlB64 = readFileSync(join(ROOT, '..', 'sample', '1664_20250514_RIT_I_113052.xml')).toString('base64');

// duplicate remessa: load twice, rows must stay 20, Σ unchanged, notice speaks
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/#/upload', { waitUntil: 'networkidle0', timeout: 30000 });
await page.evaluate((b64) => {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const input = document.querySelector('input[type="file"]');
  const dt = new DataTransfer();
  dt.items.add(new File([bytes], 'remessa-1664.xml', { type: 'text/xml' }));
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}, xmlB64);
await page.waitForSelector('table.ledger', { timeout: 15000 });
const rows1 = await page.$$eval('table.ledger tbody tr', (r) => r.length);
await page.evaluate((b64) => {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const input = document.querySelector('input[type="file"]');
  const dt = new DataTransfer();
  dt.items.add(new File([bytes], 'remessa-1664.xml', { type: 'text/xml' }));
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}, xmlB64);
await new Promise((r) => setTimeout(r, 600));
const rows2 = await page.$$eval('table.ledger tbody tr', (r) => r.length);
assert('same remessa twice does not duplicate rows', rows1 === rows2 && rows1 > 0, `${rows1} -> ${rows2}`);
assert('dup load speaks a quiet notice', await page.evaluate(() =>
  /já estavam na tabela/.test(document.querySelector('p.notice--quiet[role="status"]')?.textContent || '')));
assert('Σ emolumentos unchanged', await page.evaluate(() =>
  document.querySelector('.sheet-foot').textContent.includes('Σ emolumentos R$ 3.068,20')));
await settle(page);
await page.screenshot({ path: join(SHOTS, 'fix-dedupe-1440.png') });
await page.close();

// armed double-click guard: two rapid clicks must NOT clear
const page2 = await browser.newPage();
await page2.setViewport({ width: 1440, height: 900 });
await page2.goto('http://localhost:5173/#/upload', { waitUntil: 'networkidle0', timeout: 30000 });
await page2.waitForSelector('table.ledger', { timeout: 15000 });
await page2.evaluate(() => {
  const click = (label) => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().includes(label));
    if (btn) btn.click();
  };
  // two clicks 60ms apart — the double-click window
  click('Limpar');
  setTimeout(() => click('Confirmar'), 60);
});
await new Promise((r) => setTimeout(r, 250));
const rows3 = await page2.$$eval('table.ledger tbody tr', (r) => r.length);
assert('habit double-click does not clear', rows3 > 0, `${rows3} rows survive`);
await page2.close();

// etiquetas at 375: no horizontal clip, handoff reachable
const page3 = await browser.newPage();
await page3.setViewport({ width: 375, height: 812 });
await page3.evaluateOnNewDocument(() => {
  localStorage.setItem('ch-upload:v1', JSON.stringify({
    records: [{ selo: '00001', livro: 'B-123', folha: '045', termo: '00821' }],
    files: ['remessa-1664.xml'],
  }));
});
await page3.goto('http://localhost:5173/#/etiquetas', { waitUntil: 'networkidle0', timeout: 30000 });
await settle(page3);
assert('etiquetas 375 has no clipped overflow', await page3.evaluate(() =>
  document.documentElement.scrollWidth <= 375 + 1));
assert('handoff button fully in viewport at 375', await page3.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Preencher da última remessa'));
  if (!btn) return false;
  const r = btn.getBoundingClientRect();
  return r.right <= 377 && r.width > 0;
}));
await page3.screenshot({ path: join(SHOTS, 'fix-etiquetas-375.png') });
await page3.close();

await browser.close();
console.log(results.join('\n'));
