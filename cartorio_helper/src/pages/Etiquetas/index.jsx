import { useEffect, useState } from 'react';
import {
  Copy, Check, Hand, FolderOpen, ShieldCheck, BookOpen, FileText, Hash,
  BadgeCheck, ChevronDown, RotateCcw, Info, Lock, Stamp,
} from 'lucide-react';
import { loadState, saveState } from '../../utils/storage.js';
import { maskCpf } from '../../utils/cpf.js';

// one comarca, one install — change here if the desk moves
const COMARCA = 'Nova Friburgo';

const CPF_DIGITS = /\D/g;

/* numbered section card: the mockup's 01/02/03 steps */
function StepCard({ step, title, sub, chip, chipTone = 'pill--error', children, footer }) {
  return (
    <section className="sheet" aria-labelledby={`etq-titulo-${step}`}>
      <div className="flex items-center gap-3 px-[var(--space-lg)] py-4 border-b border-[var(--color-rule)]">
        <span
          aria-hidden="true"
          className="w-7 h-7 shrink-0 grid place-items-center rounded-md bg-[var(--color-ink)] text-[var(--color-sheet)] font-[var(--font-outlier)] text-[var(--text-xs)] font-medium"
        >
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`etq-titulo-${step}`} className="text-[var(--text-md)] text-[var(--color-ink)] max-w-none text-wrap">{title}</h2>
          <p className="m-0 text-[var(--text-xs)] text-[var(--color-muted)]">{sub}</p>
        </div>
        {chip && <span className={`pill ${chipTone}`}>{chip}</span>}
      </div>
      <div className="p-[var(--space-lg)] flex flex-col gap-[var(--space-md)]">{children}</div>
      {footer}
    </section>
  );
}

export default function Etiquetas() {
  const [saved] = useState(() => loadState('etiquetas') || {});
  const [cpf1, setCpf1] = useState(saved.cpf1 || '');
  const [nome1, setNome1] = useState(saved.nome1 || '');
  const [cpf2, setCpf2] = useState(saved.cpf2 || '');
  const [nome2, setNome2] = useState(saved.nome2 || '');
  const [processo, setProcesso] = useState(saved.processo || '');
  const [selo, setSelo] = useState(saved.selo || '');
  const [livro, setLivro] = useState(saved.livro || '');
  const [folha, setFolha] = useState(saved.folha || '');
  const [termos, setTermos] = useState(saved.termos || '');
  const [motivo, setMotivo] = useState(saved.motivo || '');
  const [naoAverbacao, setNaoAverbacao] = useState(saved.naoAverbacao === true);
  const [abrir2, setAbrir2] = useState(Boolean(saved.cpf2 || saved.nome2));
  const [copied, setCopied] = useState(false);

  const data = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // the averbação survives refresh: the desk keeps its half-written records
  useEffect(() => {
    saveState('etiquetas', {
      cpf1, nome1, cpf2, nome2, processo, selo, livro, folha, termos, motivo, naoAverbacao,
    });
  }, [cpf1, nome1, cpf2, nome2, processo, selo, livro, folha, termos, motivo, naoAverbacao]);

  // handoff: the remessa ledger already parsed where the record lives
  const remessa = loadState('upload');
  const lastRecord = remessa?.records?.length ? remessa.records[remessa.records.length - 1] : null;

  function preencherDaRemessa() {
    if (!lastRecord) return;
    setLivro(lastRecord.livro || '');
    setFolha(lastRecord.folha || '');
    setTermos(lastRecord.termo || '');
  }

  function limparFormulario() {
    setCpf1(''); setNome1(''); setCpf2(''); setNome2('');
    setProcesso(''); setSelo(''); setLivro(''); setFolha(''); setTermos(''); setMotivo('');
    setNaoAverbacao(false); setAbrir2(false);
  }

  // copying an incomplete averbação puts unfinished text in the registry book — guard it
  const cpf1Completo = cpf1.replace(CPF_DIGITS, '').length === 11;
  const canCopy = naoAverbacao
    ? motivo.trim().length > 0
    : cpf1Completo && nome1.trim().length > 0;
  const copyHint = naoAverbacao
    ? 'Informe o motivo para copiar'
    : cpf1Completo
      ? 'Informe o nome do 1º registrado para copiar'
      : 'Informe o CPF completo do 1º registrado para copiar';

  const generateTemplate = () => {
    let template = `AVERBAÇÃO: Livro ${livro}, Folha ${folha}, Termo ${termos}.`;

    if (naoAverbacao) {
      template += `\n\nNão foi possível averbar o CPF do(a) registrado(a), pois ${motivo}`;
    } else {
      template += `\n\nAverbo, nos termos do art. 477, §3º, do Provimento nº 149, de 30 de agosto de 2023, com a redação dada pelo Provimento nº 182, de 17 de setembro de 2024, do Conselho Nacional de Justiça, para que passe a constar do registro que o número do CPF de ${nome1} é ${cpf1}`;

      if (cpf2 && nome2) {
        template += ` e que o número do CPF de ${nome2} é ${cpf2}`;
      }

      template += `, tudo conforme comprovantes da Receita Federal, obtido através de consulta feita na base dados do CRC Nacional. Dou fé. ${COMARCA}, ${data}.`;
      template += `\n\nIsento - Processo nº ${processo}`;
      template += `\nSelo Eletrônico: ${selo}`;
    }

    return template;
  };

  const inputText = generateTemplate();

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(inputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[56ch]">
          <p className="text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-muted)] m-0">
            Módulo RCPN / <span className="text-[var(--color-accent)]">Etiquetas &amp; Averbação</span> / Provimento CNJ 182/2024
          </p>
          <h1 className="mt-1 text-[var(--color-ink)] text-[var(--text-display)]! max-w-none">
            Gerador de Etiquetas &amp; Averbação de CPF
          </h1>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
            Gere termos padronizados de averbação de CPF para registros civis em estrita
            conformidade com o Provimento nº 149/2023 alterado pelo Provimento nº 182/2024 do CNJ.
          </p>
        </div>
        <span className="pill pill--info px-[var(--space-sm)] py-1 flex items-center gap-1.5">
          <BadgeCheck size={13} strokeWidth={1.8} aria-hidden="true" />
          Provimento CNJ nº 182/2024
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 items-start">
        {/* -------- left: the three numbered form sections -------- */}
        <div className="flex flex-col gap-5 min-w-0">
          <StepCard
            step="01" title="Identificação do Registro" sub="Autenticação oficial e vínculo judicial"
            chip="Obrigatório"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-md)]">
              <div className="min-w-0">
                <label htmlFor="etq-processo" className="field-label">Número do Processo Administrativo</label>
                <div className="relative">
                  <FolderOpen size={14} strokeWidth={1.6} aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
                  <input
                    id="etq-processo" type="text" className="field !pl-8"
                    value={processo} onChange={(e) => setProcesso(e.target.value)}
                    placeholder="Ex.: 2026. 0849182/PA"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor="etq-selo" className="field-label">Número do Selo Eletrônico TJ</label>
                <div className="relative">
                  <ShieldCheck size={14} strokeWidth={1.6} aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
                  <input
                    id="etq-selo" type="text" className="field !pl-8"
                    value={selo} onChange={(e) => setSelo(e.target.value)}
                    placeholder="Ex.: EYZA. 94821. KTP-09"
                  />
                </div>
              </div>
            </div>
          </StepCard>

          <StepCard
            step="02" title="Localização Notarial no Livro" sub="Índice no Registro Civil de Nascimentos/Casamentos"
          >
            <button
              type="button"
              className="btn btn--sm btn--quiet w-fit min-w-0"
              onClick={preencherDaRemessa}
              disabled={!lastRecord}
              aria-live="polite"
            >
              <Hand size={13} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
              {lastRecord && lastRecord.livro
                ? `Preencher da última remessa (Livro ${lastRecord.livro})`
                : 'Preencher da última remessa'}
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-md)]">
              <div className="min-w-0">
                <label htmlFor="etq-livro" className="field-label">Livro</label>
                <div className="relative">
                  <BookOpen size={14} strokeWidth={1.6} aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
                  <input
                    id="etq-livro" type="text" className="field !pl-8"
                    value={livro} onChange={(e) => setLivro(e.target.value)}
                    placeholder="Ex.: A-14"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor="etq-folha" className="field-label">Folha</label>
                <div className="relative">
                  <FileText size={14} strokeWidth={1.6} aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
                  <input
                    id="etq-folha" type="text" className="field !pl-8"
                    value={folha} onChange={(e) => setFolha(e.target.value)}
                    placeholder="Ex.: 182"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor="etq-termo" className="field-label">
                  Termo <span className="ml-[var(--space-xs)] text-[var(--text-xs)] font-normal text-[var(--color-muted)]">Assento</span>
                </label>
                <div className="relative">
                  <Hash size={14} strokeWidth={1.6} aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none" />
                  <input
                    id="etq-termo" type="text" className="field !pl-8"
                    value={termos} onChange={(e) => setTermos(e.target.value)}
                    placeholder="Ex.: 51694"
                  />
                </div>
              </div>
            </div>
          </StepCard>

          <StepCard
            step="03" title="Qualificação dos Registrados" sub="Titularidade civil e cadastro na Receita Federal"
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2 px-[var(--space-lg)] py-3 border-t border-[var(--color-rule)]">
                <span className="flex items-center gap-1.5 text-[var(--text-xs)] text-[var(--color-muted)]">
                  <Info size={13} strokeWidth={1.6} aria-hidden="true" />
                  Preenchimento auditável do formulário
                </span>
                <button type="button" className="btn btn--sm btn--quiet" onClick={limparFormulario}>
                  <RotateCcw size={13} strokeWidth={1.5} aria-hidden="true" />
                  Limpar Dados do Formulário
                </button>
              </div>
            }
          >
            {/* 1º registrado */}
            <div className="rounded-[var(--radius-field)] bg-[var(--color-paper)] p-[var(--space-md)]">
              <p className="flex items-center gap-1.5 m-0 mb-[var(--space-xs)] text-[var(--text-sm)] font-semibold text-[var(--color-ink)]">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                1º Registrado (Titular Principal)
              </p>
              <div className="flex flex-col sm:flex-row gap-[var(--space-md)]">
                <div className="sm:w-56 shrink-0">
                  <label htmlFor="etq-cpf1" className="field-label">CPF Formatado</label>
                  <input
                    id="etq-cpf1"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    className="field"
                    value={cpf1}
                    onChange={(e) => setCpf1(maskCpf(e.target.value))}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label htmlFor="etq-nome1" className="field-label">Nome Completo do Registrado</label>
                  <input
                    id="etq-nome1" type="text" className="field"
                    value={nome1} onChange={(e) => setNome1(e.target.value)}
                    placeholder="Nome do titular conforme o registro"
                  />
                </div>
              </div>
            </div>

            {/* 2º registrado: collapsible -> only carries data when enabled */}
            <div className="rounded-[var(--radius-field)] border border-[var(--color-rule)] bg-[var(--color-sheet)]">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-[var(--space-md)] py-3 bg-transparent border-0 cursor-pointer text-left"
                aria-expanded={abrir2}
                onClick={() => setAbrir2((v) => !v)}
              >
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-[var(--color-rule-2)]" />
                <span className="text-[var(--text-sm)] font-medium text-[var(--color-ink-2)]">
                  2º Registrado (Opcional / Cônjuge)
                </span>
                <span className="pill ml-1">{naoAverbacao ? 'Indisponível' : 'Livro B'}</span>
                <ChevronDown
                  size={15}
                  strokeWidth={1.6}
                  aria-hidden="true"
                  className={`ml-auto text-[var(--color-muted)] transition-transform duration-150 ${abrir2 ? 'rotate-180' : ''}`}
                />
              </button>
              {abrir2 && !naoAverbacao && (
                <div className="flex flex-col sm:flex-row gap-[var(--space-md)] px-[var(--space-md)] pb-[var(--space-md)]">
                  <div className="sm:w-56 shrink-0">
                    <label htmlFor="etq-cpf2" className="field-label">CPF (opcional)</label>
                    <input
                      id="etq-cpf2"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      className="field"
                      value={cpf2}
                      onChange={(e) => setCpf2(maskCpf(e.target.value))}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="etq-nome2" className="field-label">Nome (opcional)</label>
                    <input
                      id="etq-nome2" type="text" className="field"
                      value={nome2} onChange={(e) => setNome2(e.target.value)}
                      placeholder="Nome do 2º registrado"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* justificativa formal toggle */}
            <div className="rounded-[var(--radius-field)] bg-[var(--color-paper)] p-[var(--space-md)] flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-[var(--space-xs)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={naoAverbacao}
                  onChange={(e) => setNaoAverbacao(e.target.checked)}
                  className="m-0 w-4 h-4 shrink-0 cursor-pointer accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2"
                />
                <span className="text-[var(--text-sm)] font-medium text-[var(--color-ink-2)]">
                  Não foi possível averbar o CPF (adicionar justificativa formal)
                </span>
              </label>
              <span className="pill ml-auto font-[var(--font-outlier)] !font-normal">Art. 477, §4º CNJ</span>
              {naoAverbacao && (
                <div className="w-full">
                  <label htmlFor="etq-motivo" className="field-label">Motivo</label>
                  <input
                    id="etq-motivo" type="text" className="field"
                    value={motivo} onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Informe o motivo da não averbação"
                  />
                </div>
              )}
            </div>
          </StepCard>
        </div>

        {/* -------- right: the minuta panel -------- */}
        <aside aria-label="Minuta da averbação formatada" className="xl:sticky xl:top-0 min-w-0">
          <section className="sheet">
            <div className="p-[var(--space-lg)] pb-[var(--space-md)]">
              <div className="flex items-start gap-2.5">
                <Stamp size={18} strokeWidth={1.6} aria-hidden="true" className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[var(--text-md)] text-[var(--color-ink)] max-w-none text-wrap">
                    Minuta da Averbação Formatada
                  </h2>
                  <p className="m-0 text-[var(--text-xs)] text-[var(--color-muted)] mt-0.5">
                    Padrão ABNT / RCPN
                  </p>
                </div>
                <span className="pill pill--success">Validação OK</span>
              </div>
              <p className="m-0 mt-2 text-[var(--text-xs)] text-[var(--color-muted)]">
                Conforme Provisimentos CNJ 149/2023 &amp; 182/2024
              </p>
            </div>

            <div className="px-[var(--space-md)] pb-[var(--space-md)]">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-[var(--space-2xs)] px-1">
                {!canCopy && (
                  <span className="text-[var(--text-xs)] text-[var(--color-muted)] min-w-0">
                    {copyHint}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn--primary w-full"
                  onClick={handleCopy}
                  aria-disabled={!canCopy}
                  aria-live="polite"
                >
                  {copied
                    ? <Check size={15} strokeWidth={1.75} aria-hidden="true" />
                    : <Copy size={15} strokeWidth={1.75} aria-hidden="true" />}
                  {copied ? 'Copiado!' : 'Copiar Texto da Averbação'}
                </button>
              </div>

              {/* dashed frame = guia de impressão térmica */}
              <div className="border border-dashed border-[var(--color-rule-2)] rounded-[var(--radius-field)] bg-[var(--color-paper)] p-[var(--space-sm)]">
                <div
                  className="border border-dashed border-[color-mix(in_oklab,var(--color-rule-2)_60%,transparent)] rounded-sm p-[var(--space-sm)] min-h-[260px]"
                >
                  <p aria-hidden="true" className="m-0 mb-1 font-[var(--font-outlier)] text-[10px] tracking-[0.08em] uppercase text-[var(--color-muted)]">
                    Margem de corte térmica
                  </p>
                  <textarea
                    className="w-full bg-transparent border-0 outline-none p-0 m-0 font-[var(--font-outlier)] text-[var(--text-sm)] leading-[1.7] text-[var(--color-ink)] resize-none min-h-52"
                    readOnly
                    rows={8}
                    aria-label="Texto de averbação gerado"
                    value={inputText}
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-[var(--space-lg)] py-3 border-t border-[var(--color-rule)]">
              <span className="flex items-center gap-1.5 text-[var(--text-xs)] text-[var(--color-muted)] min-w-0">
                <Lock size={12} strokeWidth={1.6} aria-hidden="true" className="shrink-0" />
                Autenticado via Provimento CNJ 182/2024
              </span>
              <span className="text-[var(--text-xs)] font-[var(--font-outlier)] num text-[var(--color-muted)]">Versão 2.4</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
