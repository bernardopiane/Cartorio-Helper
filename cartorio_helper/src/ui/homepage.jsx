import React from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

function Homepage() {
  const [data, setData] = React.useState([]);
  const [file, setFile] = React.useState(null);
  const [corpo, setCorpo] = React.useState('');
  const [matricula, setMatricula] = React.useState('');

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
    const hasEmolumentos = emolumentosNode && emolumentosNode.getElementsByTagName('ItemEmolumento').length > 0;

    // Helper function to get attribute value safely
    const getEmolumentoValue = (attributeName) => {
      return hasEmolumentos ? (emolumentosNode.getAttribute(attributeName) || '') : '';
    };

    return {
      selo: child.getAttribute('Selo')?.slice(-5) || '', // Only gets the last 5 digits
      codigo: getCodigo(child),
      rcpn: isRCPN ? 'X' : '',
      rit: isRCPN ? '' : 'X',
      protocolo: '', // Cannot be extracted from the XML
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

      // InterdicoesTutelas
      case 'CertidaoGenerica':
        return "8020";
      default:
        return '';
    }
  }

  function formatText() {
    console.log("Formatando texto");
    let corpo = document.getElementById('corpo').value;
    let matricula = document.getElementById('matricula').value;

    // Removes all break lines
    corpo = corpo.replace(/\n/g, '');
    matricula = matricula.replace(/\n/g, '');

    // Replaces double quotes with single quotes
    corpo = corpo.replace(/"/g, "'");
    matricula = matricula.replace(/"/g, "'");

    // Remove all dots
    matricula = matricula.replace(/\./g, '');

    // Updates the input fields
    setCorpo(corpo);
    console.log(corpo);
    setMatricula(matricula);
    console.log(matricula);
  }

  function updateData(dataArray) {
    // Filter out any records that are already in the data array
    const newData = dataArray.filter(record => !data.some(item => item.selo === record.selo));

    setData([...data, ...newData]);
  }

  return (
    <div>
      <h1>Homepage</h1>

      {/* File picker */}
      <input id="fileInput" type="file" onChange={handleFileChange} />
      <Button onClick={() => loadData(file)}>Carregar</Button>

      <DataTable value={data} tableStyle={{ minWidth: '50rem' }}>
        <Column field="selo" header="Selo" sortable ></Column>
        <Column field="codigo" header="Código" ></Column>
        <Column field="rcpn" header="RCPN" ></Column>
        <Column field="rit" header="RIT" ></Column>
        <Column field="protocolo" header="Protocolo" ></Column>
        <Column field="dataEntrada" header="Data de Entrada" ></Column>
        <Column field="pago" header="Pago" ></Column>
        <Column field="gratuito" header="Gratuito" ></Column>
        <Column field="livro" header="Livro" ></Column>
        <Column field="folha" header="Folha" ></Column>
        <Column field="termo" header="Termo" ></Column>
        <Column field="emolumentos" header="Emolumentos" ></Column>
        <Column field="lei3217" header="Lei 3217" ></Column>
        <Column field="lei4664" header="Lei 4664" ></Column>
        <Column field="lei111" header="Lei 111"  ></Column>
        <Column field="funarpen" header="Funarpen"  ></Column>
        <Column field="mutua" header="Mutua"  ></Column>
        <Column field="acoterj" header="Acoterj"  ></Column>
        <Column field="issqn" header="ISSQN"  ></Column>
        <Column field="fiscalização" header="Fiscalização"  ></Column>
      </DataTable>

      {/* Text Formating */}
      <div id="text-formating">
        <h2>Formatação de Texto</h2>

        <div>
          <label htmlFor="matricula">Matrícula:</label>
          <InputText id="matricula" onChange={(e) => setMatricula(e.target.value)} value={matricula} />
        </div>

        <div>
          <label htmlFor="corpo">Corpo:</label>
          <InputTextarea id="corpo" onChange={(e) => setCorpo(e.target.value)} value={corpo} />
        </div>

        <Button onClick={() => formatText()}>Formatar</Button>
      </div>
    </div>
  );
}

export default Homepage;  