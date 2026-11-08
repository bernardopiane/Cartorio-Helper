import { useState } from 'react';
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
        <h1 className="text-[var(--color-ink)] text-[var(--text-display)]">Formatador de Texto</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
          Remova quebras de linha, espaços duplos e caracteres especiais
        </p>
      </div>

      <form
        className="sheet max-w-[42rem]"
        onSubmit={(e) => { e.preventDefault(); formatText(); }}
      >
        <div className="p-[var(--space-lg)] flex flex-col gap-[var(--space-md)]">
          <div>
            <label htmlFor="formatter-matricula" className="field-label">Matrícula</label>
            <input
              id="formatter-matricula"
              type="text"
              className="field"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="Digite a matrícula aqui..."
            />
          </div>

          <div>
            <label htmlFor="formatter-corpo" className="field-label">Texto</label>
            <textarea
              id="formatter-corpo"
              className="field"
              rows={5}
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              placeholder="Digite o texto aqui..."
            />
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" className="btn btn--primary" onClick={formatText}>
              <Wand2 size={15} strokeWidth={1.75} aria-hidden="true" />
              Formatar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
