import React from 'react';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import styles from './TextFormatter.module.css';

function TextFormatter() {
  const [corpo, setCorpo] = React.useState('');
  const [matricula, setMatricula] = React.useState('');

  const formatText = () => {
    // Remove all break lines
    const formattedCorpo = corpo.replace(/\n/g, '');
    const formattedMatricula = matricula.replace(/\n/g, '');

    // Replace double quotes with single quotes
    const finalCorpo = formattedCorpo.replace(/"/g, "'");
    const finalMatricula = formattedMatricula.replace(/"/g, "'");

    // Remove all dots from matricula
    const cleanMatricula = finalMatricula.replace(/\./g, '');
    // Remove all - from matricula
    const cleanMatricula2 = cleanMatricula.replace(/-/g, '');

    // Update state
    setCorpo(finalCorpo);
    setMatricula(cleanMatricula2);
  };

  return (
    <div className={styles.textFormatterContainer}>
      <Card title="Formatador de Texto">
        <div className={styles.inputsContainer}>
          <div className={styles.inputGroup}>
            <label htmlFor="matricula">Matrícula:</label>
            <InputText 
              id="matricula" 
              value={matricula} 
              onChange={(e) => setMatricula(e.target.value)} 
              placeholder="Digite a matrícula aqui..."
              className={styles.templateField}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="corpo">Texto:</label>
            <InputTextarea 
              id="corpo" 
              value={corpo} 
              onChange={(e) => setCorpo(e.target.value)} 
              placeholder="Digite o texto aqui..." 
              rows="5" 
              className={styles.templateField}
            />
          </div>
        </div>
        <Button 
          label="Formatar" 
          onClick={formatText}
          className={styles.formatButton}
        />
      </Card>
    </div>
  );
}

export default TextFormatter;
