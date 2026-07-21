import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Upload, FileText, Search, Tags, FileBadge,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
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
    <aside className="h-full w-[var(--sidebar-width)] bg-[var(--color-sidebar)] flex flex-col overflow-hidden select-none">
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="text-white text-lg font-semibold tracking-tight">Cartório Helper</h1>
        <p className="text-indigo-300/60 text-xs mt-0.5">Ferramentas internas</p>
      </div>

      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, path, icon: IconComp }) => {
          const active = pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 cursor-pointer border-none text-left
                ${active
                  ? 'bg-[var(--color-sidebar-active)] text-white shadow-sm shadow-indigo-600/20'
                  : 'text-indigo-200/70 hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                }
              `}
            >
              <IconComp size={18} strokeWidth={1.5} className="shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-indigo-300/30 text-[11px]">v0.1.0</p>
      </div>
    </aside>
  );
}
