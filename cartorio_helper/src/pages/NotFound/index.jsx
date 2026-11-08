import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <h1 className="text-[var(--color-ink)] text-[var(--text-display)]">404</h1>
        <p className="mt-1 font-[var(--font-body)] font-semibold text-[var(--text-md)] text-[var(--color-ink)]">
          Página não encontrada
        </p>
        <p className="mt-1 mb-5 text-[var(--text-sm)] text-[var(--color-muted)]">
          A página que você está procurando não existe ou foi movida.
        </p>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/dashboard')}>
          <Home size={15} strokeWidth={1.75} aria-hidden="true" />
          Voltar para o início
        </button>
      </div>
    </div>
  );
}
