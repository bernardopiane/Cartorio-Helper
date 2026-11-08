// One-off: verify the polish-pass fixes in the dev server (5173).
// 1 persistence survives reload · 2 armed two-step limpar · 3 sticky ledger header
// 4 Σ emolumentos foot · 5 certidão '/vs "não localizado"' · 6 etiquetas handoff + copy guard
import { existsSync, readFileSync } from 'node:fs';
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

const results = [];
const assert = (name, ok, detail = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

async function settle(page) {
  return page.evaluate(async () => {
    if (document.fonts && document.fonts.status !== 'loaded') {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]);
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });

async function injectFile(page, b64, name, mime) {
  return page.evaluate(({ b64, name, mime }) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const input = document.querySelector('input[type="file"]');
    if (!input) return 'no input';
    const file = new File([bytes], name, { type: mime });
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok';
  }, { b64, name, mime });
}

// ---------- 1-4: Upload ----------
let page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/#/upload', { waitUntil: 'networkidle0', timeout: 30000 });

const xmlB64 = readFileSync(join(ROOT, '..', 'sample', '1664_20250514_RIT_I_113052.xml')).toString('base64');
await injectFile(page, xmlB64, 'remessa-1664.xml', 'text/xml');
await page.waitForSelector('table.ledger', { timeout: 15000 });

assert('upload persists to localStorage', await page.evaluate(() => {
  const raw = localStorage.getItem('ch-upload:v1');
  if (!raw) return false;
  const s = JSON.parse(raw);
  return Array.isArray(s.records) && s.records.length > 0 && s.files?.includes('remessa-1664.xml');
}));

const rowCountBefore = await page.$$eval('table.ledger tbody tr', (r) => r.length);
await settle(page);
await page.screenshot({ path: join(SHOTS, 'fix-upload-loaded-1440.png') });

// sticky header while scrolled right/down
await page.evaluate(() => {
  const sc = document.querySelector('.table-scroll');
  sc.scrollLeft = 900; sc.scrollTop = 400;
});
await settle(page);
await page.screenshot({ path: join(SHOTS, 'fix-upload-sticky-1440.png') });
assert('ledger header sticky', await page.evaluate(() =>
  getComputedStyle(document.querySelector('table.ledger th')).position === 'sticky'));
assert('Σ emolumentos foot present', await page.evaluate(() => {
  const foot = document.querySelector('.sheet-foot');
  return /Σ emolumentos/.test(foot.textContent) && /R\$/.test(foot.textContent);
}));

// persistence across reload
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('table.ledger', { timeout: 15000 });
const rowCountAfter = await page.$$eval('table.ledger tbody tr', (r) => r.length);
assert('table survives reload', rowCountAfter === rowCountBefore, `${rowCountBefore} -> ${rowCountAfter}`);
assert('provenance filename shown after reload', await page.evaluate(() =>
  document.querySelector('.sheet-foot').textContent.includes('remessa-1664.xml')));

// armed two-step limpar
const clickByLabel = async (label) => page.evaluate((label) => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().includes(label));
  if (!btn) return false;
  btn.click();
  return true;
}, label);

await clickByLabel('Limpar');
await settle(page);
assert('first click arms, does not clear', await page.evaluate(() =>
  [...document.querySelectorAll('button')].some((b) =>
    b.textContent.trim().includes('Confirmar limpar?') && document.querySelector('table.ledger'))));
await page.screenshot({ path: join(SHOTS, 'fix-upload-armed-1440.png') });
await clickByLabel('Confirmar');
await new Promise((r) => setTimeout(r, 300));
assert('second click clears + drops storage', await page.evaluate(() =>
  !document.querySelector('table.ledger') && localStorage.getItem('ch-upload:v1') === null));
await settle(page);
await page.screenshot({ path: join(SHOTS, 'fix-upload-cleared-1440.png') });
await page.close();

// ---------- 5: Certidão (fixture without CNS → Miss) ----------
// minimal PDF fixture (missing CNS on purpose, so that row must read "não localizado")
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
  xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(body + xref, 'latin1');
}
const pdfB64 = buildPdf([
  'CERTIDÃO DE NASCIMENTO',
  'Nome MARIA SOUZA LIMA',
  'Sexo feminino',
  'Data de nascimento Dia 12 Mês 3 Ano 1990',
  'Data de registro Dia 15 Mês 3 Ano 1990',
  'Matrícula 012345 67 8 9012 3456 7890 1234 Hora 10',
  'Selo Digital: 4AB2C3D9E8',
  'passou a assinar MARIA SOUZA LIMA OLIVEIRA. Conforme certificado.',
  'Emitido em 01/02/2024',
]).toString('base64');
page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/#/certidao', { waitUntil: 'networkidle0', timeout: 30000 });
await injectFile(page, pdfB64, 'fixture-certidao.pdf', 'application/pdf');
await page.waitForSelector('.records', { timeout: 20000 });
await settle(page);
assert('missing field says "não localizado no PDF"', await page.evaluate(() => {
  const dds = [...document.querySelectorAll('.records dd')];
  const cns = dds.find((d) => /não localizado no PDF/.test(d.textContent));
  return Boolean(cns);
}));
assert('certidão persists to localStorage', await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('ch-certidao:v1'));
  return Boolean(s?.data) && s.fileName === 'fixture-certidao.pdf';
}));
await page.screenshot({ path: join(SHOTS, 'fix-certidao-1440.png') });
// reset opens the picker only — data unharmed
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Carregar outra'));
  btn.click();
});
await new Promise((r) => setTimeout(r, 200));
assert('reset keeps extraction (picker-only)', await page.evaluate(() =>
  Boolean(document.querySelector('.records')) &&
  Boolean(JSON.parse(localStorage.getItem('ch-certidao:v1'))?.data)));
await page.close();

// ---------- 6: Etiquetas (seed partial + handoff from ledger) ----------
page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.evaluateOnNewDocument(() => {
  // seed a half-written averbação (cpf incomplete) — refresh keeps it
  localStorage.setItem('ch-etiquetas:v1', JSON.stringify({
    cpf1: '112.22', nome1: 'MARIA SOUZA LIMA',
  }));
  // seed a parsed remessa the handoff reads from
  localStorage.setItem('ch-upload:v1', JSON.stringify({
    records: [{ selo: '00001', livro: 'B-123', folha: '045', termo: '00821' }],
    files: ['remessa-1664.xml'],
  }));
});
await page.goto('http://localhost:5173/#/etiquetas', { waitUntil: 'networkidle0', timeout: 30000 });
await settle(page);
assert('etiquetas fields survive via seed', await page.evaluate(() =>
  document.querySelector('#etq-nome1')?.value === 'MARIA SOUZA LIMA'));
assert('incomplete averbação shows copy hint', await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Copiar');
  return btn?.getAttribute('aria-disabled') === 'true' &&
    !btn.textContent.includes('Copiado!') &&
    btn.parentElement.parentElement.parentElement.textContent.includes('Informe o CPF completo');
}));
assert('handoff button enabled from ledger', await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Preencher da última remessa'));
  return Boolean(btn) && btn.disabled === false && /Livro/.test(btn.textContent);
}));
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Preencher da última remessa'));
  btn.click();
});
await new Promise((r) => setTimeout(r, 200));
assert('handoff fills livro/folha/termo', await page.evaluate(() => {
  const livro = document.querySelector('#etq-livro')?.value || '';
  const folha = document.querySelector('#etq-folha')?.value || '';
  const termo = document.querySelector('#etq-termo')?.value || '';
  return livro !== '' && folha !== '' && termo !== '';
}));
await settle(page);
await page.screenshot({ path: join(SHOTS, 'fix-etiquetas-1440.png') });
await page.close();

await browser.close();
console.log(results.join('\n'));
