// import React, { useState } from 'react';
// import { FileText, Upload, Download, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';

// // Nota: Este componente usa pdf.js via CDN
// const loadPdfJs = () => {
//   return new Promise((resolve, reject) => {
//     if (window.pdfjsLib) {
//       resolve(window.pdfjsLib);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
//     script.onload = () => {
//       window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
//         'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
//       resolve(window.pdfjsLib);
//     };
//     script.onerror = reject;
//     document.head.appendChild(script);
//   });
// };

// // TODO Adicionar suporte pra certidão de casamento / 2 pessoas por certidão

// export default function CertidaoExtractor() {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [extractedData, setExtractedData] = useState(null);
//   const [copiedField, setCopiedField] = useState(null);

//   const copyToClipboard = async (text, fieldName) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedField(fieldName);
//       setTimeout(() => setCopiedField(null), 2000);
//     } catch (err) {
//       console.error('Erro ao copiar:', err);
//     }
//   };

//   const extractInfoFromText = (text) => {
//     const data = {
//       nome: '',
//       sexo: '',
//       cns: '',
//       selo: '',
//       matricula: '',
//       dataRegistro: '',
//       dataEvento: ''
//     };

//     // Nome - procura após "Nome" e antes de "Número do CPF" ou "Matrícula"
//     const nomeMatch = text.match(/Nome\s+([\s\S]+?)(?:Número do CPF|Matrícula)/i);
//     if (nomeMatch) {
//       data.nome = nomeMatch[1].trim().replace(/\s+/g, ' ');
//     }

//     // Sexo
//     const sexoMatch = text.match(/Sexo\s+(feminino|masculino)/i);
//     if (sexoMatch) {
//       data.sexo = sexoMatch[1].trim();
//     }

//     // CNS
//     const cnsMatch = text.match(/CNS\s*N[ºo°]?\s*(\d+)/i);
//     if (cnsMatch) {
//       data.cns = cnsMatch[1].trim();
//     }

//     // Selo Digital (último selo mencionado)
//     const seloMatches = text.match(/Selo [Dd]igital:\s*([A-Za-z0-9]+)/g);
//     if (seloMatches && seloMatches.length > 0) {
//       const ultimoSelo = seloMatches[seloMatches.length - 1];
//       const seloMatch = ultimoSelo.match(/Selo [Dd]igital:\s*([A-Za-z0-9]+)/);
//       if (seloMatch) {
//         data.selo = seloMatch[1].trim();
//       }
//     }

//     // Matrícula
//     const matriculaMatch = text.match(/Matrícula\s+([\d\s]+)/);
//     if (matriculaMatch) {
//       data.matricula = matriculaMatch[1].trim().replace(/\s+/g, ' ');
//     }

//     // Data de registro - procura o texto por extenso
//     const dataRegistroMatch = text.match(/Data de registro\s+([\s\S]+?)(?:DNV|Dia)/i);
//     if (dataRegistroMatch) {
//       const dataTexto = dataRegistroMatch[1].trim();
//       // Tenta converter para formato DD/MM/YYYY
//       const dataConvertida = converterDataExtenso(dataTexto);
//       data.dataRegistro = dataConvertida || dataTexto;
//     }

//     // Data do evento (nascimento) - procura por "Data de nascimento"
//     const dataEventoMatch = text.match(/Data de nascimento\s+([\s\S]+?)(?:Dia)/i);
//     if (dataEventoMatch) {
//       const dataTexto = dataEventoMatch[1].trim();
//       const dataConvertida = converterDataExtenso(dataTexto);
//       data.dataEvento = dataConvertida || dataTexto;
//     }

//     // Também tenta pegar as datas nos campos Dia/Mês/Ano
//     const diaMatch = text.match(/Dia\s+(\d{2})/);
//     const mesMatch = text.match(/Mês\s+(\d{2})/);
//     const anoMatch = text.match(/Ano\s+(\d{4})/);

//     if (diaMatch && mesMatch && anoMatch && !data.dataEvento) {
//       data.dataEvento = `${diaMatch[1]}/${mesMatch[1]}/${anoMatch[1]}`;
//     }

//     return data;
//   };

//   const converterDataExtenso = (dataTexto) => {
//     const meses = {
//       'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
//       'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
//       'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
//     };

//     // Padrão: "nove de agosto de um mil e novecentos e cinquenta e dois"
//     const match = dataTexto.match(/(\w+)\s+de\s+(\w+)\s+de\s+(.*)/i);
//     if (match) {
//       const dia = converterNumeroExtenso(match[1]);
//       const mes = meses[match[2].toLowerCase()];
//       const ano = converterAnoExtenso(match[3]);

//       if (dia && mes && ano) {
//         return `${dia.padStart(2, '0')}/${mes}/${ano}`;
//       }
//     }

//     return null;
//   };

//   const converterNumeroExtenso = (texto) => {
//     const numeros = {
//       'um': '1', 'dois': '2', 'três': '3', 'quatro': '4', 'cinco': '5',
//       'seis': '6', 'sete': '7', 'oito': '8', 'nove': '9', 'dez': '10',
//       'onze': '11', 'doze': '12', 'treze': '13', 'quatorze': '14', 'quinze': '15',
//       'dezesseis': '16', 'dezessete': '17', 'dezoito': '18', 'dezenove': '19',
//       'vinte': '20', 'trinta': '30', 'tinta': '30'
//     };

//     const textoLower = texto.toLowerCase().trim();

//     // Número simples
//     if (numeros[textoLower]) {
//       return numeros[textoLower];
//     }

//     // Número composto (ex: vinte e um)
//     const partes = textoLower.split(/\s+e\s+/);
//     if (partes.length === 2 && numeros[partes[0]] && numeros[partes[1]]) {
//       return String(parseInt(numeros[partes[0]]) + parseInt(numeros[partes[1]]));
//     }

//     return null;
//   };

//   const converterAnoExtenso = (texto) => {
//     // Padrão: "um mil e novecentos e cinquenta e dois" = 1952
//     const textoLower = texto.toLowerCase().trim();

//     // Procura por "mil e" seguido do resto
//     const match = textoLower.match(/mil\s+e\s+(.*)/);
//     if (!match) return null;

//     const centenas = {
//       'novecentos': 900,
//       'oitocentos': 800,
//       'setecentos': 700,
//       'seiscentos': 600
//     };

//     const resto = match[1].trim();
//     let ano = 1000;

//     // Procura pela centena
//     for (const [palavra, valor] of Object.entries(centenas)) {
//       if (resto.includes(palavra)) {
//         ano += valor;

//         // Pega tudo depois da centena
//         const indexCentena = resto.indexOf(palavra);
//         const depoisCentena = resto.substring(indexCentena + palavra.length).trim();

//         // Remove "e" do início se existir
//         const parteRestante = depoisCentena.replace(/^e\s+/, '').trim();

//         if (parteRestante) {
//           const dezenas = converterDezenas(parteRestante);
//           if (dezenas) {
//             ano += dezenas;
//           }
//         }
//         break;
//       }
//     }

//     return String(ano);
//   };

//   const converterDezenas = (texto) => {
//     const numeros = {
//       'noventa': 90, 'oitenta': 80, 'setenta': 70, 'sessenta': 60, 'cinquenta': 50,
//       'quarenta': 40, 'trinta': 30, 'vinte': 20, 'dez': 10,
//       'dezenove': 19, 'dezoito': 18, 'dezessete': 17, 'dezesseis': 16,
//       'quinze': 15, 'quatorze': 14, 'treze': 13, 'doze': 12, 'onze': 11,
//       'nove': 9, 'oito': 8, 'sete': 7, 'seis': 6, 'cinco': 5,
//       'quatro': 4, 'três': 3, 'dois': 2, 'um': 1, 'uma': 1
//     };

//     let total = 0;
//     const textoLimpo = texto.toLowerCase().trim();

//     // Remove todos os "e" e divide em palavras
//     const palavras = textoLimpo.split(/\s+/);

//     for (const palavra of palavras) {
//       const palavraTrimmed = palavra.trim();
//       // Ignora a palavra "e"
//       if (palavraTrimmed === 'e') continue;

//       if (numeros[palavraTrimmed]) {
//         total += numeros[palavraTrimmed];
//       }
//     }

//     return total > 0 ? total : null;
//   };

//   const handleFileSelect = async (event) => {
//     const selectedFile = event.target.files[0];
//     if (!selectedFile) return;

//     if (selectedFile.type !== 'application/pdf') {
//       setError('Por favor, selecione um arquivo PDF válido.');
//       return;
//     }

//     setFile(selectedFile);
//     setError(null);
//     setExtractedData(null);
//   };

//   const extractPdfText = async (pdfData) => {
//     const pdfjsLib = await loadPdfJs();
//     const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
//     let fullText = '';

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const textContent = await page.getTextContent();
//       const pageText = textContent.items.map(item => item.str).join(' ');
//       fullText += pageText + '\n';
//     }

//     return fullText;
//   };

//   const processFile = async () => {
//     if (!file) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const uint8Array = new Uint8Array(arrayBuffer);

//       const text = await extractPdfText(uint8Array);
//       const data = extractInfoFromText(text);

//       setExtractedData(data);
//     } catch (err) {
//       setError(`Erro ao processar PDF: ${err.message}`);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportToJson = () => {
//     if (!extractedData) return;

//     const dataStr = JSON.stringify(extractedData, null, 2);
//     const dataBlob = new Blob([dataStr], { type: 'application/json' });
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'certidao_extraida.json';
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   const DataField = ({ label, value, fieldName }) => (
//     <div className="p-4 bg-gray-50 rounded-lg">
//       <div className="flex items-center justify-between mb-1">
//         <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
//         <button
//           onClick={() => copyToClipboard(value || '', fieldName)}
//           className="p-1.5 hover:bg-gray-200 rounded transition-colors"
//           title="Copiar"
//           disabled={!value}
//         >
//           {copiedField === fieldName ? (
//             <Check className="w-4 h-4 text-green-600" />
//           ) : (
//             <Copy className="w-4 h-4 text-gray-500" />
//           )}
//         </button>
//       </div>
//       <p className="text-lg text-gray-900">{value || 'Não encontrado'}</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-xl shadow-lg p-8">
//           <div className="flex items-center gap-3 mb-6">
//             <FileText className="w-8 h-8 text-indigo-600" />
//             <h1 className="text-3xl font-bold text-gray-800">
//               Extrator de Certidão de Nascimento
//             </h1>
//           </div>

//           <div className="mb-8">
//             <label className="block mb-2 text-sm font-medium text-gray-700">
//               Selecione o arquivo PDF
//             </label>
//             <div className="flex items-center gap-4">
//               <label className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
//                 <Upload className="w-5 h-5 mr-2 text-gray-400" />
//                 <span className="text-gray-600">
//                   {file ? file.name : 'Clique para selecionar um PDF'}
//                 </span>
//                 <input
//                   type="file"
//                   accept="application/pdf"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />
//               </label>

//               <button
//                 onClick={processFile}
//                 disabled={!file || loading}
//                 className="px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
//               >
//                 {loading ? 'Processando...' : 'Extrair Dados'}
//               </button>
//             </div>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//               <p className="text-red-800">{error}</p>
//             </div>
//           )}

//           {extractedData && (
//             <div className="space-y-6">
//               <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//                 <p className="text-green-800 font-medium">Dados extraídos com sucesso!</p>
//               </div>

//               <div className="grid gap-4">
//                 <DataField label="Nome" value={extractedData.nome} fieldName="nome" />

//                 <div className="grid grid-cols-2 gap-4">
//                   <DataField label="Sexo" value={extractedData.sexo} fieldName="sexo" />
//                   <DataField label="CNS" value={extractedData.cns} fieldName="cns" />
//                 </div>

//                 <DataField label="Matrícula" value={extractedData.matricula} fieldName="matricula" />

//                 <div className="grid grid-cols-2 gap-4">
//                   <DataField label="Data do Evento" value={extractedData.dataEvento} fieldName="dataEvento" />
//                   <DataField label="Data do Registro" value={extractedData.dataRegistro} fieldName="dataRegistro" />
//                 </div>

//                 <DataField label="Selo Digital" value={extractedData.selo} fieldName="selo" />
//               </div>

//               <button
//                 onClick={exportToJson}
//                 className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
//               >
//                 <Download className="w-5 h-5" />
//                 Exportar para JSON
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="mt-6 p-4 bg-white rounded-lg shadow">
//           <h2 className="text-sm font-semibold text-gray-700 mb-2">Informações:</h2>
//           <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
//             <li>Este extrator foi desenvolvido para certidões de nascimento brasileiras</li>
//             <li>Suporta apenas arquivos em formato PDF</li>
//             <li>Os dados são processados localmente no seu navegador</li>
//             <li>Você pode exportar os resultados em formato JSON</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useCallback } from "react";

// ── PDF.js loader ─────────────────────────────────────────────────────────────
async function loadPdfJs() {
  if (window._pdfjsLib) return window._pdfjsLib;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  window._pdfjsLib = window.pdfjsLib;
  return window._pdfjsLib;
}

async function extractTextFromPDF(file) {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  return text;
}

// ── Date parsing helpers ──────────────────────────────────────────────────────
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
  const words = str.toLowerCase().replace(/[,\-]/g, " ").trim().split(/\s+/).filter(w => w && w !== "e");
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
  const num = raw.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
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

// Extract a date using nearby Dia/Mês/Ano numeric fields
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

// Clean a captured string
function clean(s) { return s ? s.replace(/\s+/g, " ").trim() : null; }

function parseField(text, ...patterns) {
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return clean(m[1]);
  }
  return null;
}

// ── Field extraction — Nascimento ─────────────────────────────────────────────
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

// ── Field extraction — Óbito ─────────────────────────────────────────────────────
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

// ── Field extraction — Casamento ──────────────────────────────────────────────
function extractCasamento(t) {
  // Split at "2º Cônjuge" to isolate each spouse section
  const split = t.split(/2[°º]\s*C[oô]njuge/i);
  const part1 = split[0];
  const part2 = split[1] || "";

  function spouseName(chunk, label) {
    // "Nome no momento da habilitação" followed by the name
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

  // Names from the header "NOME ATUAL DOS CÔNJUGES" table
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

  // Celebration date — label is long, grab the Dia/Mês/Ano after it
  const celebLabel = "Data da celebra[cç][aã]o do casamento";
  const dataCasamento = extractDateFromLabel(t, celebLabel);

  const dataRegistro =
    extractDateFromLabel(t, "Data de registro do casamento") ||
    extractDateFromLabel(t, "Data de registro");

  const regimeBens = parseField(t,
    /Regime de bens\s+([^\n]+?)(?:\s+Data|\s+Anotaç|$)/i,
  );

  return { conjuge1, conjuge2, dataCasamento, dataRegistro, regimeBens };
}

// ── Main extractor ────────────────────────────────────────────────────────────
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

  const selosAll = [...t.matchAll(/Selo\s+[Dd]igital[:\s]+([A-Za-z0-9\-]+)/g)];
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

// ── UI Components ─────────────────────────────────────────────────────────────
const TIPO_STYLE = {
  Nascimento: { bg: "#dbeafe", color: "#1e40af" },
  Casamento: { bg: "#fef9c3", color: "#854d0e" },
  Óbito: { bg: "#fee2e2", color: "#991b1b" },
};

function Field({ label, value, mono = false, sub }) {
  return (
    <div style={{ background: "#f7f7f6", borderRadius: 8, padding: "11px 14px" }}>
      <p style={{ fontSize: 11, color: "#999", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "#111", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all" }}>
        {value || "—"}
      </p>
      {sub && <p style={{ fontSize: 11, color: "#bbb", margin: "3px 0 0" }}>{sub}</p>}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 2px" }}>
      <div style={{ flex: 1, height: "0.5px", background: "#e5e7eb" }} />
      <span style={{ fontSize: 11, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: "0.5px", background: "#e5e7eb" }} />
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "1.5rem 0" }}>
      <div style={{ width: 18, height: 18, border: "2px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontSize: 13, color: "#999" }}>Lendo PDF localmente…</span>
    </div>
  );
}

const getSexoCasamento = (estadoCivil) => {
  if (!estadoCivil) return "";
  const ec = estadoCivil.toLowerCase();
  if (ec.endsWith('a')) return "Feminino";
  if (ec.endsWith('o')) return "Masculino";
  return "";
};

// ── Main Component ────────────────────────────────────────────────────────────
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
    setLoading(true); setError(null); setData(null); setFileName(file.name);
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

  const onDrop = (e) => { e.preventDefault(); setDrag(false); processFile(e.dataTransfer.files[0]); };
  const reset = () => { setData(null); setError(null); setFileName(null); inputRef.current.click(); };

  const tipoStyle = data ? (TIPO_STYLE[data.tipoRegistro] || TIPO_STYLE.Nascimento) : null;

  // Header name: for marriage use "Cônjuge 1 & Cônjuge 2"
  const headerName = data?.tipoRegistro === "Casamento"
    ? [data.conjuge1?.nomeAtual || data.conjuge1?.nome, data.conjuge2?.nomeAtual || data.conjuge2?.nome].filter(Boolean).join(" & ")
    : (data?.nomeAtual || data?.nome);

  return (
    <div style={{ maxWidth: 620, margin: "2rem auto", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#111" }}>

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 2px" }}>Leitor de Certidões</h2>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
          🔒 Processamento 100% local — nenhum dado é enviado a servidores externos
        </p>
      </div>

      {!data && (
        <div
          onClick={() => !loading && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${drag ? "#6366f1" : "#d1d5db"}`,
            borderRadius: 12, padding: "2.2rem 1.5rem", textAlign: "center",
            cursor: loading ? "default" : "pointer",
            background: drag ? "#f5f3ff" : "#fafafa",
            transition: "border-color 0.15s, background 0.15s",
            marginBottom: 14, userSelect: "none",
          }}
        >
          <div style={{ fontSize: 30, marginBottom: 8 }}>📄</div>
          <p style={{ fontWeight: 500, margin: "0 0 4px", color: drag ? "#6366f1" : "#222" }}>
            {loading ? "Processando…" : "Selecionar certidão em PDF"}
          </p>
          <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
            {loading ? "Extraindo texto do documento" : "Nascimento · Casamento · Óbito"}
          </p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="application/pdf"
        style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) processFile(e.target.files[0]); }} />

      {loading && <Spinner />}

      {error && (
        <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: "#be123c", margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f7f7f6", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: tipoStyle.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 13, color: tipoStyle.color }}>
              <Initials name={headerName} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: 14, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {headerName || "—"}
              </p>
              <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{fileName}</p>
            </div>
            <span style={{ background: tipoStyle.bg, color: tipoStyle.color, fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 500, whiteSpace: "nowrap" }}>
              {data.tipoRegistro}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
            <Field label="Nome da 1ª parte" value={data.tipoRegistro === 'Casamento' ? (data.conjuge1?.nomeAtual || data.conjuge1?.nome) : (data.nomeAtual || data.nome)} />
            <Field label="Sexo da 1ª parte" value={data.tipoRegistro === 'Casamento' ? getSexoCasamento(data.conjuge1?.estadoCivil) : data.sexo} />
            <Field label="Nome da 2ª parte" value={data.tipoRegistro === 'Casamento' ? (data.conjuge2?.nomeAtual || data.conjuge2?.nome) : ''} />
            <Field label="Sexo da 2ª parte" value={data.tipoRegistro === 'Casamento' ? getSexoCasamento(data.conjuge2?.estadoCivil) : ''} />
            <Field label="Matrícula" value={data.matricula} mono />
            <Field label="Selo original" value={data.seloDigital} mono />
            <Field label="Código CNJ da Serventia" value={data.codigoCNS} mono />
            <Field label="Tipo do Registro" value={data.tipoRegistro} />
            <Field label="Data do Evento" value={data.tipoRegistro === 'Casamento' ? data.dataCasamento : data.dataEvento} />
            <Field label="Data do Registro" value={data.dataRegistro} />
          </div>

          <button onClick={reset} style={{ marginTop: 4, padding: "10px 0", background: "transparent", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#555", fontFamily: "inherit" }}>
            ↩ Carregar outra certidão
          </button>

        </div>
      )}
    </div>
  );
}