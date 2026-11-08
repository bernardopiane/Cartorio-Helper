// Etiquetas filled states only (localStorage seeded).
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(ROOT, 'crit-shots');
mkdirSync(SHOTS, { recursive: true });

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

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--force-device-scale-factor=1'] });
const settle = (page) => page.evaluate(async () => {
  if (document.fonts && document.fonts.status !== 'loaded') {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
});

const seed = JSON.stringify({
  processo: '0123456-78.2024.800.0001', selo: '4AB2C3D9E8', livro: 'B2', folha: '8', termos: '113052',
  cpf1: '123.456.789-09', nome1: 'MARIA SOUZA LIMA', cpf2: '', nome2: '',
});

async function shot(viewport, name) {
  const page = await browser.newPage();
  await page.setViewport({ width: viewport[0], height: viewport[1], deviceScaleFactor: 1 });
  await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate((v) => localStorage.setItem('ch-etiquetas:v1', v), seed);
  await page.goto('http://localhost:5173/#/etiquetas', { waitUntil: 'networkidle0', timeout: 30000 });
  await settle(page);
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: join(SHOTS, `${name}.png`) });
  console.error(`  ${name}.png`);
  await page.close();
}

await shot([1440, 900], 'go2-etiquetas-filled-1440x900');
await shot([375, 812], 'go2-etiquetas-filled-375x812');
await browser.close();
console.error('done');
