import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Upload, FileText, Search, Tags, FileBadge,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Início', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload de Arquivos', path: '/upload', icon: Upload },
  { label: 'Formatador de Texto', path: '/formatter', icon: FileText },
  { label: 'Etiquetas', path: '/etiquetas', icon: Tags },
  { label: 'Consulta CRM', path: '/consulta', icon: Search },
  { label: 'Leitor de Certidões', path: '/certidao', icon: FileBadge },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className="h-full w-[var(--sidebar-width)] bg-[var(--color-paper-2)] border-r-[var(--rule-hair)] border-r-[var(--color-rule)] flex flex-col overflow-hidden select-none"
    >
      <div className="sidebar-head px-5 py-4 border-b-[var(--rule-bar)] border-b-[var(--color-rule-2)]">
        <h1 className="sidebar-title text-[var(--color-ink)] font-[var(--font-display)] text-[var(--text-md)] font-semibold tracking-[-0.01em] leading-tight">
          Cartório Helper
        </h1>
        <p className="sidebar-sub text-[var(--color-muted)] text-[var(--text-xs)] mt-0.5">
          Livro de ferramentas
        </p>
      </div>

      <nav className="flex-1 py-2 px-0 overflow-y-auto" aria-label="Ferramentas">
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
                w-full flex items-center gap-2.5 px-5 py-2 text-left cursor-pointer border-none
                text-[var(--text-sm)] font-[var(--font-display)] font-medium
                transition-colors duration-150
                border-l-[2px]
                ${active
                  ? 'border-l-[var(--color-accent)] text-[var(--color-ink)] bg-[var(--color-sheet)] font-semibold'
                  : 'border-l-transparent text-[var(--color-ink-2)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] focus-visible:bg-[var(--color-paper-3)]'
                }
              `}
            >
              <IconComp
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
                className={`shrink-0 transition-colors duration-150 ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'}`}
              />
              <span className="sidebar-label truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-foot px-5 py-3 border-t-[var(--rule-hair)] border-t-[var(--color-rule)]">
        <p className="text-[var(--color-muted)] text-[var(--text-xs)] font-[var(--font-outlier)] num">v0.1.0</p>
      </div>
    </aside>
  );
}

export { NAV_ITEMS };
