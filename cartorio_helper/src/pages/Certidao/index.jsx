import { useEffect, useState, useRef, useCallback } from "react";
import { RotateCcw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { loadState, saveState } from "../../utils/storage.js";
import {
  extractFields,
  getSexoCasamento,
} from "../../utils/certidaoParser.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

async function extractTextFromPDF(file) {
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(" ") + "\n";
  }
  return text;
}

// failed extraction says so; a row that doesn't apply to this certidão type is a dash
const Miss = () => <span className="miss">não localizado no PDF</span>;
const Na = () => <span className="na">—</span>;

export default function CertidaoExtractor() {
  const [data, setData] = useState(() => loadState('certidao')?.data || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(() => loadState('certidao')?.fileName || null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  // a parsed certidão survives refresh: the extraction stays on the desk
  useEffect(() => {
    if (data == null) saveState('certidao', null);
    else saveState('certidao', { data, fileName });
  }, [data, fileName]);

  const processFile = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Por favor, selecione um arquivo PDF válido.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      const fields = extractFields(text);
      // the current extraction stays until the new one actually parses
      setData(fields);
      setFileName(file.name);
    } catch (err) {
      console.error(err);
      setError("Não foi possível ler o PDF. Verifique se a certidão possui texto selecionável.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    processFile(e.dataTransfer.files[0]);
  };

  // "carregar outra" only opens the picker — the current extraction is never
  // destroyed before a new one exists (cancelling the picker loses nothing)
  const reset = () => {
    inputRef.current?.click();
  };

  const headerName = data?.tipoRegistro === "Casamento"
    ? [data.conjuge1?.nomeAtual || data.conjuge1?.nome, data.conjuge2?.nomeAtual || data.conjuge2?.nome].filter(Boolean).join(" & ")
    : (data?.nomeAtual || data?.nome);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[var(--color-ink)] text-[var(--text-display)]">Leitor de Certidões</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
          Extraia dados de certidões de nascimento, casamento e óbito em PDF
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
      />

      {!data && (
        <div
          onClick={() => { if (!loading) inputRef.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={loading ? -1 : 0}
          aria-disabled={loading || undefined}
          aria-busy={loading || undefined}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !loading) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`dropzone cursor-pointer ${drag ? 'dropzone--drag' : ''}`}
        >
          {loading ? (
            <div className="loading" aria-live="polite">
              <span>Extraindo texto do PDF</span>
            </div>
          ) : (
            <>
              <p className="font-[var(--font-body)] font-medium text-[var(--color-ink)] text-[var(--text-md)] m-0">
                Selecionar certidão em PDF
              </p>
              <p className="m-0 text-[var(--text-sm)] text-[var(--color-muted)]">
                Arraste o arquivo aqui ou clique para selecionar
              </p>
              <p className="m-0 mt-1 text-[var(--text-xs)] text-[var(--color-muted)]">
                Nascimento, casamento e óbito
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="notice mt-4" role="alert">{error}</p>
      )}

      {loading && data && (
        <p className="notice mt-4" aria-live="polite">Extraindo texto do novo PDF…</p>
      )}

      {data && (
        <section className="sheet" aria-label="Dados extraídos da certidão">
          <div className="sheet-head">
            <div className="min-w-0">
              <h2 className="text-[var(--text-title)] text-[var(--color-ink)] overflow-hidden text-ellipsis whitespace-nowrap">
                {headerName || '—'}
              </h2>
              <p className="m-0 text-[var(--text-xs)] text-[var(--color-muted)] font-[var(--font-outlier)]">
                {fileName}
              </p>
            </div>
            <span className="pill">{data.tipoRegistro}</span>
          </div>

          <div className="px-[var(--space-lg)] pb-[var(--space-md)]">
            <dl className="records">
              <dt>Nome da 1ª parte</dt>
              <dd>
                {data.tipoRegistro === 'Casamento'
                  ? (data.conjuge1?.nomeAtual || data.conjuge1?.nome) || <Miss />
                  : (data.nomeAtual || data.nome) || <Miss />}
              </dd>

              <dt>Sexo da 1ª parte</dt>
              <dd>
                {data.tipoRegistro === 'Casamento'
                  ? getSexoCasamento(data.conjuge1?.estadoCivil) || <Na />
                  : data.sexo || <Miss />}
              </dd>

              <dt>Nome da 2ª parte</dt>
              <dd>
                {data.tipoRegistro === 'Casamento'
                  ? (data.conjuge2?.nomeAtual || data.conjuge2?.nome) || <Miss />
                  : <Na />}
              </dd>

              <dt>Sexo da 2ª parte</dt>
              <dd>
                {data.tipoRegistro === 'Casamento'
                  ? getSexoCasamento(data.conjuge2?.estadoCivil) || <Na />
                  : <Na />}
              </dd>

              <dt>Matrícula</dt>
              <dd>{data.matricula || <Miss />}</dd>

              <dt>Selo digital</dt>
              <dd>{data.seloDigital || <Miss />}</dd>

              <dt>Código CNS</dt>
              <dd>{data.codigoCNS || <Miss />}</dd>

              <dt>Tipo do registro</dt>
              <dd>{data.tipoRegistro || <Na />}</dd>

              <dt>Data do evento</dt>
              <dd>
                {(data.tipoRegistro === 'Casamento' ? data.dataCasamento : data.dataEvento) || <Miss />}
              </dd>

              <dt>Data do registro</dt>
              <dd>{data.dataRegistro || <Miss />}</dd>
            </dl>
          </div>

          <div className="sheet-foot flex justify-end">
            <button type="button" className="btn btn--quiet" onClick={reset}>
              <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" />
              Carregar outra certidão
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
