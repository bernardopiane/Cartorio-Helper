// Assessment A re-run: fresh captures of all routes × 2 viewports + loaded states.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

const baseCertidaoLines = [
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
// variant: no CNS line -> exercises the "não localizado no PDF" Miss state
const noCnsLines = baseCertidaoLines.filter((l) => !/^CNS/i.test(l));
const pdf1B64 = buildPdf(baseCertidaoLines).toString('base64');
const pdf2B64 = buildPdf(noCnsLines).toString('base64');

const xmlB64 = readFileSync(join(ROOT, '..', 'sample', '1664_20250514_RIT_I_113052.xml')).toString('base64');
const badB64 = Buffer.from('<bom><notaremessa/>', 'utf8').toString('base64');

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--force-device-scale-factor=1'] });
const settle = (page) => page.evaluate(async () => {
  if (document.fonts && document.fonts.status !== 'loaded') {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
});

async function newPage(viewport) {
  const page = await browser.newPage();
  await page.setViewport({ width: viewport[0], height: viewport[1], deviceScaleFactor: 1 });
  return page;
}

async function capture(route, viewport, name, { file, seedLS, after } = {}) {
  const page = await newPage(viewport);
  await page.goto('http://localhost:5173/#/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
  if (seedLS) {
    await page.evaluate((entries) => {
      for (const [k, v] of entries) localStorage.setItem(k, v);
    }, seedLS);
  }
  await page.goto(`http://localhost:5173/#${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await settle(page);
  if (file) {
    const injected = await page.evaluate(({ b64, name, mime }) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const input = document.querySelector('input[type="file"]');
      if (!input) return 'no input';
      const f = new File([bytes], name, { type: mime });
      const dt = new DataTransfer();
      dt.items.add(f);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return 'ok';
    }, file);
    if (injected !== 'ok') console.error(`  inject failed on ${route}: ${injected}`);
  }
  try { await page.waitForFunction(() => {
    const t = document.body.innerText || '';
    return t.includes('Certidão') && !t.includes('Extraindo');
  }, { timeout: 12000 }); } catch {}
  if (after) { try { await after(page); } catch (e) { console.error(`  after failed: ${e.message}`); } }
  await new Promise((r) => setTimeout(r, 500));
  await settle(page);
  await page.screenshot({ path: join(SHOTS, `${name}.png`) });
  console.error(`  ${name}.png`);
  await page.close();
}

const VP_D = [1440, 900];
const VP_M = [375, 812];
const banner = 'tenant: assessment-A rerun · fresh captures post-improvement';

// empty states, all routes, both viewports
for (const [vp, vptag] of [[VP_D, '1440x900'], [VP_M, '375x812']]) {
  await capture('/dashboard', vp, `go-dashboard-${vptag}`);
  await capture('/upload', vp, `go-upload-empty-${vptag}`);
  await capture('/formatter', vp, `go-formatter-${vptag}`);
  await capture('/etiquetas', vp, `go-etiquetas-${vptag}`);
  await capture('/consulta', vp, `go-consulta-${vptag}`);
  await capture('/certidao', vp, `go-certidao-empty-${vptag}`);
  await capture('/certidao-self-error', vp, `go-notfound-${vptag}`);
}

// upload loaded (sample XML) + bad file error + armed limpar
await capture('/upload', VP_D, `go-upload-loaded-1440x900`, { file: { b64: xmlB64, name: 'remessa-1664.xml', mime: 'text/xml' } });
await capture('/upload', VP_M, `go-upload-loaded-375x812`, { file: { b64: xmlB64, name: 'remessa-1664.xml', mime: 'text/xml' } });
await capture('/upload', VP_D, `go-upload-badfile-1440x900`, { file: { b64: badB64, name: 'bad.xml', mime: 'text/xml' } });
await capture('/upload', VP_D, `go-upload-armed-1440x900`, {
  file: { b64: xmlB64, name: 'remessa-1664.xml', mime: 'text/xml' },
  after: async (page) => {
    const btns = await page.$$('button');
    for (const b of btns) {
      const t = await b.evaluate((el) => el.textContent);
      if (t && t.includes('Limpar')) { await b.click(); break; }
    }
    await new Promise((r) => setTimeout(r, 300));
  },
});

// certidão loaded with CNS (all fields filled) and variant without CNS (Miss rows)
await capture('/certidao', VP_D, `go-certidao-full-1440x900`, { file: { b64: pdf1B64, name: 'certidao.pdf', mime: 'application/pdf' } });
await capture('/certidao', VP_M, `go-certidao-full-375x812`, { file: { b64: pdf1B64, name: 'certidao.pdf', mime: 'application/pdf' } });
await capture('/certidao', VP_D, `go-certidao-miss-1440x900`, { file: { b64: pdf2B64, name: 'certidao-sem-cns.pdf', mime: 'application/pdf' } });

// etiquetas filled via localStorage seed + copy-disabled state
await capture('/etiquetas', VP_D, `go-etiquetas-filled-1440x900`, {
  seedLS: [['ch-upload:v1', JSON.stringify({ records: [{ livro: 'B2' }] })], ['ch-etiquetas:v1', JSON.stringify({ processo: '0123456-78.2024.800.0001', selo: '4AB2C3D9E8', livro: 'B2', folha: '8', termos: '113052', cpf1: '123.456.789-09', nome1: 'MARIA SOUZA LIMA', cpf2: '', nome2: '' })]],
});
// phone widths: etiquetas filled for touch target inspection
await capture('/etiquetas', VP_M, `go-etiquetas-filled-375x812`, {
  seedLS: [['ch-etiquetas:v1', JSON.stringify({ processo: '0123456-78.2024.800.0001', selo: '4AB2C3D9E8', livro: 'B2', folha: '8', termos: '113052', cpf1: '123.456.789-09', nome1: 'MARIA SOUZA LIMA', cpf2: '', nome2: '' })]],
});

await browser.close();
console.error('done');
