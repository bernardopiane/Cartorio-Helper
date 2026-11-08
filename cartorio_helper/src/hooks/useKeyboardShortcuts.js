import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findShortcut, isTypingTarget } from './useShortcuts.js';

// Registers the Alt-key navigation listener exactly once, for the whole app —
// mounted from NavigationLayout, so no per-instance listener pile-up.
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat || isTypingTarget(e)) return;
      const hit = findShortcut(e);
      if (!hit) return;
      e.preventDefault();
      navigate(hit.path);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);
}
