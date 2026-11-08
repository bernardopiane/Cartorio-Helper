// Alt-key express navigation ("Navegação Expressa por Teclado").
// Pure mapping + one global listener owned by useKeyboardShortcuts, which is
// mounted once in NavigationLayout (not per page).

export const SHORTCUTS = [
  { combo: 'Alt+U', key: 'u', label: 'Upload de Arquivos XML', path: '/upload' },
  { combo: 'Alt+F', key: 'f', label: 'Formatador de Texto', path: '/formatter' },
  { combo: 'Alt+E', key: 'e', label: 'Gerador de Etiquetas', path: '/etiquetas' },
  { combo: 'Alt+L', key: 'l', label: 'Leitor de Certidões PDF', path: '/certidao' },
  { combo: 'Alt+C', key: 'c', label: 'Consulta CRM / CREMERJ', path: '/consulta' },
  { combo: 'Alt+N', key: 'n', label: 'Nova Averbação', path: '/etiquetas' },
];

export function findShortcut(e) {
  if (!e.altKey || e.ctrlKey || e.metaKey) return null;
  const k = (e.key || '').toLowerCase();
  if (!k || k.length !== 1) return null;
  return SHORTCUTS.find((s) => s.key === k) || null;
}

// true when the event target is an editable field — shortcuts must not steal typing
export function isTypingTarget(e) {
  const t = e.target;
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
}
