import { useState, useRef, useCallback } from "react";
import { Button, Typography, Chip } from '@mui/material';
import { FileBadge, Upload, RotateCcw, FileText } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

async function extractTextFromPDF(file) {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  return text;
}

const MESES_NUM = {
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

function writtenToNumber(str) {
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

function parseDate(raw) {
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
    if (!isNaN(day) && mon && !isNaN(year) && year > 1800 && year < 2200)
      return `${String(day).padStart(2, "0")}/${mon}/${year}`;
  }
  return raw.replace(/\s+/g, " ").trim();
}

function dateFromDMA(chunk) {
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

function extractFields(rawText) {
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

const TIPO_STYLE = {
  Nascimento: { bg: "#dbeafe", color: "#1e40af", label: "Nascimento" },
  Casamento: { bg: "#fef9c3", color: "#854d0e", label: "Casamento" },
  Óbito: { bg: "#fee2e2", color: "#991b1b", label: "Óbito" },
};

const getSexoCasamento = (estadoCivil) => {
  if (!estadoCivil) return "";
  const ec = estadoCivil.toLowerCase();
  if (ec.endsWith('a')) return "Feminino";
  if (ec.endsWith('o')) return "Masculino";
  return "";
};

function Field({ label, value, sub }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3.5 py-2.5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-900 break-all">{value || '—'}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function Initials({ name }) {
  const parts = (name || "").split(" ").filter(Boolean);
  const ini = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || "?")[0];
  return <>{ini.toUpperCase()}</>;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2.5 py-6">
      <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      <span className="text-sm text-slate-400">Extraindo texto do PDF...</span>
    </div>
  );
}

export default function CertidaoExtractor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Por favor, selecione um arquivo PDF válido.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    setFileName(file.name);
    try {
      const text = await extractTextFromPDF(file);
      setData(extractFields(text));
    } catch (err) {
      console.error(err);
      setError("Não foi possível ler o PDF. Verifique se a certidão possui texto selecionável.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    processFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setData(null);
    setError(null);
    setFileName(null);
    inputRef.current?.click();
  };

  const tipoStyle = data ? (TIPO_STYLE[data.tipoRegistro] || TIPO_STYLE.Nascimento) : null;

  const headerName = data?.tipoRegistro === "Casamento"
    ? [data.conjuge1?.nomeAtual || data.conjuge1?.nome, data.conjuge2?.nomeAtual || data.conjuge2?.nome].filter(Boolean).join(" & ")
    : (data?.nomeAtual || data?.nome);

  return (
    <div>
      <div className="mb-6">
        <Typography variant="h4" gutterBottom>Leitor de Certidões</Typography>
        <Typography variant="body2" color="text.secondary">
          Extraia dados de certidões de nascimento, casamento e óbito em PDF
        </Typography>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
      />

      {!data && (
        <div
          onClick={() => { if (!loading) inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`
            rounded-xl border-2 border-dashed p-10 text-center cursor-pointer select-none transition-all duration-150
            ${drag ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'}
            ${loading ? 'cursor-default' : ''}
          `}
        >
          <div className="flex justify-center mb-3">
            {loading ? (
              <Spinner />
            ) : (
              <FileBadge size={40} className="text-slate-300" strokeWidth={1.5} />
            )}
          </div>
          {!loading && (
            <>
              <Typography variant="h6" sx={{ mb: 0.5, color: drag ? '#4f46e5' : undefined }}>
                Selecionar certidão em PDF
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Arraste o arquivo aqui ou clique para selecionar
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                Nascimento · Casamento · Óbito
              </Typography>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg">
          <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
            {error}
          </Typography>
        </div>
      )}

      {data && (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
              style={{ background: tipoStyle.bg, color: tipoStyle.color }}
            >
              <Initials name={headerName} />
            </div>
            <div className="flex-1 min-w-0">
              <Typography variant="h6" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0 }}>
                {headerName || '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">{fileName}</Typography>
            </div>
            <Chip
              label={tipoStyle.label}
              size="small"
              sx={{ background: tipoStyle.bg, color: tipoStyle.color, fontWeight: 600, borderRadius: 1.5 }}
            />
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <Field label="Nome da 1ª parte" value={data.tipoRegistro === 'Casamento' ? (data.conjuge1?.nomeAtual || data.conjuge1?.nome) : (data.nomeAtual || data.nome)} />
            <Field label="Sexo da 1ª parte" value={data.tipoRegistro === 'Casamento' ? getSexoCasamento(data.conjuge1?.estadoCivil) : data.sexo} />
            <Field label="Nome da 2ª parte" value={data.tipoRegistro === 'Casamento' ? (data.conjuge2?.nomeAtual || data.conjuge2?.nome) : ''} />
            <Field label="Sexo da 2ª parte" value={data.tipoRegistro === 'Casamento' ? getSexoCasamento(data.conjuge2?.estadoCivil) : ''} />
            <Field label="Matrícula" value={data.matricula} />
            <Field label="Selo Digital" value={data.seloDigital} />
            <Field label="Código CNS" value={data.codigoCNS} />
            <Field label="Tipo do Registro" value={data.tipoRegistro} />
            <Field label="Data do Evento" value={data.tipoRegistro === 'Casamento' ? data.dataCasamento : data.dataEvento} />
            <Field label="Data do Registro" value={data.dataRegistro} />
          </div>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<RotateCcw size={15} />}
            onClick={reset}
            sx={{ mt: 1 }}
          >
            Carregar outra certidão
          </Button>
        </div>
      )}
    </div>
  );
}
