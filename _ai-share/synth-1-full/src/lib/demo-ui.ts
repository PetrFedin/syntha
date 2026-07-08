import { ENABLE_BACKEND_HTTP } from '@/lib/syntha-api-mode';

/** Единый текст отметки в UI */
export const SYNTHA_DEMO_BADGE_LABEL = 'Демо';

/**
 * Показывать отметку «Демо» в хабах и на экранах с мок-данными.
 * По умолчанию: да, пока не включён боевой HTTP к бэкенду (`USE_FASTAPI` / `USE_PRODUCTION_DATA_HTTP`).
 * Скрыть везде: `NEXT_PUBLIC_SYNTHA_HIDE_DEMO_UI=true`.
 */
export function showSynthaDemoUiMarker(): boolean {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SYNTHA_HIDE_DEMO_UI === 'true') {
    return false;
  }
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE === '1') {
    return false;
  }
  return !ENABLE_BACKEND_HTTP;
}
