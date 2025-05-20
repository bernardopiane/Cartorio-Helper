import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

function Homepage() {
  const [data, setData] = React.useState([]);
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
    var tempData = [];
    if (!file) return;

    try {
      tempData = await readFileContent(file);
    } catch (error) {
      console.error("Error reading file:", error);
      return;
    } finally {
      // Parse the XML file
      const parser = new DOMParser();
      const doc = parser.parseFromString(tempData, 'text/xml');

      // Get the data from the XML file
      // Iterate through all the children from the Remessa node
      const remessa = doc.getElementsByTagName('Remessa')[0];
      const children = remessa.children;

      console.log(children);
      // Create a data array to hold the extracted information
      const dataArray = [];

      // Iterate through children elements
      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        // Extract common attributes that might be present in different certificate types
        if (child.hasAttribute('Selo')) {
          const recordData = getRecordData(child);

          console.log(recordData);

          dataArray.push(recordData);
        }
      }

      setData(dataArray);

    }
  }

  function getRecordData(child) {
    const recordData = {
      selo: child.getAttribute('Selo'),
      codigo: getCodigo(child),
      aleatorio: child.getAttribute('Aleatorio') || '',
      livro: child.getAttribute('Livro'),
      folha: child.getAttribute('Folha'),
      termo: child.getAttribute('Termo'),
      tipo: child.nodeName,
    };

    return recordData;
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
      default:
        return '';
    }
  }

  return (
    <div>
      <h1>Homepage</h1>

      {/* File picker */}
      <input id="fileInput" type="file" onChange={handleFileChange} />
      <button onClick={() => loadData(file)}>Carregar</button>

      <DataTable value={data} tableStyle={{ minWidth: '50rem' }}>
        <Column field="selo" header="Selo" sortable ></Column>
        <Column field="codigo" header="Código" sortable ></Column>
        <Column field="rcpn" header="RCPN" sortable ></Column>
        <Column field="rit" header="RIT" sortable ></Column>
        <Column field="protocolo" header="Protocolo" sortable ></Column>
        <Column field="dataEntrada" header="Data de Entrada" sortable ></Column>
        <Column field="pago" header="Pago" sortable ></Column>
        <Column field="gratuito" header="Gratuito" sortable ></Column>
        <Column field="livro" header="Livro" sortable ></Column>
        <Column field="folha" header="Folha" sortable ></Column>
        <Column field="termo" header="Termo" sortable ></Column>
        <Column field="emolumentos" header="Emolumentos" sortable ></Column>
        <Column field="lei3217" header="Lei 3217" sortable ></Column>
        <Column field="lei4664" header="Lei 4664" sortable ></Column>
        <Column field="lei111" header="Lei 111" sortable ></Column>
        <Column field="funarpen" header="Funarpen" sortable ></Column>
        <Column field="mutua" header="Mutua" sortable ></Column>
        <Column field="acoterj" header="Acoterj" sortable ></Column>
        <Column field="issqn" header="ISSQN" sortable ></Column>
        <Column field="fiscalização" header="Fiscalização" sortable ></Column>
      </DataTable>
    </div>
  );
}

export default Homepage;  