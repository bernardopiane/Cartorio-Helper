import React from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

function FileUploadTable({ data, setData }) {
  const [file, setFile] = React.useState(null);

  function handleFileChange(e) {
    if (!e.target.files[0]) return;
    setFile(e.target.files[0]);
  }

  function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  }

  async function loadData(file) {
    if (!file) return;

    try {
      const fileContent = await readFileContent(file);
      const parser = new DOMParser();
      const doc = parser.parseFromString(fileContent, 'text/xml');

      // Determine document type
      const isRCPN = doc.getElementsByTagName('CivilPessoasNaturais').length > 0;
      if (isRCPN) {
        console.log("Document type: RCPN");
      }

      // Get all records with seals from the Remessa node
      const remessa = doc.getElementsByTagName('Remessa')[0];
      if (!remessa) {
        console.error("No Remessa node found in XML");
        return;
      }

      const dataArray = Array.from(remessa.children)
        .filter(child => child.hasAttribute('Selo'))
        .map(child => getRecordData(child, isRCPN));

      console.log("Processed records:", dataArray.length);
      updateData(dataArray);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  }

  function getRecordData(child, isRCPN) {
    // Get Emolumentos node once to avoid repetitive DOM access
    const emolumentosNode = child.getElementsByTagName('Emolumentos')[0];
    const hasEmolumentos = emolumentosNode && (emolumentosNode.getElementsByTagName('ItemEmolumento').length > 0 || emolumentosNode.getAttribute('TipoCobranca') == "CC");

    // Helper function to get attribute value safely
    const getEmolumentoValue = (attributeName) => {
      return hasEmolumentos ? (emolumentosNode.getAttribute(attributeName) || '') : '';
    };

    return {
      selo: child.getAttribute('Selo')?.slice(-5) || '', // Only gets the last 5 digits
      codigo: getCodigo(child),
      rcpn: isRCPN ? 'X' : '',
      rit: isRCPN ? '' : 'X',
      protocolo: getProtocolo(child),
      dataEntrada: '', // Cannot be extracted from the XML
      pago: hasEmolumentos ? 'X' : '',
      gratuito: hasEmolumentos ? '' : 'X',
      livro: child.getAttribute('Livro') || '',
      folha: child.getAttribute('Folha') || '',
      termo: child.getAttribute('Termo') || '',
      emolumentos: getEmolumentoValue('ValorTotalEmolumentos') || '',
      lei3217: getEmolumentoValue('FETJ') || '',
      lei4664: getEmolumentoValue('FUNDPERJ') || '',
      lei111: getEmolumentoValue('FUNPERJ') || '',
      funarpen: getEmolumentoValue('FUNARPEN') || '',
      mutua: getEmolumentoValue('ValorMutua') || '',
      acoterj: getEmolumentoValue('ValorAcoterj') || '',
      issqn: getEmolumentoValue('ValorISS') || '',
      seloEletronico: getEmolumentoValue('ValorSeloEletronico') || '',
    };
  }

  function getCodigo(child) {
    switch (child.nodeName) {
      case 'RegistroNascimento':
        return "3001";
      case 'RegistroObito':
        return "3002";
      case 'RegistroCasamento':
        return "3004";
      case 'CertidaoNascimento':
        return "3017";
      case 'CertidaoCRCNacional':
        return "3017CRC";
      case 'CertidaoObito':
        return "3017";
      case 'HabilitacaoCasamento':
        return "3003";
      case 'CertidaoHabilitacaoCasamento':
        return "3037";
      case 'CertidaoCasamento':
        return "3017";
      case 'TranscricaoCasamento':
        return "3007";
      case 'CertidaoGenerica':
        return "8020";
      default:
        return '';
    }
  }

  function getProtocolo(child) {
    // If child has a NumeroDocumento, return it
    if (child.getAttribute('NumeroDocumento')) {
      return child.getAttribute('NumeroDocumento');
    }
    return '';
  }

  function updateData(dataArray) {
    // Filter out any records that are already in the data array
    const newData = dataArray.filter(record => !data.some(item => item.selo === record.selo));
    setData([...data, ...newData]);
  }

  return (
    <div>
      {/* File upload section */}
      <div className="file-upload-section p-4 mb-4 border rounded bg-gray-50">
        <h2 className="mb-3">Importar Arquivo XML</h2>
        <div className="flex items-center gap-3">
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            className="p-2 border rounded"
          />
          <Button
            onClick={() => loadData(file)}
            icon="pi pi-upload"
            label="Carregar"
            disabled={!file}
          />
        </div>
      </div>

      {/* Data table */}
      <div className="data-table-container mt-4">
        <h2 className="mb-3">Dados Importados</h2>
        <DataTable
          value={data}
          tableStyle={{ minWidth: '50rem' }}
          emptyMessage="Nenhum dado carregado"
          className="p-datatable-sm"
        >
          <Column field="selo" header="Selo" sortable />
          <Column field="codigo" header="Código" />
          <Column field="rcpn" header="RCPN" />
          <Column field="rit" header="RIT" />
          <Column field="protocolo" header="Protocolo" />
          <Column field="dataEntrada" header="Data de Entrada" />
          <Column field="pago" header="Pago" />
          <Column field="gratuito" header="Gratuito" />
          <Column field="livro" header="Livro" />
          <Column field="folha" header="Folha" />
          <Column field="termo" header="Termo" />
          <Column field="emolumentos" header="Emolumentos" />
          <Column field="lei3217" header="Lei 3217" />
          <Column field="lei4664" header="Lei 4664" />
          <Column field="lei111" header="Lei 111" />
          <Column field="funarpen" header="Funarpen" />
          <Column field="mutua" header="Mutua" />
          <Column field="acoterj" header="Acoterj" />
          <Column field="issqn" header="ISSQN" />
          <Column field="seloEletronico" header="Selo Eletrônico" />
        </DataTable>
      </div>
    </div>
  );
}

export default FileUploadTable;
