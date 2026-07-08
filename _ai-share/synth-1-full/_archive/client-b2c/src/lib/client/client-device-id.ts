const KEY = 'synth.clientDeviceId.v1';

/**
 * Стабильный анонимный id для server-side снимков без авторизации.
 */
export function getOrCreateClientDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    const e = localStorage.getItem(KEY);
    if (e && e.length > 8) return e;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return `fallback-${Date.now()}`;
  }
}
