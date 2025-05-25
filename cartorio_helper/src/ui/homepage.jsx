import React from 'react';
import { Button } from 'primereact/button';
import FileUploadTable from './components/FileUploadTable';
import TextFormatter from './components/TextFormatter';
import ConsultaCRM from './components/ConsultaCRM';

function Homepage() {
  const [data, setData] = React.useState([]);
  const [crm, setCRM] = React.useState('');
  const [captcha, setCaptcha] = React.useState('');
  const [captchaImage, setCaptchaImage] = React.useState('');

  function searchCRM() {
    console.log("Buscando CRMERJ");
    let crm = document.getElementById('crm').value;
    console.log(crm);

    // Use Vite's proxy configuration
    fetch('/api/pesquisar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `numero=${encodeURIComponent(crm)}`
    })
      .then(response => response.text())
      .then(data => {
        console.log("data: ", data);
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const captcha = doc.querySelector('img[src*="Captcha"]').src;
        console.log("captcha: ", captcha);

      })
      .then(async () => {
        const response2 = await fetch("/api/pesquisar", {
          "credentials": "include",
          "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/x-www-form-urlencoded",
            "Upgrade-Insecure-Requests": "1",
            "Priority": "u=0, i",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
          },
          "referrer": "http://www.transparencia.cremerj.org.br:8098/planejamento/registroMedico/pesquisar",
          "body": `pesquisa=${crm}&captcha=${captcha}`,
          "method": "POST",
          "mode": "cors"
        });

        const doc2 = await response2.text();
        console.log("doc2: ", doc2);

      })
      .then(() => {
        // Parse the doc2 to get the doctor information
        const parser = new DOMParser();
        const doc2 = parser.parseFromString(doc2, 'text/html');
        // TODO: Get the doctor information from the doc2
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }

  return (
    <div>
      <h1>Homepage</h1>

      <FileUploadTable data={data} setData={setData} />

      <TextFormatter />

      {/* Consulta CRMERJ Section */}
      <ConsultaCRM />
    </div>
  );
}

export default Homepage;