/**
 * Wave ZE — hub diagnostics RU microcopy pass 3: trim English PG/API/SSE noise in compact pillar cards.
 * E2E: core-246-wave-ze-ru.spec.ts
 */

import type { Workshop2PublishedArticlesReadPath } from '@/lib/production/workshop2-pg-source-stats';

export const WAVE_ZE_E2E_SPEC = 'core-246-wave-ze-ru.spec.ts';

export const WAVE_ZE_READ_PATH_API_BADGE_RU = 'Список из базы';
export const WAVE_ZE_READ_PATH_LS_BADGE_RU = 'Локальный кеш · не канон';

export const WAVE_ZE_PARTNER_COUNT_LOADING_RU = 'Партнёры…';
export const WAVE_ZE_MFR_DEV_MIRROR_BADGE_RU = 'Статус разработки';
export const WAVE_ZE_MFR_DEV_MIRROR_EMPTY_RU = 'Нет шагов статуса разработки для коллекции.';
export const WAVE_ZE_MFR_DEV_PG_UNAVAILABLE_RU =
  'База недоступна — запустите npm run core:bootstrap';

export const WAVE_ZE_SC_COLLECTION_ERROR_RU =
  'Статус коллекции недоступен — проверьте базу и сеть.';

export const WAVE_ZE_DIAGNOSTICS_AUDIT_HINT_RU = 'аудит / поток';
export const WAVE_ZE_VERBOSE_DIAGNOSTICS_RU = 'подробно';

export function formatBrandCoPartnerCountLabelRu(activePartners: number): string {
  return activePartners > 0 ? `${activePartners} партн.` : '0 партн.';
}

export function formatPublishedReadPathBadgeRu(
  readPath: Workshop2PublishedArticlesReadPath
): string {
  return readPath === 'api' ? WAVE_ZE_READ_PATH_API_BADGE_RU : WAVE_ZE_READ_PATH_LS_BADGE_RU;
}

export function formatPublishedReadPathBadgeTitleRu(
  readPath: Workshop2PublishedArticlesReadPath
): string {
  return readPath === 'api'
    ? 'Опубликованные артикулы · из базы'
    : 'Опубликованные артикулы · локальный кеш';
}

/** Mini-matrix hint without SKU/qty/prefill English tokens. */
export function formatBrandScMiniMatrixHintRu(
  articleCount: number,
  carryQtyTotal?: number,
  baseHint?: string
): string {
  if (articleCount <= 0) {
    return 'Опубликуйте артикулы — затем откройте матрицу с подстановкой SKU лайншита.';
  }
  if (carryQtyTotal != null && carryQtyTotal > 0) {
    return `${articleCount} SKU · кол-во ${carryQtyTotal} переносится в матрицу.`;
  }
  return baseHint ? `${articleCount} SKU · ${baseHint}` : `${articleCount} SKU`;
}

/** Raw storage mode suffix — audit-only diagnostic chip on brand CO cabinet. */
export function formatHubCabinetPartnerStorageModeSuffixRu(
  mode: string | null | undefined,
  auditUi: boolean
): string {
  if (!auditUi || !mode?.trim()) return '';
  const raw = mode.trim().toLowerCase();
  if (raw === 'pg' || raw === 'postgres') return '';
  const map: Record<string, string> = {
    file: 'файл',
    memory: 'память',
    local: 'локально',
  };
  const label = map[raw] ?? raw;
  return ` · ${label}`;
}
