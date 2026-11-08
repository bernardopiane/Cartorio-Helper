import { useEffect, useState } from 'react';
import { Copy, Check, Hand } from 'lucide-react';
import { loadState, saveState } from '../../utils/storage.js';
import { maskCpf } from '../../utils/cpf.js';

// one comarca, one install — change here if the desk moves
const COMARCA = 'Nova Friburgo';

const CPF_DIGITS = /\D/g;

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
      <div className="mb-6">
        <h1 className="text-[var(--color-ink)] text-[var(--text-display)]">Gerador de Etiquetas</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
          Gere o texto de averbação de CPF para registros civis
        </p>
      </div>

      <section className="sheet">
        <div className="p-[var(--space-lg)] flex flex-col gap-[var(--space-md)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-md)]">
            <div className="min-w-0">
              <label htmlFor="etq-processo" className="field-label">Processo</label>
              <input
                id="etq-processo" type="text" className="field"
                value={processo} onChange={(e) => setProcesso(e.target.value)}
                placeholder="Número do processo"
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="etq-selo" className="field-label">Selo eletrônico</label>
              <input
                id="etq-selo" type="text" className="field"
                value={selo} onChange={(e) => setSelo(e.target.value)}
                placeholder="Número do selo"
              />
            </div>
          </div>

          <fieldset className="border-0 p-0 m-0">
            <legend className="p-0 mb-[var(--space-2xs)] font-[var(--font-body)] font-semibold text-[var(--text-sm)] text-[var(--color-ink)] flex flex-wrap items-center justify-between gap-2">
              <span>Localização no livro</span>
              <button
                type="button"
                className="btn btn--sm btn--quiet min-w-0"
                onClick={preencherDaRemessa}
                disabled={!lastRecord}
                aria-live="polite"
              >
                <Hand size={13} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
                {lastRecord && lastRecord.livro
                  ? `Preencher da última remessa (Livro ${lastRecord.livro})`
                  : 'Preencher da última remessa'}
              </button>
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-md)]">
              <div className="min-w-0">
                <label htmlFor="etq-livro" className="field-label">Livro</label>
                <input
                  id="etq-livro" type="text" className="field"
                  value={livro} onChange={(e) => setLivro(e.target.value)}
                  placeholder="Número do livro"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="etq-folha" className="field-label">Folha</label>
                <input
                  id="etq-folha" type="text" className="field"
                  value={folha} onChange={(e) => setFolha(e.target.value)}
                  placeholder="Número da folha"
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="etq-termo" className="field-label">Termo</label>
                <input
                  id="etq-termo" type="text" className="field"
                  value={termos} onChange={(e) => setTermos(e.target.value)}
                  placeholder="Número do termo"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-0 p-0 m-0" disabled={naoAverbacao}>
            <legend className="p-0 mb-[var(--space-2xs)] font-[var(--font-body)] font-semibold text-[var(--text-sm)] text-[var(--color-ink)]">
              1º registrado
              {naoAverbacao && (
                <span className="ml-[var(--space-xs)] font-normal text-[var(--color-muted)]">
                  — irrelevante quando o CPF não é averbado
                </span>
              )}
            </legend>
            <div className="flex flex-col sm:flex-row gap-[var(--space-md)]">
              <div className="sm:w-56 shrink-0">
                <label htmlFor="etq-cpf1" className="field-label">CPF</label>
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
                <label htmlFor="etq-nome1" className="field-label">Nome</label>
                <input
                  id="etq-nome1" type="text" className="field"
                  value={nome1} onChange={(e) => setNome1(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="border-0 p-0 m-0" disabled={naoAverbacao}>
            <legend className="p-0 mb-[var(--space-2xs)] font-[var(--font-body)] font-semibold text-[var(--text-sm)] text-[var(--color-ink)]">
              2º registrado (opcional)
            </legend>
            <div className="flex flex-col sm:flex-row gap-[var(--space-md)]">
              <div className="sm:w-56 shrink-0">
                <label htmlFor="etq-cpf2" className="field-label">CPF</label>
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
                <label htmlFor="etq-nome2" className="field-label">Nome</label>
                <input
                  id="etq-nome2" type="text" className="field"
                  value={nome2} onChange={(e) => setNome2(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
            </div>
          </fieldset>

          <label className="flex items-center gap-[var(--space-xs)] cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={naoAverbacao}
              onChange={(e) => setNaoAverbacao(e.target.checked)}
              className="m-0 w-4 h-4 shrink-0 cursor-pointer accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-2"
            />
            <span className="text-[var(--text-sm)] text-[var(--color-ink-2)]">
              Não foi possível averbar o CPF
            </span>
          </label>

          {naoAverbacao && (
            <div>
              <label htmlFor="etq-motivo" className="field-label">Motivo</label>
              <input
                id="etq-motivo" type="text" className="field"
                value={motivo} onChange={(e) => setMotivo(e.target.value)}
                placeholder="Informe o motivo"
              />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-[var(--space-2xs)]">
              <h2 className="font-[var(--font-body)] font-semibold text-[var(--text-sm)] text-[var(--color-ink)]">
                Texto gerado
              </h2>
              <span className="flex items-center gap-2 min-w-0">
                {!canCopy && (
                  <span className="text-[var(--text-xs)] text-[var(--color-muted)] min-w-0">
                    {copyHint}
                  </span>
                )}
                <button
                  type="button"
                  className="btn"
                  onClick={handleCopy}
                  aria-disabled={!canCopy}
                  aria-live="polite"
                >
                  {copied
                    ? <Check size={14} strokeWidth={1.75} aria-hidden="true" className="text-[var(--color-success)]" />
                    : <Copy size={14} strokeWidth={1.75} aria-hidden="true" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </span>
            </div>
            <textarea
              className="field field--out"
              rows={8}
              readOnly
              aria-label="Texto de averbação gerado"
              value={inputText}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
