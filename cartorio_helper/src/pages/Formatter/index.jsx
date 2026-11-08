import { useState } from 'react';
import {
  Wand2, Sparkles, FileText, CircleCheck, RotateCcw, Copy, Check, Download, FileSearch,
} from 'lucide-react';

/* the four transformations formatText actually performs, shown as the
 * "regras de higienização aplicadas" strip */
const REGRAS = [
  { titulo: 'Quebras de linha', sub: 'Unifica parágrafos partidos' },
  { titulo: 'Espaços múltiplos', sub: 'Elimina duplo espaçamento' },
  { titulo: 'Aspas para apóstrofo', sub: 'Troca aspas por plica simples' },
  { titulo: 'Matrícula sem pontuação', sub: 'Remove pontos e hífens' },
];

export default function TextFormatter() {
  const [corpo, setCorpo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [saida, setSaida] = useState(null);
  const [copied, setCopied] = useState(false);

  // same rules the tool has always applied — now writing to the output pane
  // instead of overwriting the source, so the original text survives
  const formatText = () => {
    const formattedCorpo = corpo.replace(/\n/g, ' ').replace(/\s\s/g, ' ').replace(/"/g, "'");
    const formattedMatricula = matricula
      .replace(/\n/g, '')
      .replace(/\s\s/g, '')
      .replace(/"/g, "'")
      .replace(/\./g, '')
      .replace(/-/g, '');
    setSaida({ corpo: formattedCorpo, matricula: formattedMatricula });
  };

  async function copiarFormatado() {
    if (!saida) return;
    const text = [saida.matricula, saida.corpo].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function exportarTxt() {
    if (!saida?.corpo) return;
    const blob = new Blob([saida.corpo], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `texto_higienizado_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function limparCampos() {
    setCorpo('');
    setMatricula('');
    setSaida(null);
  }

  const carac = corpo.length;
  const palavras = corpo.trim() ? corpo.trim().split(/\s+/).length : 0;
  const temSaida = Boolean(saida?.corpo);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[52ch]">
          <p className="text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-muted)] m-0">
            RCPN · Ferramentas Redacionais · <span className="text-[var(--color-accent)]">Provimento 149/CNJ</span>
          </p>
          <h1 className="mt-1 text-[var(--color-ink)] text-[var(--text-display)]! max-w-none">
            Formatador Notarial de Texto
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
            Higienize e formate transcrições de assentos, removendo quebras indevidas, duplos
            espaços e caracteres especiais com conformidade registral.
          </p>
        </div>
        <button type="button" className="btn" onClick={limparCampos}>
          <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
          Limpar Campos
        </button>
      </div>

      {/* rules strip */}
      <section className="sheet px-[var(--space-lg)] py-4" aria-label="Regras de higienização aplicadas">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="flex items-center gap-2 m-0 text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-ink-2)]">
            <Sparkles size={14} strokeWidth={1.6} aria-hidden="true" className="text-[var(--color-accent)]" />
            Regras de Higienização Aplicadas
          </p>
          <span className="text-[var(--text-xs)] text-[var(--color-muted)] num font-[var(--font-outlier)]">
            {REGRAS.length} regras ativas
          </span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 list-none p-0 m-0 mt-3">
          {REGRAS.map(({ titulo, sub }) => (
            <li key={titulo} className="rounded-[var(--radius-field)] bg-[var(--color-paper)] px-3 py-2.5">
              <p className="m-0 text-[var(--text-sm)] font-semibold text-[var(--color-ink-2)]">{titulo}</p>
              <p className="m-0 text-[var(--text-xs)] text-[var(--color-muted)]">{sub}</p>
            </li>
          ))}
        </ul>
      </section>

      <form
        className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 items-start"
        onSubmit={(e) => { e.preventDefault(); formatText(); }}
      >
        {/* entrada */}
        <section className="sheet p-[var(--space-lg)]" aria-label="Texto original de entrada">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="flex items-center gap-1.5 m-0 text-[var(--text-sm)] font-semibold text-[var(--color-ink)]">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
              Texto Original de Entrada
            </p>
            <span className="pill">Entrada Bruta</span>
          </div>

          <label htmlFor="formatter-matricula" className="text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-ink-2)]">
            Matrícula notarial (padrão CNJ · 32 dígitos)
          </label>
          <input
            id="formatter-matricula"
            type="text"
            className="field mt-1 mb-4"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            placeholder="Ex.: 094821 01 55 2024 1 00045 289 0019234-82"
          />

          <label htmlFor="formatter-corpo" className="flex items-end justify-between gap-2 min-w-0">
            <span className="text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-ink-2)] truncate">
              Assento / Certidão / Averbação bruta
            </span>
            <span className="text-[var(--text-xs)] text-[var(--color-muted)] num font-[var(--font-outlier)] shrink-0">
              {carac} carac. · {palavras} pal.
            </span>
          </label>
          <textarea
            id="formatter-corpo"
            className="field mt-1"
            rows={10}
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
            placeholder="Cole aqui o texto copiado de certidões em PDF, CRC Nacional, SIRC ou transcrições manuscritas antigas com quebras de linha ruidosas…"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
            <span className="flex items-center gap-1.5 text-[var(--text-xs)] text-[var(--color-muted)] min-w-0">
              <FileSearch size={13} strokeWidth={1.6} aria-hidden="true" className="shrink-0" />
              Preserva acentuação e pontuações de livro
            </span>
            <button type="submit" className="btn btn--primary">
              <Wand2 size={15} strokeWidth={1.75} aria-hidden="true" />
              Formatar Texto Agora
            </button>
          </div>
        </section>

        {/* saída */}
        <section className="sheet p-[var(--space-lg)]" aria-label="Texto higienizado">
          <div className="flex items-center justify-between gap-2 mb-4">
            <p className="flex items-center gap-1.5 m-0 text-[var(--text-sm)] font-semibold text-[var(--color-ink)]">
              <CircleCheck size={15} strokeWidth={1.7} aria-hidden="true" className="text-[var(--color-success)]" />
              Texto Higienizado · Livro RCPN
            </p>
            <span className="pill pill--success">
              {saida?.corpo ? 'Pronto para Assento' : 'Aguardando'}
            </span>
          </div>

          <div className="rounded-[var(--radius-field)] bg-[var(--color-paper)] px-3 py-2.5 flex items-center justify-between gap-2">
            <span className="font-[var(--font-outlier)] text-[var(--text-xs)] text-[var(--color-ink-2)] truncate min-w-0">
              IDENTIFICADOR FORMAL: {saida?.matricula || 'Sem matrícula informada'}
            </span>
          </div>

          <p className="flex items-end justify-between gap-2 m-0 mt-4">
            <span className="text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-ink-2)]">
              Resultado Processado
            </span>
            <span className="text-[var(--text-xs)] text-[var(--color-muted)] num font-[var(--font-outlier)] shrink-0">
              {saida ? `${saida.corpo.length} caracteres higienizados` : '—'}
            </span>
          </p>
          {temSaida ? (
            <textarea
              className="field field--out mt-1"
              rows={10}
              readOnly
              aria-label="Texto higienizado gerado"
              value={saida.corpo}
            />
          ) : (
            <div className="mt-1 rounded-[var(--radius-field)] border border-dashed border-[var(--color-rule-2)] bg-[var(--color-paper)] min-h-[262px] grid place-items-center text-center p-[var(--space-lg)]">
              <div>
                <FileText size={22} strokeWidth={1.5} aria-hidden="true" className="mx-auto text-[var(--color-rule-2)]" />
                <p className="m-0 mt-2 text-[var(--text-sm)] font-medium text-[var(--color-ink-2)]">
                  Aguardando entrada de dados
                </p>
                <p className="m-0 mt-1 text-[var(--text-xs)] text-[var(--color-muted)] max-w-[38ch]">
                  Insira a matrícula e o texto à esquerda e clique em “Formatar Texto Agora”
                  para produzir a versão canônica.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
            <button type="button" className="btn btn--dark" onClick={copiarFormatado} aria-disabled={!temSaida} aria-live="polite">
              {copied
                ? <Check size={15} strokeWidth={1.75} aria-hidden="true" />
                : <Copy size={15} strokeWidth={1.75} aria-hidden="true" />}
              Copiar Formatado
            </button>
            <button type="button" className="btn" onClick={exportarTxt} aria-disabled={!temSaida} aria-live="polite">
              <Download size={15} strokeWidth={1.75} aria-hidden="true" />
              Exportar .TXT
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
