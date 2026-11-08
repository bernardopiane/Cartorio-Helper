// App-local persistence behind the offline contract: versioned keys, wrapped
// reads/writes that never throw (incognito, disabled, or quota-full storage
// degrades to "workflow simply doesn't persist" instead of breaking the app).
const PREFIX = 'ch';

export function loadState(name) {
  try {
    const raw = localStorage.getItem(`${PREFIX}-${name}:v1`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveState(name, value) {
  try {
    if (value == null) localStorage.removeItem(`${PREFIX}-${name}:v1`);
    else localStorage.setItem(`${PREFIX}-${name}:v1`, JSON.stringify(value));
  } catch {
    // storage unavailable; keep going
  }
}
