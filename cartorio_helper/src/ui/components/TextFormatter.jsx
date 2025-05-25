import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

function TextFormatter() {
  const [corpo, setCorpo] = React.useState('');
  const [matricula, setMatricula] = React.useState('');

  function formatText() {
    console.log("Formatando texto");
    let corpoValue = document.getElementById('corpo').value;
    let matriculaValue = document.getElementById('matricula').value;

    // Removes all break lines
    corpoValue = corpoValue.replace(/\n/g, '');
    matriculaValue = matriculaValue.replace(/\n/g, '');

    // Replaces double quotes with single quotes
    corpoValue = corpoValue.replace(/"/g, "'");
    matriculaValue = matriculaValue.replace(/"/g, "'");

    // Remove all dots
    matriculaValue = matriculaValue.replace(/\./g, '');

    // Updates the input fields
    setCorpo(corpoValue);
    console.log(corpoValue);
    setMatricula(matriculaValue);
    console.log(matriculaValue);
  }

  return (
    <div id="text-formatting" className="p-4 mt-4 border rounded">
      <h2 className="mb-3">Formatação de Texto</h2>

      <div className="field mb-3">
        <label htmlFor="matricula" className="block mb-2">Matrícula:</label>
        <InputText
          id="matricula"
          onChange={(e) => setMatricula(e.target.value)}
          value={matricula}
          className="w-full"
          placeholder="Digite a matrícula aqui"
        />
      </div>

      <div className="field mb-3">
        <label htmlFor="corpo" className="block mb-2">Corpo:</label>
        <InputTextarea
          id="corpo"
          onChange={(e) => setCorpo(e.target.value)}
          value={corpo}
          className="w-full"
          rows={5}
          placeholder="Digite o texto a ser formatado"
        />
      </div>

      <Button
        onClick={() => formatText()}
        className="mt-2"
        icon="pi pi-check"
        label="Formatar Texto"
      />
    </div>
  );
}

export default TextFormatter;
