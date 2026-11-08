// Shapes digits into the pt-BR CPF visual mask as the user types:
// "12345678901" -> "123.456.789-01"; partial input stays valid ("1234" -> "123.4").
export function maskCpf(value) {
  const d = String(value ?? '').replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// Keeps a stored value (possibly saved already masked) down to digits.
export function maskCpfInput(value) {
  return maskCpf(value);
}
