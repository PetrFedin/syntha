import { LIVE_PROCESS_RUNTIME_STORAGE_PREFIX } from '@/lib/live-process/use-live-process-runtime';

/** Wave XR · brand LIVE process runtime — PG SoT (`platform_core_live_workflow_store` via workflow store). */

export const BRAND_PROCESS_RUNTIME_API_BASE = '/api/processes';

export const BRAND_PROCESS_RUNTIME_PG_BADGE_RU = 'PostgreSQL';
export const BRAND_PROCESS_RUNTIME_PG_UNAVAILABLE_RU = 'PG недоступен';
export const BRAND_PROCESS_RUNTIME_CORE_HINT_RU =
  'Platform Core: прогресс этапов только через API → PostgreSQL — без localStorage.';

export const BRAND_PROCESS_RUNTIME_LS_KEY = LIVE_PROCESS_RUNTIME_STORAGE_PREFIX;

export function brandProcessRuntimeApi(processId: string, contextId = 'default'): string {
  const ctx = contextId.trim() || 'default';
  return `${BRAND_PROCESS_RUNTIME_API_BASE}/${encodeURIComponent(processId)}/runtime?contextId=${encodeURIComponent(ctx)}`;
}
