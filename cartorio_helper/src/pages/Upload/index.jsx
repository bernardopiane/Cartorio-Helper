import { useState } from 'react';
import { Button, Typography } from '@mui/material';
import { Upload as UploadIcon, Trash2, FileSpreadsheet, Download } from 'lucide-react';

function getCodigo(child) {
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

function getRecordData(child, isRCPN) {
  const emolumentosNode = child.getElementsByTagName('Emolumentos')[0];
  const hasEmolumentos = emolumentosNode && (emolumentosNode.getElementsByTagName('ItemEmolumento').length > 0 || emolumentosNode.getAttribute('TipoCobranca') == "CC");

  const getEmolumentoValue = (attributeName) => {
    return hasEmolumentos ? (emolumentosNode.getAttribute(attributeName) || '') : '';
  };

  const formatCurrency = (value) => {
    return value ? value.replace('.', ',') : '';
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

export default function FileUploadTable() {
  const [tableData, setTableData] = useState([]);

  function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function loadData(file) {
    if (!file) return;

    try {
      const fileContent = await readFileContent(file);
      const parser = new DOMParser();
      const doc = parser.parseFromString(fileContent, 'text/xml');

      const isRCPN = doc.getElementsByTagName('CivilPessoasNaturais').length > 0;

      const remessa = doc.getElementsByTagName('Remessa')[0];
      if (!remessa) return;

      const dataArray = Array.from(remessa.children)
        .filter(child => child.hasAttribute('Selo') || child.hasAttribute('CCT'))
        .map(child => getRecordData(child, isRCPN))
        .sort((a, b) => {
          const sa = parseInt(a.selo) || 0;
          const sb = parseInt(b.selo) || 0;
          return sa - sb;
        });

      setTableData(prev => {
        const combined = [...prev, ...dataArray];
        combined.sort((a, b) => {
          const sa = parseInt(a.selo) || 0;
          const sb = parseInt(b.selo) || 0;
          return sa - sb;
        });
        return combined;
      });
    } catch (error) {
      console.error("Error processing file:", error);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) loadData(file);
    e.target.value = '';
  }

  function clearData() {
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

  return (
    <div>
      <div className="mb-6">
        <Typography variant="h4" gutterBottom>Upload de Arquivos</Typography>
        <Typography variant="body2" color="text.secondary">
          Carregue arquivos XML de remessa para processar os registros
        </Typography>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon size={16} />}
        >
          Carregar XML
          <input type="file" accept=".xml" hidden onChange={handleFileChange} />
        </Button>
        {tableData.length > 0 && (
          <>
            <Button
              variant="outlined"
              startIcon={<Download size={16} />}
              onClick={exportCSV}
            >
              Exportar CSV
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={clearData}
            >
              Limpar ({tableData.length} registros)
            </Button>
          </>
        )}
      </div>

      {tableData.length > 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  {COLUMNS.map(({ key, label }) => (
                    <th key={key} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    {COLUMNS.map(({ key }) => (
                      <td key={key} className="px-3 py-2 text-sm text-slate-700 whitespace-nowrap border-b border-slate-100">
                        {row[key] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
            {tableData.length} registro{tableData.length !== 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-xl border-2 border-dashed border-slate-300 bg-white">
          <FileSpreadsheet size={40} className="text-slate-300 mb-4" strokeWidth={1.5} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 0.5 }}>
            Nenhum arquivo carregado
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Clique em &ldquo;Carregar XML&rdquo; para selecionar um arquivo
          </Typography>
        </div>
      )}
    </div>
  );
}
