/**
 * Wave YV — mfr empty SC/CO panels final polish (dedupe wave VS/SK).
 * Read-only publish status + incoming handoff count; compact RU labels.
 */

/** Wave SK/VS badge testids — canonical SoT for YV. */
export const MFR_EMPTY_SC_PUBLISH_BADGE_TESTID = 'mfr-empty-sc-publish-badge' as const;
export const MFR_EMPTY_CO_HANDOFF_COUNT_BADGE_TESTID = 'mfr-empty-co-handoff-count-badge' as const;

/** Compact read-only panel wrappers (wave YV). */
export const MFR_EMPTY_SC_PUBLISH_STATUS_PANEL_TESTID =
  'mfr-empty-sc-publish-status-panel' as const;
export const MFR_EMPTY_CO_HANDOFF_COUNT_PANEL_TESTID = 'mfr-empty-co-handoff-count-panel' as const;

export const MFR_EMPTY_HANDOFF_QUEUE_API_PATH =
  '/api/workshop2/factory/production-handoff-queue' as const;

export const WAVE_YV_MFR_PUBLISH_BADGE_PREFIX_RU = 'Опубликовано брендом' as const;
export const WAVE_YV_MFR_HANDOFF_QUEUE_COUNT_RU = 'В очереди' as const;
export const WAVE_YV_MFR_HANDOFF_QUEUE_EMPTY_RU = 'Очередь пуста' as const;

/** VS dedup: badge only when brand published articles — no «Готово для байеров» duplicate. */
export function shouldShowMfrEmptyPublishBadge(publishedCount: number): boolean {
  return publishedCount > 0;
}

export function formatMfrEmptyPublishBadgeRu(publishedCount: number): string | null {
  if (!shouldShowMfrEmptyPublishBadge(publishedCount)) return null;
  return `${WAVE_YV_MFR_PUBLISH_BADGE_PREFIX_RU} · ${publishedCount} арт.`;
}

export function formatMfrEmptyHandoffCountBadgeRu(count: number): string {
  return count > 0
    ? `${WAVE_YV_MFR_HANDOFF_QUEUE_COUNT_RU}: ${count}`
    : WAVE_YV_MFR_HANDOFF_QUEUE_EMPTY_RU;
}

export function mfrEmptyHandoffQueueApiHref(factoryId: string): string {
  return `${MFR_EMPTY_HANDOFF_QUEUE_API_PATH}?factoryId=${encodeURIComponent(factoryId.trim())}`;
}
