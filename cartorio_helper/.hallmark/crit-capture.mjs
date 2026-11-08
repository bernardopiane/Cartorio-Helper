// Assessment A capture: all routes at 1440x900 and 375x812 + loaded states.
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(ROOT, 'crit-shots');
mkdirSync(SHOTS, { recursive: true });

const { createRequire } = await import('node:module');
let puppeteer = null;
const tryRoots = async (roots) => {
  for (const root of roots) {
    for (const name of ['puppeteer-core', 'puppeteer']) {
      try {
        const req = createRequire(join(root, 'noop.js'));
        const resolved = req.resolve(name);
        puppeteer = (await import(`file://${resolved.replace(/\\/g, '/')}`)).default;
        if (puppeteer) return;
      } catch {}
    }
  }
};
await tryRoots([process.cwd()]);
if (!puppeteer) throw new Error('puppeteer-core not found');

const CHROMES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);
let chrome = CHROMES.find((p) => existsSync(p)) || null;
if (!chrome) throw new Error('no Chrome found; set CHROME_PATH');

const xmlB64 = readFileSync(join(ROOT, '..', 'sample', '1664_20250514_RIT_I_113052.xml')).toString('base64');
const pdfB64 = readFileSync(join(ROOT, 'fixture-certidao.pdf')).toString('base64');

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const settle = (page) => page.evaluate(async () => {
  if (document.fonts && document.fonts.status !== 'loaded') {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function capture(route, viewport, name, fileArgs, winSelector) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(`http://localhost:5173/#${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await settle(page);
  if (fileArgs) {
    const injected = await page.evaluate(({ b64, name, mime }) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const input = document.querySelector('input[type="file"]');
      if (!input) return 'no input';
      const file = new File([bytes], name, { type: mime });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok';
    }, fileArgs);
    if (injected !== 'ok') console.error(`  inject failed on ${route}: ${injected}`);
    if (winSelector) {
      try { await page.waitForSelector(winSelector, { timeout: 15000 }); } catch {}
    }
    await wait(700);
  }
  await settle(page);
  await page.screenshot({ path: join(SHOTS, `${name}.png`) });
  console.error(`  ${name}.png`);
  await page.close();
}

const xmlArgs = { b64: xmlB64, name: 'remessa-1664.xml', mime: 'text/xml' };
const pdfArgs = { b64: pdfB64, name: 'fixture-certidao.pdf', mime: 'application/pdf' };
const noArgs = null;

const V1440 = { width: 1440, height: 900 };
const V375 = { width: 375, height: 812 };

for (const [vp, tag] of [[V1440, '1440x900'], [V375, '375x812']]) {
  await capture('/dashboard', vp, `crit-dashboard-${tag}`, noArgs, null);
  await capture('/upload', vp, `crit-upload-empty-${tag}`, noArgs, null);
  await capture('/formatter', vp, `crit-formatter-${tag}`, noArgs, null);
  await capture('/etiquetas', vp, `crit-etiquetas-${tag}`, noArgs, null);
  await capture('/consulta', vp, `crit-consulta-${tag}`, noArgs, '.sheet');
  await capture('/certidao', vp, `crit-certidao-empty-${tag}`, noArgs, null);
  await capture('/rota-inexistente', vp, `crit-notfound-${tag}`, noArgs, null);
}

await capture('/upload', V1440, 'crit-upload-loaded-1440x900', xmlArgs, 'table.ledger');
await capture('/upload', V375, 'crit-upload-loaded-375x812', xmlArgs, 'table.ledger');
await capture('/certidao', V1440, 'crit-certidao-loaded-1440x900', pdfArgs, '.records');
await capture('/certidao', V375, 'crit-certidao-loaded-375x812', pdfArgs, '.records');

// error state: inject a non-XML file to see the failure notice
const badArgs = { b64: Buffer.from('isto nao e um xml').toString('base64'), name: 'arquivo.txt', mime: 'text/plain' };
await capture('/upload', V1440, 'crit-upload-error-1440x900', badArgs, null);

await browser.close();
console.error('done');
