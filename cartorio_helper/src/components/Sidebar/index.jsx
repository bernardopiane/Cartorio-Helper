import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Upload, FileText, Search, Tags, FileBadge,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Início / Painel Geral', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload de Arquivos XML', path: '/upload', icon: Upload },
  { label: 'Formatador de Texto', path: '/formatter', icon: FileText },
  { label: 'Gerador de Etiquetas', path: '/etiquetas', icon: Tags },
  { label: 'Consulta CRM / CREMERJ', path: '/consulta', icon: Search },
  { label: 'Leitor de Certidões PDF', path: '/certidao', icon: FileBadge },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className="sidebar h-full w-[var(--sidebar-width)] bg-[var(--color-sidebar)] flex flex-col overflow-hidden select-none shrink-0"
    >
      <div className="sidebar-head px-5 py-5 border-b border-[color-mix(in_oklab,var(--color-sidebar-ink)_14%,transparent)]">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="w-8 h-8 shrink-0 grid place-items-center rounded-lg bg-[var(--color-sheet)] text-[var(--color-sidebar)] font-[var(--font-outlier)] text-[var(--text-xs)] font-medium"
          >
            DIRC
          </span>
          <div className="min-w-0">
            <h1 className="sidebar-title text-[var(--color-sidebar-ink)] font-[var(--font-display)] text-[var(--text-md)] font-semibold tracking-[-0.01em] leading-tight">
              Cartório Helper
            </h1>
            <p className="sidebar-eyebrow text-[color-mix(in_oklab,var(--color-sidebar-ink)_55%,transparent)] text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase mt-0.5">
              Registro Civil &amp; Notarial
            </p>
          </div>
        </div>
      </div>

      <p className="sidebar-eyebrow px-5 pt-5 pb-2 text-[color-mix(in_oklab,var(--color-sidebar-ink)_45%,transparent)] text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.1em] uppercase">
        Módulos Notariais
      </p>

      <nav className="flex-1 pb-2 px-2.5 overflow-y-auto" aria-label="Ferramentas">
        {NAV_ITEMS.map(({ label, path, icon: IconComp }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`
                sidebar-label-wrap w-full flex items-center gap-2.5 px-2.5 py-2 text-left cursor-pointer border-none rounded-lg
                text-[var(--text-sm)] font-[var(--font-display)] font-medium
                transition-colors duration-150 mb-0.5
                ${active
                  ? 'bg-[var(--color-sidebar-2)] text-[var(--color-sidebar-ink)] font-semibold'
                  : 'text-[var(--color-sidebar-ink-2)] hover:text-[var(--color-sidebar-ink)] hover:bg-[color-mix(in_oklab,var(--color-sidebar-ink)_7%,transparent)] focus-visible:bg-[color-mix(in_oklab,var(--color-sidebar-ink)_7%,transparent)]'
                }
              `}
            >
              <IconComp
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
                className={`shrink-0 transition-colors duration-150 ${active ? 'text-[var(--color-sheet)]' : 'text-[var(--color-sidebar-ink-2)]'}`}
              />
              <span className="sidebar-label truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-foot px-5 py-3 border-t border-[color-mix(in_oklab,var(--color-sidebar-ink)_14%,transparent)]">
        <p className="text-[color-mix(in_oklab,var(--color-sidebar-ink)_45%,transparent)] text-[var(--text-xs)] font-[var(--font-outlier)] num">v0.1.0</p>
      </div>
    </aside>
  );
}

export { NAV_ITEMS };
