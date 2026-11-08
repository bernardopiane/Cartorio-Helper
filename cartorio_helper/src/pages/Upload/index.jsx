import { useEffect, useRef, useState } from 'react';
import { Upload as UploadIcon, Trash2, Download, Copy, Check, CircleCheck } from 'lucide-react';
import { loadState, saveState } from '../../utils/storage.js';
import { formatCurrency, parseMoney } from '../../utils/money.js';

// exported for unit testing: this mapping is the remessa ledger's contract
export function getCodigo(child) {
  switch (child.nodeName) {
    case 'RegistroNascimento': return "3001";
    case 'RegistroObito': return "3002";
    case 'RegistroCasamento': return "3004";
    case 'CertidaoNascimento': return "3017";
    case 'CertidaoCRCNacional': return "3017CRC";
    case 'CertidaoObito': return "3017";
    case 'HabilitacaoCasamento': return "3003";
    case 'CertidaoHabilitacaoCasamento': return "3037";
    case 'CertidaoCasamento': return "3017";
    case 'TranscricaoCasamento': return "3007";
    case 'CertidaoGenerica': return "8020";
    case 'AverbacaoCasamento':
    case 'AverbacaoNascimento':
    case 'AverbacaoObito': return "3012";
    default: return '';
  }
}

function getProtocolo(child) {
  return child.getAttribute('NumeroDocumento') || '';
}

export function getRecordData(child, isRCPN) {
  const emolumentosNode = child.getElementsByTagName('Emolumentos')[0];
  const hasEmolumentos = emolumentosNode && (emolumentosNode.getElementsByTagName('ItemEmolumento').length > 0 || emolumentosNode.getAttribute('TipoCobranca') == "CC");

  const getEmolumentoValue = (attributeName) => {
    return hasEmolumentos ? (emolumentosNode.getAttribute(attributeName) || '') : '';
  };

  return {
    selo: child.getAttribute('Selo')?.slice(-5) || '',
    codigo: getCodigo(child),
    rcpn: isRCPN ? 'X' : '',
    rit: isRCPN ? '' : 'X',
    protocolo: getProtocolo(child),
    dataEntrada: '',
    pago: hasEmolumentos ? 'X' : '',
    gratuito: hasEmolumentos ? '' : 'X',
    livro: child.getAttribute('Livro') || '',
    folha: child.getAttribute('Folha') || '',
    termo: child.getAttribute('Termo') || '',
    emolumentos: formatCurrency(getEmolumentoValue('ValorTotalEmolumentos')),
    lei3217: formatCurrency(getEmolumentoValue('FETJ')),
    lei4664: formatCurrency(getEmolumentoValue('FUNDPERJ')),
    lei111: formatCurrency(getEmolumentoValue('FUNPERJ')),
    funarpen: formatCurrency(getEmolumentoValue('FUNARPEN')),
    funpgalerj: formatCurrency(getEmolumentoValue('FUNPGALERJ')),
    funpgt: formatCurrency(getEmolumentoValue('FUNPGT')),
    fundacPguerj: formatCurrency(getEmolumentoValue('FUNDAC_PGUERJ')),
    mutua: formatCurrency(getEmolumentoValue('ValorMutua')),
    acoterj: formatCurrency(getEmolumentoValue('ValorAcoterj')),
    issqn: formatCurrency(getEmolumentoValue('ValorISS')),
    valorDistribuidor: formatCurrency(getEmolumentoValue('ValorDistribuidor')),
    seloEletronico: formatCurrency(getEmolumentoValue('ValorSeloEletronico')),
  };
}

const NUM_COLUMNS = new Set([
  'emolumentos', 'lei3217', 'lei4664', 'lei111', 'funarpen', 'funpgalerj',
  'funpgt', 'fundacPguerj', 'mutua', 'acoterj', 'issqn', 'valorDistribuidor',
  'seloEletronico', 'codigo', 'selo', 'termo',
]);

const COLUMNS = [
  { key: 'selo', label: 'Selo' },
  { key: 'codigo', label: 'Código' },
  { key: 'rcpn', label: 'RCPN' },
  { key: 'rit', label: 'RIT' },
  { key: 'protocolo', label: 'Protocolo' },
  { key: 'dataEntrada', label: 'Data Entrada' },
  { key: 'pago', label: 'Pago' },
  { key: 'gratuito', label: 'Gratuito' },
  { key: 'livro', label: 'Livro' },
  { key: 'folha', label: 'Folha' },
  { key: 'termo', label: 'Termo' },
  { key: 'emolumentos', label: 'Emolumentos' },
  { key: 'lei3217', label: 'Lei 3217' },
  { key: 'lei4664', label: 'Lei 4664' },
  { key: 'lei111', label: 'Lei 111' },
  { key: 'funarpen', label: 'Funarpen' },
  { key: 'funpgalerj', label: 'FUNPGALERJ' },
  { key: 'funpgt', label: 'FUNPGT' },
  { key: 'fundacPguerj', label: 'FUNDAC_PGUERJ' },
  { key: 'mutua', label: 'Mútua' },
  { key: 'acoterj', label: 'Acoterj' },
  { key: 'issqn', label: 'ISSQN' },
  { key: 'valorDistribuidor', label: 'Valor Distribuidor' },
  { key: 'seloEletronico', label: 'Selo Eletrônico' },
];

/* on screen the paid/free X-columns collapse into one status chip (the
 * redesign); CSV export and table copy keep the remessa contract via COLUMNS */
const DISPLAY_COLUMNS = [
  { key: 'selo', label: 'Selo' },
  { key: 'codigo', label: 'Cód. RCPN' },
  { key: 'rcpn', label: 'RCPN' },
  { key: 'rit', label: 'RIT' },
  { key: 'protocolo', label: 'Protocolo' },
  { key: 'dataEntrada', label: 'Data Entrada' },
  { key: 'status', label: 'Status / Tipo' },
  { key: 'livro', label: 'Livro' },
  { key: 'folha', label: 'Folha' },
  { key: 'termo', label: 'Termo' },
  { key: 'emolumentos', label: 'Emolumentos' },
  { key: 'lei3217', label: 'Lei 3217' },
  { key: 'lei4664', label: 'Lei 4664' },
  { key: 'lei111', label: 'Lei 111' },
  { key: 'funarpen', label: 'Funarpen' },
  { key: 'funpgalerj', label: 'FUNPGALERJ' },
  { key: 'funpgt', label: 'FUNPGT' },
  { key: 'fundacPguerj', label: 'FUNDAC_PGUERJ' },
  { key: 'mutua', label: 'Mútua' },
  { key: 'acoterj', label: 'Acoterj' },
  { key: 'issqn', label: 'ISSQN' },
  { key: 'valorDistribuidor', label: 'Valor Distribuidor' },
  { key: 'seloEletronico', label: 'Selo Eletrônico' },
];

export default function FileUploadTable() {
  const fileInputRef = useRef(null);
  const [saved] = useState(() => loadState('upload') || { records: [], files: [] });
  const [tableData, setTableData] = useState(saved.records || []);
  const [fileNames, setFileNames] = useState(saved.files || []);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [armed, setArmed] = useState(false);
  const armTimerRef = useRef(null);
  const armedAtRef = useRef(0);
  const tableDataRef = useRef(null);

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);

  // the ledger keeps its own bookkeeping line: everything the register charged
  const totalEmolumentos = tableData.reduce(
    (sum, row) => sum + parseMoney(row.emolumentos), 0
  );
  const fmtEmolumentos = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(totalEmolumentos);

  // the parse survives refresh: same records, same files, same day
  useEffect(() => {
    if (tableData.length === 0) saveState('upload', null);
    else saveState('upload', { records: tableData, files: fileNames });
  }, [tableData, fileNames]);

  // the armed "limpar" stands down if the confirmation never comes
  useEffect(() => () => clearTimeout(armTimerRef.current), []);

  function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function loadData(file) {
    if (!file || busy) return;

    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      // let the browser paint the busy state before the synchronous parse takes the thread
      await new Promise((resolve) => setTimeout(resolve, 50));
      const fileContent = await readFileContent(file);
      const parser = new DOMParser();
      const doc = parser.parseFromString(fileContent, 'text/xml');

      const isRCPN = doc.getElementsByTagName('CivilPessoasNaturais').length > 0;

      const remessa = doc.getElementsByTagName('Remessa')[0];
      if (!remessa) {
        setError('O arquivo não contém uma remessa. Selecione um XML gerado pelo sistema do cartório.');
        return;
      }

      const dataArray = Array.from(remessa.children)
        .filter(child => child.hasAttribute('Selo') || child.hasAttribute('CCT'))
        .map(child => getRecordData(child, isRCPN))
        .sort((a, b) => {
          const sa = parseInt(a.selo) || 0;
          const sb = parseInt(b.selo) || 0;
          return sa - sb;
        });

      if (dataArray.length === 0) {
        setError('A remessa não contém registros processáveis. Verifique o arquivo e tente novamente.');
        return;
      }

      // loading the same remessa twice must never inflate the sum:
      // dedupe on selo + código and say so, instead of silently doubling
      const registroKey = (r) => `${r.selo}::${r.codigo}`;
      const seen = new Set(tableDataRef.current.map(registroKey));
      const fresh = dataArray.filter((r) => !seen.has(registroKey(r)));
      const repeated = dataArray.length - fresh.length;

      if (fresh.length > 0) {
        setTableData(prev => {
          const combined = [...prev, ...fresh];
          combined.sort((a, b) => {
            const sa = parseInt(a.selo) || 0;
            const sb = parseInt(b.selo) || 0;
            return sa - sb;
          });
          return combined;
        });
        setFileNames(prev => [...new Set([...prev, file.name])]);
      }
      if (repeated > 0) {
        const plural = repeated !== 1 ? 's' : '';
        setInfo(
          `${repeated} registro${plural} desta remessa já estavam na tabela — não foram repetidos.`
        );
      }
    } catch (error) {
      console.error("Error processing file:", error);
      setError('Não foi possível ler o arquivo. Verifique se é um XML de remessa válido.');
    } finally {
      setBusy(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) loadData(file);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadData(file);
  }

  function clearData() {
    // two steps: arm (vermelho), then confirm — a misfired click never wipes the ledger
    if (!armed) {
      setArmed(true);
      armedAtRef.current = Date.now();
      clearTimeout(armTimerRef.current);
      armTimerRef.current = setTimeout(() => setArmed(false), 3000);
      return;
    }
    // the habit double-click lands inside the label repaint — it is not a confirmation
    if (Date.now() - armedAtRef.current < 350) return;
    clearTimeout(armTimerRef.current);
    setArmed(false);
    setTableData([]);
  }

  function exportCSV() {
    if (tableData.length === 0) return;
    const separator = ';';
    const header = COLUMNS.map(c => c.label).join(separator);
    const rows = tableData.map(row =>
      COLUMNS.map(({ key }) => {
        const val = (row[key] ?? '').toString().replace(/"/g, '""');
        return `"${val}"`;
      }).join(separator)
    );
    const bom = '\uFEFF';
    const csv = bom + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registros_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyTableToClipboard() {
    if (tableData.length === 0) return;
    const text = tableData.map(row =>
      COLUMNS.map(({ key }) => row[key] ?? '').join('\t')
    ).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[52ch]">
          <p className="flex items-center gap-2 text-[length:var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-muted)] m-0">
            <CircleCheck size={13} strokeWidth={1.8} aria-hidden="true" className="text-[var(--color-accent)]" />
            Módulo de Validação &amp; Auditoria de Livros
          </p>
          <h1 className="mt-1 text-[var(--color-ink)] text-[length:var(--text-display)]! max-w-none">
            Upload e Processamento de Remessas XML
          </h1>
          <p className="mt-1 text-[length:var(--text-sm)] text-[var(--color-muted)]">
            Carregue arquivos XML de remessa para auditar registros, calcular emolumentos e
            gerar relatórios notariais oficiais.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => fileInputRef.current?.click()}
            aria-busy={busy}
            disabled={busy}
          >
            <UploadIcon size={15} strokeWidth={1.75} aria-hidden="true" />
            {busy ? 'Lendo XML…' : 'Carregar XML de Remessa'}
          </button>
          {tableData.length > 0 && (
            <>
              <button type="button" className="btn" onClick={copyTableToClipboard} aria-live="polite">
                {copied ? <Check size={15} strokeWidth={1.75} aria-hidden="true" className="text-[var(--color-success)]" /> : <Copy size={15} strokeWidth={1.75} aria-hidden="true" />}
                {copied ? 'Copiado!' : 'Copiar Tabela'}
              </button>
              <button type="button" className="btn" onClick={exportCSV}>
                <Download size={15} strokeWidth={1.75} aria-hidden="true" />
                Exportar CSV / Excel
              </button>
              <button
                type="button"
                className={`btn btn--danger${armed ? ' btn--armed' : ''}`}
                onClick={clearData}
                aria-live="polite"
              >
                <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
                {armed ? 'Confirmar limpar?' : `Limpar (${tableData.length} registros)`}
              </button>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        className="absolute w-px h-px overflow-hidden whitespace-nowrap"
        onChange={handleFileChange}
        aria-label="Selecionar arquivo XML"
        tabIndex={-1}
      />

      {info && (
        <p className="notice notice--quiet mt-4" role="status">{info}</p>
      )}
      {error && (
        <p className="notice mt-4" role="alert">{error}</p>
      )}

      {tableData.length > 0 ? (
        <section className="sheet" aria-label="Registros da remessa">
          <div className="table-scroll">
            <table className="ledger">
              <thead>
                <tr>
                  {DISPLAY_COLUMNS.map(({ key, label }) => (
                    <th key={key} scope="col" className={NUM_COLUMNS.has(key) ? 'num' : undefined}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i}>
                    {DISPLAY_COLUMNS.map(({ key }) => {
                      if (key === 'status') {
                        const pago = row.pago === 'X';
                        return (
                          <td key={key}>
                            <span className={`pill ${pago ? 'pill--error' : 'pill--info'}`}>
                              {pago ? 'Pago' : 'Gratuito'}
                            </span>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={key}
                          className={
                            NUM_COLUMNS.has(key)
                              ? `num ${key === 'selo' ? '!text-[var(--color-accent)] font-semibold' : ''}`
                              : undefined
                          }
                        >
                          {row[key] ?? ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sheet-foot sheet-foot--split">
            <span>
              <span className="num">{tableData.length}</span> registro{tableData.length !== 1 ? 's' : ''}
              {fileNames.length > 0 && (
                <span className="text-[var(--color-muted)]"> · {fileNames.join(', ')}</span>
              )}
            </span>
            <span className="num">Σ emolumentos {fmtEmolumentos}</span>
          </div>
        </section>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Selecionar arquivo XML de remessa"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          className={`dropzone cursor-pointer ${drag ? 'dropzone--drag' : ''}`}
        >
          <span
            aria-hidden="true"
            className="w-12 h-12 grid place-items-center rounded-xl bg-[color-mix(in_oklab,var(--color-accent)_9%,var(--color-sheet))]"
          >
            <UploadIcon size={22} strokeWidth={1.6} className="text-[var(--color-accent)]" />
          </span>
          <p className="font-[var(--font-display)] font-semibold text-[var(--color-ink)] text-[length:var(--text-md)] m-0 mt-1">
            Selecionar arquivo XML de remessa
          </p>
          <p className="m-0 text-[length:var(--text-sm)] text-[var(--color-muted)]">
            Arraste o XML aqui ou clique para selecionar
          </p>
        </div>
      )}
    </div>
  );
}
