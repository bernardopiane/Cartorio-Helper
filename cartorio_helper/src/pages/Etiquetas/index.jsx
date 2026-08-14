import { useState } from 'react';
import { Button, Typography, TextField, Checkbox, FormControlLabel, Snackbar, Alert } from '@mui/material';
import { Copy, Check } from 'lucide-react';
import { InputMask } from 'primereact/inputmask';

export default function Etiquetas() {
  const [cpf1, setCpf1] = useState('');
  const [nome1, setNome1] = useState('');
  const [cpf2, setCpf2] = useState('');
  const [nome2, setNome2] = useState('');
  const [processo, setProcesso] = useState('');
  const [selo, setSelo] = useState('');
  const [livro, setLivro] = useState('');
  const [folha, setFolha] = useState('');
  const [termos, setTermos] = useState('');
  const [motivo, setMotivo] = useState('');
  const [naoAverbacao, setNaoAverbacao] = useState(false);

  const data = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const generateTemplate = () => {
    let template = `AVERBAÇÃO: Livro ${livro}, Folha ${folha}, Termo ${termos}.`;

    if (naoAverbacao) {
      template += `\n\nNão foi possível averbar o CPF do(a) registrado(a), pois ${motivo}`;
    } else {
      template += `\n\nAverbo, nos termos do art. 477, §3º, do Provimento nº 149, de 30 de agosto de 2023, com a redação dada pelo Provimento nº 182, de 17 de setembro de 2024, do Conselho Nacional de Justiça, para que passe a constar do registro que o número do CPF de ${nome1} é ${cpf1}`;

      if (cpf2 && nome2) {
        template += ` e que o número do CPF de ${nome2} é ${cpf2}`;
      }

      template += `, tudo conforme comprovantes da Receita Federal, obtido através de consulta feita na base dados do CRC Nacional. Dou fé. Nova Friburgo, ${data}.`;
      template += `\n\nIsento - Processo nº ${processo}`;
      template += `\nSelo Eletrônico: ${selo}`;
    }

    return template;
  };

  const inputText = generateTemplate();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const fieldSx = { '& .MuiOutlinedInput-root': { fontSize: '0.875rem' } };

  return (
    <div>
      <div className="mb-6">
        <Typography variant="h4" gutterBottom>Gerador de Etiquetas</Typography>
        <Typography variant="body2" color="text.secondary">
          Gere o texto de averbação de CPF para registros civis
        </Typography>
      </div>

      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField fullWidth label="Processo" value={processo} onChange={(e) => setProcesso(e.target.value)} placeholder="Número do processo" size="small" sx={fieldSx} />
          <TextField fullWidth label="Selo Eletrônico" value={selo} onChange={(e) => setSelo(e.target.value)} placeholder="Número do selo" size="small" sx={fieldSx} />
        </div>

        <div>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>Localização no Livro</Typography>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField fullWidth label="Livro" value={livro} onChange={(e) => setLivro(e.target.value)} placeholder="Número do livro" size="small" sx={fieldSx} />
            <TextField fullWidth label="Folha" value={folha} onChange={(e) => setFolha(e.target.value)} placeholder="Número da folha" size="small" sx={fieldSx} />
            <TextField fullWidth label="Termo" value={termos} onChange={(e) => setTermos(e.target.value)} placeholder="Número do termo" size="small" sx={fieldSx} />
          </div>
        </div>

        <div>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>1º Registrado</Typography>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>CPF</Typography>
              <InputMask
                value={cpf1}
                onChange={(e) => setCpf1(e.value || '')}
                mask="999.999.999-99"
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <div className="flex-1">
              <TextField fullWidth label="Nome" value={nome1} onChange={(e) => setNome1(e.target.value)} placeholder="Nome completo" size="small" sx={fieldSx} />
            </div>
          </div>
        </div>

        <div>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary' }}>2º Registrado (opcional)</Typography>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>CPF</Typography>
              <InputMask
                value={cpf2}
                onChange={(e) => setCpf2(e.value || '')}
                mask="999.999.999-99"
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            <div className="flex-1">
              <TextField fullWidth label="Nome" value={nome2} onChange={(e) => setNome2(e.target.value)} placeholder="Nome completo" size="small" sx={fieldSx} />
            </div>
          </div>
        </div>

        <FormControlLabel
          control={
            <Checkbox
              checked={naoAverbacao}
              onChange={(e) => setNaoAverbacao(e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">Não foi possível averbar o CPF</Typography>}
        />

        {naoAverbacao && (
          <TextField
            fullWidth
            label="Motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Informe o motivo"
            size="small"
            sx={fieldSx}
          />
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Texto Gerado</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopy}
              color={copied ? 'success' : 'primary'}
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </Button>
          </div>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={inputText}
            slotProps={{ input: { readOnly: true } }}
            sx={{
              '& .MuiOutlinedInput-root': { fontSize: '0.8125rem', fontFamily: '"JetBrains Mono", monospace', backgroundColor: '#f8fafc' },
            }}
          />
        </div>
      </div>
    </div>
  );
}
