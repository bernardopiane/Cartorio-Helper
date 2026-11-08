// Certidão text extraction: Portuguese written numbers, dates, and field
// extraction from the flattened certificate PDF text. Pure module — no DOM,
// safe to unit test.

export const MESES_NUM = {
  janeiro: "01", fevereiro: "02", março: "03", marco: "03",
  abril: "04", maio: "05", junho: "06", julho: "07",
  agosto: "08", setembro: "09", outubro: "10", novembro: "11", dezembro: "12",
};

const UNIDADES = {
  zero: 0, um: 1, uma: 1, dois: 2, duas: 2, três: 3, tres: 3, quatro: 4, cinco: 5,
  seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13,
  quatorze: 14, catorze: 14, quinze: 15, dezesseis: 16, dezasseis: 16,
  dezessete: 17, dezassete: 17, dezoito: 18, dezenove: 19, dezanove: 19,
  vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60,
  setenta: 70, oitenta: 80, noventa: 90,
};
const CENTENAS = {
  cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, trezentas: 300,
  quatrocentos: 400, quatrocentas: 400, quinhentos: 500, quinhentas: 500,
  seiscentos: 600, seiscentas: 600, setecentos: 700, setecentas: 700,
  oitocentos: 800, oitocentas: 800, novecentos: 900, novecentas: 900,
};

export function writtenToNumber(str) {
  if (!str) return NaN;
  const words = str.toLowerCase().replace(/[, -]/g, " ").trim().split(/\s+/).filter(w => w && w !== "e");
  let total = 0, cur = 0;
  for (const w of words) {
    if (w === "mil") { cur = cur || 1; total += cur * 1000; cur = 0; }
    else if (CENTENAS[w] !== undefined) cur += CENTENAS[w];
    else if (UNIDADES[w] !== undefined) cur += UNIDADES[w];
  }
  return total + cur;
}

export function parseDate(raw) {
  if (!raw) return null;
  const num = raw.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (num) return `${num[1].padStart(2, "0")}/${num[2].padStart(2, "0")}/${num[3]}`;
  const mixed = raw.toLowerCase().match(
    /(\d{1,2})\s+de\s+(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/
  );
  if (mixed) return `${mixed[1].padStart(2, "0")}/${MESES_NUM[mixed[2]]}/${mixed[3]}`;
  const written = raw.toLowerCase().match(
    /(.+?)\s+de\s+(janeiro|fevereiro|mar[çc]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(.+)/
  );
  if (written) {
    const day = writtenToNumber(written[1]);
    const mon = MESES_NUM[written[2]];
    const year = writtenToNumber(written[3]);
    if (day > 0 && day <= 31 && mon && !isNaN(year) && year > 1800 && year < 2200)
      return `${String(day).padStart(2, "0")}/${mon}/${year}`;
  }
  return raw.replace(/\s+/g, " ").trim();
}

export function dateFromDMA(chunk) {
  const d = chunk.match(/Dia\s+(\d{1,2})/i);
  const m = chunk.match(/M[eê]s\s+(\d{1,2})/i);
  const a = chunk.match(/Ano\s+(\d{4})/i);
  if (d && m && a)
    return `${d[1].padStart(2, "0")}/${m[1].padStart(2, "0")}/${a[1]}`;
  return null;
}

function extractDateFromLabel(text, labelPattern) {
  const re = new RegExp(labelPattern + "(.{0,300})", "i");
  const m = text.match(re);
  return m ? dateFromDMA(m[1]) : null;
}

function clean(s) { return s ? s.replace(/\s+/g, " ").trim() : null; }

function parseField(text, ...patterns) {
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return clean(m[1]);
  }
  return null;
}

function extractNascimento(t) {
  const nome = parseField(t,
    /Nome\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ\s]+?)(?:\s+N[uú]mero do CPF|\s+Matr[ií]cula|\s+CPF)/i,
  );
  const nomeAtualMatch = t.match(
    /passou a assinar[:\s]+([A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜa-záéíóúâêôãõçàü\s]+?)(?:\.|Conforme|Selo)/i
  );
  const nomeAtual = nomeAtualMatch ? clean(nomeAtualMatch[1]) : nome;
  const sexoRaw = parseField(t, /Sexo\s+(feminino|masculino)/i);
  const sexo = sexoRaw ? sexoRaw[0].toUpperCase() + sexoRaw.slice(1).toLowerCase() : null;
  const dataEvento =
    extractDateFromLabel(t, "Data de nascimento") ||
    parseDate(parseField(t, /Data de nascimento\s+(.+?)\s+Dia/i));
  const dataRegistro =
    extractDateFromLabel(t, "Data de registro") ||
    parseDate(parseField(t, /Data de registro\s+(.+?)\s+(?:DNV|Anotaç)/i));
  return { nome, nomeAtual, sexo, dataEvento, dataRegistro };
}

function extractObito(t) {
  const nome = parseField(t,
    /Nome\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜa-záéíóúâêôãõçàü\s]+?)(?:\s+N[uú]mero do CPF|\s+Matr[ií]cula|\s+CPF)/i,
  );
  const nomeAtualMatch = t.match(
    /passou a assinar[:\s]+([A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜa-záéíóúâêôãõçàü\s]+?)(?:\.|Conforme|Selo)/i
  );
  const nomeAtual = nomeAtualMatch ? clean(nomeAtualMatch[1]) : nome;
  const sexoRaw = parseField(t, /Sexo\s+(feminino|masculino)/i);
  const sexo = sexoRaw ? sexoRaw[0].toUpperCase() + sexoRaw.slice(1).toLowerCase() : null;
  const dataEvento = extractDateFromLabel(t, "Data d[eo] (?:falecimento|[oó]bito)");
  const dataRegistro =
    extractDateFromLabel(t, "Data d[eo] registro") ||
    parseDate(parseField(t, /Data d[eo] registro\s+(.+?)\s+(?:DNV|Anotaç)/i));
  return { nome, nomeAtual, sexo, dataEvento, dataRegistro };
}

function extractCasamento(t) {
  const split = t.split(/2[°º]\s*C[oô]njuge/i);
  const part1 = split[0];
  const part2 = split[1] || "";

  function spouseName(chunk) {
    const m = chunk.match(/Nome no momento da habilita[cç][aã]o\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜa-záéíóúâêôãõçàü\s]+?)(?:\s+Dia|\s+Nacionalidade|\s+Data)/i);
    return m ? clean(m[1]) : null;
  }

  function spouseNameAfter(chunk) {
    const m = chunk.match(/Nome que passou a utilizar\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜa-záéíóúâêôãõçàü\s]+?)(?:\s+2[°º]|\s+Data|\s+Regime|\s+Anotaç|$)/i);
    return m ? clean(m[1]) : null;
  }

  function spouseBirthDate(chunk) {
    return dateFromDMA(chunk) || null;
  }

  function spouseEstadoCivil(chunk) {
    const m = chunk.match(/Estado Civil\s+(Solteiro|Solteira|Divorciado|Divorciada|Vi[uú]vo|Vi[uú]va|Separado|Separada)/i);
    return m ? clean(m[1]) : null;
  }

  const nomeAtualLines = [...t.matchAll(/([A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ]{2}[A-ZÁÉÍÓÚÂÊÔÃÕÇÀÜ\s]+?)\s+N[ÃA]O CONSTA/gi)];
  const nomeAtual1 = nomeAtualLines[0] ? clean(nomeAtualLines[0][1]) : null;
  const nomeAtual2 = nomeAtualLines[1] ? clean(nomeAtualLines[1][1]) : null;

  const conjuge1 = {
    nome: spouseName(part1),
    nomeAtual: spouseNameAfter(part1) || nomeAtual1,
    dataNascimento: spouseBirthDate(part1),
    estadoCivil: spouseEstadoCivil(part1),
  };
  const conjuge2 = {
    nome: spouseName(part2),
    nomeAtual: spouseNameAfter(part2) || nomeAtual2,
    dataNascimento: spouseBirthDate(part2),
    estadoCivil: spouseEstadoCivil(part2),
  };

  const dataCasamento = extractDateFromLabel(t, "Data da celebra[cç][aã]o do casamento");
  const dataRegistro =
    extractDateFromLabel(t, "Data de registro do casamento") ||
    extractDateFromLabel(t, "Data de registro");

  const regimeBens = parseField(t,
    /Regime de bens\s+([^\n]+?)(?:\s+Data|\s+Anotaç|$)/i,
  );

  return { conjuge1, conjuge2, dataCasamento, dataRegistro, regimeBens };
}

export function extractFields(rawText) {
  const t = rawText.replace(/\n/g, " ");

  const idxCasamento = t.search(/certid[ãa]o\s+de\s+casamento/i);
  const idxObito = t.search(/certid[ãa]o\s+de\s+[oó]bito/i);
  const idxNascimento = t.search(/certid[ãa]o\s+de\s+nascimento/i);

  let tipoRegistro = "Nascimento";
  const matches = [
    { tipo: "Casamento", idx: idxCasamento },
    { tipo: "Óbito", idx: idxObito },
    { tipo: "Nascimento", idx: idxNascimento }
  ].filter(m => m.idx !== -1).sort((a, b) => a.idx - b.idx);

  if (matches.length > 0) {
    tipoRegistro = matches[0].tipo;
  }

  const matricula = parseField(t,
    /Matr[ií]cula\s+([\d\s]{10,60}?)(?:\s+\d[°º]|\s+Data|\s+Hora|\s+[A-Z]{2,})/i,
    /Matr[ií]cula\s+([\d\s]+)/i,
  );

  const selosAll = [...t.matchAll(/Selo\s+[Dd]igital[:\s]+([A-Za-z0-9-]+)/g)];
  const seloDigital = selosAll.length > 0 ? selosAll[selosAll.length - 1][1] : null;

  const codigoCNS = parseField(t,
    /CNS\s+[Nn][oº°]?\s*([\d]+)/i,
    /CNS[:\s]+([\d]+)/i,
  );

  const allDates = [...t.matchAll(/(\d{2}\/\d{2}\/\d{4})/g)];
  const dataEmissao = allDates.length > 0 ? allDates[allDates.length - 1][1] : null;

  const base = { tipoRegistro, matricula: clean(matricula), seloDigital, codigoCNS, dataEmissao };

  if (tipoRegistro === "Casamento") {
    return { ...base, ...extractCasamento(t) };
  }

  if (tipoRegistro === "Óbito") {
    return { ...base, ...extractObito(t) };
  }

  return { ...base, ...extractNascimento(t) };
}

export const getSexoCasamento = (estadoCivil) => {
  if (!estadoCivil) return "";
  const ec = estadoCivil.toLowerCase();
  if (ec.endsWith('a')) return "Feminino";
  if (ec.endsWith('o')) return "Masculino";
  return "";
};
