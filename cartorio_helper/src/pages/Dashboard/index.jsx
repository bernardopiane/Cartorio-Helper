import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const TOOLS = [
  { label: 'Upload de Arquivos', path: '/upload', desc: 'Processar arquivos XML de remessa' },
  { label: 'Formatador de Texto', path: '/formatter', desc: 'Limpar e formatar textos' },
  { label: 'Etiquetas', path: '/etiquetas', desc: 'Gerar texto de averbação de CPF' },
  { label: 'Consulta CRM', path: '/consulta', desc: 'Consultar médicos no CRM' },
  { label: 'Leitor de Certidões', path: '/certidao', desc: 'Extrair dados de certidões em PDF' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[var(--color-ink)] text-[var(--text-display)]">Início</h1>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-muted)]">
          Selecione uma ferramenta para começar
        </p>
      </div>

      <section className="sheet" aria-label="Ferramentas do Cartório Helper">
        <div className="sheet-head">
          <h2 className="text-[var(--text-title)] text-[var(--color-ink)]">Ferramentas</h2>
          <p className="text-[var(--text-xs)] text-[var(--color-muted)] font-[var(--font-outlier)] num">
            {hoje}
          </p>
        </div>

        <div className="px-[var(--space-lg)] pb-[var(--space-sm)]">
          <table className="ledger w-full">
            <thead>
              <tr>
                <th scope="col" className="w-[38%]">Ferramenta</th>
                <th scope="col" className="hidden sm:table-cell">O que faz</th>
                <th scope="col" aria-label="Abrir" />
              </tr>
            </thead>
            <tbody>
              {TOOLS.map(({ label, path, desc }) => (
                <tr
                  key={path}
                  tabIndex={0}
                  role="link"
                  aria-label={label}
                  onClick={() => navigate(path)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(path); } }}
                  className="cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-[-2px]"
                >
                  <td className="font-[var(--font-body)] font-medium text-[var(--color-ink)] text-[var(--text-md)]">
                    {label}
                  </td>
                  <td className="whitespace-normal hidden sm:table-cell">{desc}</td>
                  <td className="text-right pl-[var(--space-sm)]">
                    <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" className="inline-block text-[var(--color-muted)]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sheet-foot">
          <span className="num">{TOOLS.length}</span> ferramentas registradas
        </div>
      </section>
    </div>
  );
}
