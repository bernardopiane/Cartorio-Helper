import { useEffect, useRef, useState } from 'react';
import { Keyboard } from 'lucide-react';
import { SHORTCUTS } from '../../hooks/useShortcuts.js';

/* The single chrome element of the top bar: shows the express-navigation
 * shortcuts and lets the user see them at any time (Atalhos menu). */
export default function TopBar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="h-16 shrink-0 bg-[var(--color-sheet)] border-b border-[var(--color-rule)] flex items-center gap-3 px-6">
      <span
        aria-hidden="true"
        className="w-7 h-7 shrink-0 grid place-items-center rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-sidebar)] font-[var(--font-outlier)] text-[10px] font-medium leading-none"
      >
        CH
      </span>
      <p className="text-[var(--text-md)] font-[var(--font-display)] font-semibold text-[var(--color-ink)] tracking-[-0.01em]">
        Cartório Helper
      </p>

      <div className="relative ml-auto" ref={menuRef}>
        <button
          type="button"
          className="btn btn--sm"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((v) => !v)}
        >
          <Keyboard size={15} strokeWidth={1.6} aria-hidden="true" />
          Atalhos
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Navegação expressa por teclado"
            className="absolute right-0 top-[calc(100%+8px)] z-[var(--z-dropdown)] w-72 rounded-[var(--radius-card)] bg-[var(--color-sheet)] shadow-[0_2px_6px_rgb(20_22_52/0.08),0_20px_40px_-16px_rgb(20_22_52/0.25)] border border-[var(--color-rule)] p-4"
          >
            <p className="text-[var(--text-xs)] font-[var(--font-outlier)] tracking-[0.08em] uppercase text-[var(--color-muted)] mb-2">
              Navegação expressa
            </p>
            <ul className="divide-y divide-[var(--color-rule)]">
              {SHORTCUTS.map((s) => (
                <li key={s.combo} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-[var(--text-sm)] text-[var(--color-ink-2)]">{s.label}</span>
                  <kbd className="pill font-[var(--font-outlier)] num !font-normal">{s.combo}</kbd>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
