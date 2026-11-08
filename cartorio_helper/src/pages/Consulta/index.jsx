import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function ConsultaCRM() {
  // the offline contract is honest: this one tool genuinely needs the network
  const [online, setOnline] = useState(() => navigator.onLine);

  // live: accept the event instead of making the desk re-open the page
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[var(--color-ink)] text-[var(--text-display)]">Consulta CRM</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
          Consulte médicos no portal do CREMERJ
        </p>
      </div>

      {!online && (
        <p className="notice notice--quiet mb-4" role="status">
          Sem conexão — a consulta exige internet. Reconecte e reabra esta página.
        </p>
      )}

      <div className="sheet">
        <div className="sheet-head">
          <span className="text-[var(--text-xs)] text-[var(--color-muted)] font-[var(--font-outlier)]">
            portal.cremerj.org.br/busca-medicos
          </span>
          <a
            href="https://portal.cremerj.org.br/busca-medicos"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-[var(--space-2xs)] text-[var(--text-xs)] text-[var(--color-ink-2)] no-underline hover:underline"
          >
            <ExternalLink size={13} strokeWidth={1.5} aria-hidden="true" />
            Abrir no portal
          </a>
        </div>
        <webview
          src="https://portal.cremerj.org.br/busca-medicos"
          style={{ width: '100%', height: 'calc(100vh - 280px)', minHeight: 500 }}
        />
      </div>
    </div>
  );
}
