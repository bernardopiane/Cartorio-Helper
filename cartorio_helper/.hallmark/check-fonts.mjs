// One-off: verify the self-hosted fonts load and no request leaves the machine.
import { existsSync } from 'node:fs';

const { createRequire } = await import('node:module');
let puppeteer = null;
for (const root of [process.cwd()]) {
  for (const name of ['puppeteer-core', 'puppeteer']) {
    try {
      const req = createRequire(`${root}\\noop.js`);
      const resolved = req.resolve(name);
      puppeteer = (await import(`file://${resolved.replace(/\\/g, '/')}`)).default;
      if (puppeteer) break;
    } catch {}
  }
  if (puppeteer) break;
}
if (!puppeteer) throw new Error('puppeteer-core not found');

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);
const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) throw new Error('no Chrome found; set CHROME_PATH');

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const [page] = await browser.pages();
await page.setViewport({ width: 1440, height: 900 });

const external = [];
await page.setRequestInterception(true);
page.on('request', (req) => {
  const url = new URL(req.url());
  if (!['localhost', '127.0.0.1'].includes(url.hostname)) external.push(url.href);
  req.continue();
});

await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
const checks = await page.evaluate(() => ({
  hanken500: document.fonts.check('500 16px "Hanken Grotesk"'),
  hanken600: document.fonts.check('600 16px "Hanken Grotesk"'),
  newsreader400: document.fonts.check('400 16px "Newsreader"'),
  newsreader500: document.fonts.check('500 16px "Newsreader"'),
  newsreaderItalic: document.fonts.check('italic 400 16px "Newsreader"'),
  mono400: document.fonts.check('400 16px "IBM Plex Mono"'),
  mono500: document.fonts.check('500 16px "IBM Plex Mono"'),
  loadedCount: document.fonts.size,
}));
const ptRendering = await page.evaluate(() => {
  const probe = document.createElement('span');
  probe.textContent = 'ÁÀÂÃÇÉÊÍÓÔÕÚãçéíóú';
  probe.style.cssText = 'font: 16px "Newsreader", serif; position: absolute; visibility: hidden;';
  document.body.appendChild(probe);
  const breaks = [...probe.textContent].filter((ch) => {
    probe.textContent = ch;
    return document.fonts.check('400 16px "Newsreader"', ch);
  }).length;
  probe.remove();
  return breaks;
});
await browser.close();

console.log(JSON.stringify({ checks, ptGlyphsMissing: ptRendering, externalRequests: external }, null, 2));
