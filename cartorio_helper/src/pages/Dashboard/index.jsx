import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Upload, FileText, Tags, Search, FileBadge, Grip, Settings, Keyboard,
} from 'lucide-react';
import { SHORTCUTS } from '../../hooks/useShortcuts.js';

const TOOLS = [
  {
    label: 'Upload de Arquivos XML', path: '/upload', icon: Upload,
    desc: 'Processar arquivos XML de remessa, validar hashes estruturais do CNJ e calcular emolumentos da comarca com precisão centesimal.',
    chip: null, alt: 'U',
  },
  {
    label: 'Formatador de Texto', path: '/formatter', icon: FileText,
    desc: 'Remover quebras de linha espúrias, espaços duplos e caracteres especiais para matrículas, livros e editais notariais sem corromper acentuações.',
    chip: 'ASCII/UTF-8', alt: 'F',
  },
  {
    label: 'Gerador de Etiquetas & Averbação', path: '/etiquetas', icon: Tags,
    desc: 'Gerar texto padronizado de averbação de CPF, casamento e óbito segundo Provisimentos 149/182 do CNJ, com coordenadas exatas de impressão.',
    chip: 'Prov. 149/182', alt: 'E',
  },
  {
    label: 'Leitor de Certidões PDF', path: '/certidao', icon: FileBadge,
    desc: 'Extração automática de termos de nascimento, casamento e óbito em PDF, isolando livro, folha, termo e filiação de forma estruturada.',
    chip: 'OCR Engine v4', alt: 'L',
  },
  {
    label: 'Consulta CRM / Médicos', path: '/consulta', icon: Search,
    desc: 'Validação instantânea de CRM de médicos atestantes de óbito e declarações de nascido vivo junto ao Conselho Regional e Federal.',
    chip: 'CFM / CREMERJ', alt: 'C',
  },
];

const comboLabel = (alt) => {
  const s = SHORTCUTS.find((x) => x.key === alt.toLowerCase());
  return s ? s.combo : `Alt + ${alt}`;
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Grip size={20} strokeWidth={1.6} aria-hidden="true" className="text-[var(--color-accent)]" />
          <h1 className="text-[var(--color-ink)] text-[length:var(--text-xl)]">Ferramentas Notariais Disponíveis</h1>
        </div>
        <span className="pill pill--info">{TOOLS.length} Módulos Homologados</span>
      </div>

      <section aria-label="Ferramentas do Cartório Helper">
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 list-none p-0 m-0">
          {TOOLS.map(({ label, path, icon: IconComp, desc, chip, alt }) => (
            <li
              key={path}
              tabIndex={0}
              role="link"
              aria-label={label}
              onClick={() => navigate(path)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(path); } }}
              className="sheet p-6 pb-5 flex flex-col cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] focus-visible:outline-offset-[-2px] hover:shadow-[0_2px_4px_rgb(20_22_52/0.06),0_16px_36px_-16px_rgb(20_22_52/0.18)] transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  aria-hidden="true"
                  className="w-11 h-11 grid place-items-center rounded-xl bg-[color-mix(in_oklab,var(--color-accent)_9%,var(--color-sheet))]"
                >
                  <IconComp size={20} strokeWidth={1.6} className="text-[var(--color-accent)]" />
                </span>
                {chip && <span className="pill font-[var(--font-outlier)] !font-normal">{chip}</span>}
              </div>

              <h2 className="mt-4 text-[length:var(--text-md)] text-[var(--color-ink)] max-w-none text-wrap">{label}</h2>
              <p className="mt-2 text-[length:var(--text-sm)] leading-[1.55] text-[var(--color-muted)]">{desc}</p>

              <div className="mt-auto pt-5 flex items-center gap-2">
                <kbd className="pill !bg-[var(--color-paper-2)] font-[var(--font-outlier)] !font-normal">{comboLabel(alt)}</kbd>
                <button
                  type="button"
                  className="btn"
                  aria-label={`Acessar ferramenta ${label}`}
                  onClick={(e) => { e.stopPropagation(); navigate(path); }}
                >
                  Acessar Ferramenta
                  <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}

          {/* best-practices card: the dark tile closes the grid */}
          <li className="rounded-[var(--radius-card)] bg-[var(--color-sidebar)] p-6 pb-5 flex flex-col shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[length:var(--text-xs)] font-[var(--font-outlier)] tracking-[0.1em] uppercase text-[color-mix(in_oklab,var(--color-sheet)_75%,var(--color-sidebar-ink-2))]">
                Boas Práticas
              </p>
              <Settings size={18} strokeWidth={1.5} aria-hidden="true" className="text-[color-mix(in_oklab,var(--color-sheet)_80%,var(--color-sidebar-ink-2))]" />
            </div>
            <h2 className="mt-3 text-[length:var(--text-md)] text-[var(--color-sidebar-ink)] max-w-none">Conformidade e Selagem</h2>
            <p className="mt-2 text-[length:var(--text-sm)] leading-[1.55] text-[color-mix(in_oklab,var(--color-sidebar-ink-2)_78%,var(--color-sidebar-ink))]">
              Antes de despachar o lote de averbação, confira a assinatura digital ICP-Brasil e a correção do livro A/B com a comarca de origem.
            </p>
            <div className="mt-auto pt-6">
              <span className="font-[var(--font-outlier)] text-[length:var(--text-xs)] text-[color-mix(in_oklab,var(--color-sidebar-ink)_85%,transparent)]">
                Cartilha Operacional 2026
              </span>
            </div>
          </li>
        </ul>
      </section>

      <section
        aria-label="Navegação expressa por teclado"
        className="sheet mt-5 px-6 py-4 flex items-center gap-4 flex-wrap"
      >
        <span
          aria-hidden="true"
          className="w-9 h-9 grid place-items-center rounded-lg bg-[var(--color-paper-2)] shrink-0"
        >
          <Keyboard size={16} strokeWidth={1.6} className="text-[var(--color-ink-2)]" />
        </span>
        <div className="min-w-0">
          <p className="text-[length:var(--text-sm)] font-semibold text-[var(--color-ink)]">Navegação Expressa por Teclado</p>
          <p className="text-[length:var(--text-xs)] text-[var(--color-muted)]">
            Agilize a rotina registral — os atalhos funcionam em qualquer tela da aplicação.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {SHORTCUTS.slice(0, 4).map((s) => (
            <span key={s.combo + s.label} className="flex items-center gap-1.5">
              <kbd className="pill font-[var(--font-outlier)] !font-normal">{s.combo}</kbd>
              <span className="text-[length:var(--text-xs)] text-[var(--color-muted)] hidden lg:inline">{s.label}</span>
            </span>
          ))}
          <button type="button" className="btn btn--sm" aria-label="Abrir lista de atalhos no menu superior">
            Menu superior → Atalhos
          </button>
        </div>
      </section>
    </div>
  );
}
