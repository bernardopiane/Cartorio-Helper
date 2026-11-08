// One-off round 2: force-load every declared face (and pt-BR text), then check.
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

const chrome = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter((p) => p && existsSync(p))[0];

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const [page] = await browser.pages();
await page.setViewport({ width: 1440, height: 900 });

const external = [];
page.on('request', (req) => {
  const url = new URL(req.url());
  if (!['localhost', '127.0.0.1'].includes(url.hostname)) external.push(url.href);
});

await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle0' });

const results = await page.evaluate(async () => {
  await document.fonts.ready;
  const loadIf = async (spec, text) => {
    try {
      const faces = await document.fonts.load(spec, text);
      return faces.length;
    } catch { return -1; }
  };
  const pt = 'ÁÀÂÃÇÉÊÍÓÔÕÚãçéíóú';
  const out = { loads: {}, postLoad: {} };
  out.hanken500 = await loadIf('500 16px "Hanken Grotesk"', 'A');
  out.hanken600 = await loadIf('600 16px "Hanken Grotesk"', 'A');
  out.reader400 = await loadIf('400 16px "Newsreader"', 'A');
  out.reader500 = await loadIf('500 16px "Newsreader"', 'A');
  out.readerItalic = await loadIf('italic 400 16px "Newsreader"', 'A');
  out.mono400 = await loadIf('400 16px "IBM Plex Mono"', 'A');
  out.mono500 = await loadIf('500 16px "IBM Plex Mono"', 'A');
  out.loads = { readerItalic: await loadIf('italic 400 16px "Newsreader"', pt) };
  out.ptAfterLoad = [...pt].map((ch) => document.fonts.check('400 16px "Newsreader"', ch) ? 1 : 0);
  const tally = (arr) => arr.reduce((a, b) => a + b, 0);
  out.ptCovered = `${tally(out.ptAfterLoad)}/${out.ptAfterLoad.length}`;
  out.postLoad = {
    italic: document.fonts.check('italic 400 16px "Newsreader"'),
    mono500: document.fonts.check('500 16px "IBM Plex Mono"'),
  };
  return out;
});

await page.screenshot({ path: '.hallmark/shots/offline-fonts-dashboard.png' });
await browser.close();
console.log(JSON.stringify({ ...results, externalRequests: external }, null, 2));
