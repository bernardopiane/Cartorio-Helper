import React, { useState } from 'react';
import { FileText, Upload, Download, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';

// Nota: Este componente usa pdf.js via CDN
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function CertidaoExtractor() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const extractInfoFromText = (text) => {
    const data = {
      nome: '',
      sexo: '',
      cns: '',
      selo: '',
      matricula: '',
      dataRegistro: '',
      dataEvento: ''
    };

    // Nome - procura após "Nome" e antes de "Número do CPF" ou "Matrícula"
    const nomeMatch = text.match(/Nome\s+([\s\S]+?)(?:Número do CPF|Matrícula)/i);
    if (nomeMatch) {
      data.nome = nomeMatch[1].trim().replace(/\s+/g, ' ');
    }

    // Sexo
    const sexoMatch = text.match(/Sexo\s+(feminino|masculino)/i);
    if (sexoMatch) {
      data.sexo = sexoMatch[1].trim();
    }

    // CNS
    const cnsMatch = text.match(/CNS\s*N[ºo°]?\s*(\d+)/i);
    if (cnsMatch) {
      data.cns = cnsMatch[1].trim();
    }

    // Selo Digital (último selo mencionado)
    const seloMatches = text.match(/Selo [Dd]igital:\s*([A-Za-z0-9]+)/g);
    if (seloMatches && seloMatches.length > 0) {
      const ultimoSelo = seloMatches[seloMatches.length - 1];
      const seloMatch = ultimoSelo.match(/Selo [Dd]igital:\s*([A-Za-z0-9]+)/);
      if (seloMatch) {
        data.selo = seloMatch[1].trim();
      }
    }

    // Matrícula
    const matriculaMatch = text.match(/Matrícula\s+([\d\s]+)/);
    if (matriculaMatch) {
      data.matricula = matriculaMatch[1].trim().replace(/\s+/g, ' ');
    }

    // Data de registro - procura o texto por extenso
    const dataRegistroMatch = text.match(/Data de registro\s+([\s\S]+?)(?:DNV|Dia)/i);
    if (dataRegistroMatch) {
      const dataTexto = dataRegistroMatch[1].trim();
      // Tenta converter para formato DD/MM/YYYY
      const dataConvertida = converterDataExtenso(dataTexto);
      data.dataRegistro = dataConvertida || dataTexto;
    }

    // Data do evento (nascimento) - procura por "Data de nascimento"
    const dataEventoMatch = text.match(/Data de nascimento\s+([\s\S]+?)(?:Dia)/i);
    if (dataEventoMatch) {
      const dataTexto = dataEventoMatch[1].trim();
      const dataConvertida = converterDataExtenso(dataTexto);
      data.dataEvento = dataConvertida || dataTexto;
    }

    // Também tenta pegar as datas nos campos Dia/Mês/Ano
    const diaMatch = text.match(/Dia\s+(\d{2})/);
    const mesMatch = text.match(/Mês\s+(\d{2})/);
    const anoMatch = text.match(/Ano\s+(\d{4})/);
    
    if (diaMatch && mesMatch && anoMatch && !data.dataEvento) {
      data.dataEvento = `${diaMatch[1]}/${mesMatch[1]}/${anoMatch[1]}`;
    }

    return data;
  };

  const converterDataExtenso = (dataTexto) => {
    const meses = {
      'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
      'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
      'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    };

    // Padrão: "nove de agosto de um mil e novecentos e cinquenta e dois"
    const match = dataTexto.match(/(\w+)\s+de\s+(\w+)\s+de\s+(.*)/i);
    if (match) {
      const dia = converterNumeroExtenso(match[1]);
      const mes = meses[match[2].toLowerCase()];
      const ano = converterAnoExtenso(match[3]);
      
      if (dia && mes && ano) {
        return `${dia.padStart(2, '0')}/${mes}/${ano}`;
      }
    }

    return null;
  };

  const converterNumeroExtenso = (texto) => {
    const numeros = {
      'um': '1', 'dois': '2', 'três': '3', 'quatro': '4', 'cinco': '5',
      'seis': '6', 'sete': '7', 'oito': '8', 'nove': '9', 'dez': '10',
      'onze': '11', 'doze': '12', 'treze': '13', 'quatorze': '14', 'quinze': '15',
      'dezesseis': '16', 'dezessete': '17', 'dezoito': '18', 'dezenove': '19',
      'vinte': '20', 'trinta': '30', 'tinta': '30'
    };
    
    const textoLower = texto.toLowerCase().trim();
    
    // Número simples
    if (numeros[textoLower]) {
      return numeros[textoLower];
    }
    
    // Número composto (ex: vinte e um)
    const partes = textoLower.split(/\s+e\s+/);
    if (partes.length === 2 && numeros[partes[0]] && numeros[partes[1]]) {
      return String(parseInt(numeros[partes[0]]) + parseInt(numeros[partes[1]]));
    }
    
    return null;
  };

  const converterAnoExtenso = (texto) => {
    // Padrão: "um mil e novecentos e cinquenta e dois" = 1952
    const textoLower = texto.toLowerCase().trim();
    
    // Procura por "mil e" seguido do resto
    const match = textoLower.match(/mil\s+e\s+(.*)/);
    if (!match) return null;
    
    const centenas = {
      'novecentos': 900,
      'oitocentos': 800,
      'setecentos': 700,
      'seiscentos': 600
    };
    
    const resto = match[1].trim();
    let ano = 1000;
    
    // Procura pela centena
    for (const [palavra, valor] of Object.entries(centenas)) {
      if (resto.includes(palavra)) {
        ano += valor;
        
        // Pega tudo depois da centena
        const indexCentena = resto.indexOf(palavra);
        const depoisCentena = resto.substring(indexCentena + palavra.length).trim();
        
        // Remove "e" do início se existir
        const parteRestante = depoisCentena.replace(/^e\s+/, '').trim();
        
        if (parteRestante) {
          const dezenas = converterDezenas(parteRestante);
          if (dezenas) {
            ano += dezenas;
          }
        }
        break;
      }
    }
    
    return String(ano);
  };

  const converterDezenas = (texto) => {
    const numeros = {
      'noventa': 90, 'oitenta': 80, 'setenta': 70, 'sessenta': 60, 'cinquenta': 50,
      'quarenta': 40, 'trinta': 30, 'vinte': 20, 'dez': 10,
      'dezenove': 19, 'dezoito': 18, 'dezessete': 17, 'dezesseis': 16,
      'quinze': 15, 'quatorze': 14, 'treze': 13, 'doze': 12, 'onze': 11,
      'nove': 9, 'oito': 8, 'sete': 7, 'seis': 6, 'cinco': 5,
      'quatro': 4, 'três': 3, 'dois': 2, 'um': 1, 'uma': 1
    };
    
    let total = 0;
    const textoLimpo = texto.toLowerCase().trim();
    
    // Remove todos os "e" e divide em palavras
    const palavras = textoLimpo.split(/\s+/);
    
    for (const palavra of palavras) {
      const palavraTrimmed = palavra.trim();
      // Ignora a palavra "e"
      if (palavraTrimmed === 'e') continue;
      
      if (numeros[palavraTrimmed]) {
        total += numeros[palavraTrimmed];
      }
    }
    
    return total > 0 ? total : null;
  };

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setExtractedData(null);
  };

  const extractPdfText = async (pdfData) => {
    const pdfjsLib = await loadPdfJs();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const processFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const text = await extractPdfText(uint8Array);
      const data = extractInfoFromText(text);
      
      setExtractedData(data);
    } catch (err) {
      setError(`Erro ao processar PDF: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToJson = () => {
    if (!extractedData) return;
    
    const dataStr = JSON.stringify(extractedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certidao_extraida.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const DataField = ({ label, value, fieldName }) => (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
        <button
          onClick={() => copyToClipboard(value || '', fieldName)}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
          title="Copiar"
          disabled={!value}
        >
          {copiedField === fieldName ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
      <p className="text-lg text-gray-900">{value || 'Não encontrado'}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Extrator de Certidão de Nascimento
            </h1>
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Selecione o arquivo PDF
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                <Upload className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-gray-600">
                  {file ? file.name : 'Clique para selecionar um PDF'}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={processFile}
                disabled={!file || loading}
                className="px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Processando...' : 'Extrair Dados'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {extractedData && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">Dados extraídos com sucesso!</p>
              </div>

              <div className="grid gap-4">
                <DataField label="Nome" value={extractedData.nome} fieldName="nome" />

                <div className="grid grid-cols-2 gap-4">
                  <DataField label="Sexo" value={extractedData.sexo} fieldName="sexo" />
                  <DataField label="CNS" value={extractedData.cns} fieldName="cns" />
                </div>

                <DataField label="Matrícula" value={extractedData.matricula} fieldName="matricula" />

                <div className="grid grid-cols-2 gap-4">
                  <DataField label="Data do Evento" value={extractedData.dataEvento} fieldName="dataEvento" />
                  <DataField label="Data do Registro" value={extractedData.dataRegistro} fieldName="dataRegistro" />
                </div>

                <DataField label="Selo Digital" value={extractedData.selo} fieldName="selo" />
              </div>

              <button
                onClick={exportToJson}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Exportar para JSON
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Informações:</h2>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Este extrator foi desenvolvido para certidões de nascimento brasileiras</li>
            <li>Suporta apenas arquivos em formato PDF</li>
            <li>Os dados são processados localmente no seu navegador</li>
            <li>Você pode exportar os resultados em formato JSON</li>
          </ul>
        </div>
      </div>
    </div>
  );
}