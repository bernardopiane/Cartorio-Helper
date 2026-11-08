// Money parsing/formatting for the notary fee XML (XSD decimal, e.g. "153.41").
// parseMoney also tolerates pt-BR grouped forms ("1.234,56", "153,41") just in
// case a remessa ever carries them.

export function formatCurrency(value) {
  return value ? String(value).replace('.', ',') : '';
}

export function parseMoney(value) {
  const s = String(value ?? '').trim();
  if (!s) return 0;
  const normalized = s.includes(',')
    ? s.replace(/\./g, '').replace(',', '.')
    : s.replace(/,/g, '.');
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}
