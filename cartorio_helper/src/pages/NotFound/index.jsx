import { useNavigate } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="sheet text-center max-w-md p-10 flex flex-col items-center gap-0">
        <span
          aria-hidden="true"
          className="w-12 h-12 grid place-items-center rounded-xl bg-[color-mix(in_oklab,var(--color-accent)_9%,var(--color-sheet))]"
        >
          <Compass size={22} strokeWidth={1.6} className="text-[var(--color-accent)]" />
        </span>
        <p aria-hidden="true" className="m-0 mt-4 font-[var(--font-outlier)] text-[var(--text-xs)] tracking-[0.08em] uppercase text-[var(--color-muted)]">
          Erro de rota · 404
        </p>
        <h1 className="mt-1 font-[var(--font-display)] font-semibold text-[var(--text-lg)] text-[var(--color-ink)] max-w-none">
          Página não encontrada
        </h1>
        <p className="mt-1 mb-5 text-[var(--text-sm)] text-[var(--color-muted)] max-w-[38ch]">
          A ferramenta que você está procurando não existe ou foi movida para
          outra comarca do menu.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/dashboard')}>
          <Home size={15} strokeWidth={1.75} aria-hidden="true" />
          Voltar para o início
        </button>
      </div>
    </div>
  );
}
