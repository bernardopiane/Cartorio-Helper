// One-off: pick AA-passing lightness for --color-error / --color-success.
// oklch -> oklab -> linear sRGB -> relative luminance -> WCAG contrast.
function oklchToSrgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const to = (x) => Math.max(0, Math.min(1, x));
  const r = to(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = to(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bb = to(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
  const gam = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  return [gam(r), gam(g), gam(bb)];
}
const srgbLin = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * srgbLin(r) + 0.7152 * srgbLin(g) + 0.0722 * srgbLin(b);
const ratio = (a, b) => {
  const [lo, hi] = [a, b].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
};
// current paper/sheet
const paper = lum(oklchToSrgb(0.84, 0.012, 245));
const sheet = lum(oklchToSrgb(0.935, 0.008, 245));
console.log(`paper lum ${paper.toFixed(4)} | sheet lum ${sheet.toFixed(4)}`);
for (const [name, hue, chroma] of [['error', 27, 0.19], ['success', 150, 0.12]]) {
  for (const L of [0.52, 0.48, 0.46, 0.44, 0.42, 0.40].sort((x, y) => y - x)) {
    const rgb = oklchToSrgb(L, chroma, hue);
    const r1 = ratio(lum(rgb), paper), r2 = ratio(lum(rgb), sheet);
    console.log(`${name} L=${L} rgb(${rgb.map((v) => (v * 255).toFixed(0)).join(' ')}) paper ${r1.toFixed(2)}:1 sheet ${r2.toFixed(2)}:1 ${r1 >= 4.5 && r2 >= 4.5 ? 'PASS both' : r1 >= 4.5 ? 'pass paper' : 'fail'}`);
  }
}
// first failing prints first, so first PASS from the top is the target token value
