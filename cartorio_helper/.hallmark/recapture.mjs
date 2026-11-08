// One-off: capture loaded data states for the Hallmark handoff.
// Upload: real sample remessa XML. Certidão: generated minimal PDF fixture.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(ROOT, 'shots');
mkdirSync(SHOTS, { recursive: true });

// ---------- puppeteer discovery (same tiers as sloplint-render) ----------
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
if (!chrome && typeof puppeteer.executablePath === 'function') {
  try { const b = puppeteer.executablePath(); if (b && existsSync(b)) chrome = b; } catch {}
}
if (!chrome) throw new Error('no Chrome found; set CHROME_PATH');

// ---------- minimal PDF fixture (xref built correctly, WinAnsi text) ----------
function buildPdf(lines) {
  const enc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const stream =
    'BT /F1 10 Tf 50 780 Td 14 TL\n' +
    lines.map((l) => `(${enc(l)}) Tj T*`).join('\n') +
    '\nET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
  ];
  let body = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(body, 'latin1'));
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(body, 'latin1');
  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(body + xref + trailer, 'latin1');
}

const pdfLines = [
  'CERTIDÃO DE NASCIMENTO',
  'Nome MARIA SOUZA LIMA',
  'Sexo feminino',
  'Data de nascimento Dia 12 Mês 3 Ano 1990',
  'Data de registro Dia 15 Mês 3 Ano 1990',
  'Matrícula 012345 67 8 9012 3456 7890 1234 Hora 10',
  'Selo Digital: 4AB2C3D9E8',
  'CNS No 123456789',
  'passou a assinar MARIA SOUZA LIMA OLIVEIRA. Conforme certificado.',
  'Emitido em 01/02/2024',
];
const pdfBytes = buildPdf(pdfLines);
const pdfB64 = pdfBytes.toString('base64');
writeFileSync(join(ROOT, 'fixture-certidao.pdf'), pdfBytes);

const xmlB64 = readFileSync(join(ROOT, '..', 'sample', '1664_20250514_RIT_I_113052.xml')).toString('base64');
const xml2B64 = readFileSync(join(ROOT, '..', 'sample', '1664_20250514_RCPN_I_113037.xml')).toString('base64');

// ---------- page driver ----------
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const settle = (page) => page.evaluate(async () => {
  if (document.fonts && document.fonts.status !== 'loaded') {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
});

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
    try { await page.waitForSelector(winSelector, { timeout: 15000 }); } catch {}
  }
  await prestige(page, 500);
  await settle(page);
  await page.screenshot({ path: join(SHOTS, `${name}.png`) });
  console.error(`  ${name}.png`);
  await page.close();
}

function prestige(page, ms) { return new Promise((r) => setTimeout(r, ms)); }

const xmlArgs = { b64: xmlB64, name: 'remessa-1664.xml', mime: 'text/xml' };
const pdfArgs = { b64: pdfB64, name: 'fixture-certidao.pdf', mime: 'application/pdf' };
const noArgs = null;

console.error('capturing loaded states…');
await capture('/upload', { width: 1440, height: 900 }, 'localhost-5173-upload-loaded-1440x900', xmlArgs, 'table.ledger');
await capture('/certidao', { width: 1440, height: 900 }, 'localhost-5173-certidao-loaded-1440x900', pdfArgs, '.records');
await capture('/certidao', { width: 375, height: 812 }, 'localhost-5173-certidao-loaded-375', pdfArgs, '.records');
await capture('/consulta', { width: 1440, height: 900 }, 'localhost-5173-consulta-1440x900', noArgs, '.sheet');
await capture('/consulta', { width: 375, height: 812 }, 'localhost-5173-consulta-375', noArgs, '.sheet');

await browser.close();
console.error('done');
