import { useState } from 'react';
import { Button, Typography, TextField } from '@mui/material';
import { Wand2 } from 'lucide-react';

export default function TextFormatter() {
  const [corpo, setCorpo] = useState('');
  const [matricula, setMatricula] = useState('');

  const formatText = () => {
    const formattedCorpo = corpo.replace(/\n/g, ' ').replace(/\s\s/g, ' ').replace(/"/g, "'");
    const formattedMatricula = matricula
      .replace(/\n/g, '')
      .replace(/\s\s/g, '')
      .replace(/"/g, "'")
      .replace(/\./g, '')
      .replace(/-/g, '');
    setCorpo(formattedCorpo);
    setMatricula(formattedMatricula);
  };

  return (
    <div>
      <div className="mb-6">
        <Typography variant="h4" gutterBottom>Formatador de Texto</Typography>
        <Typography variant="body2" color="text.secondary">
          Remova quebras de linha, espaços duplos e caracteres especiais
        </Typography>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 space-y-4">
        <TextField
          fullWidth
          label="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          placeholder="Digite a matrícula aqui..."
          size="small"
        />

        <TextField
          fullWidth
          label="Texto"
          value={corpo}
          onChange={(e) => setCorpo(e.target.value)}
          placeholder="Digite o texto aqui..."
          multiline
          rows={5}
          size="small"
        />

        <div className="flex justify-end pt-2">
          <Button
            variant="contained"
            startIcon={<Wand2 size={16} />}
            onClick={formatText}
          >
            Formatar
          </Button>
        </div>
      </div>
    </div>
  );
}
