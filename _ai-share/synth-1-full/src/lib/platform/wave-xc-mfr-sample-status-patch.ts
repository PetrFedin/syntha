/**
 * Wave XC — mfr sample queue: factory PATCH, hash-scroll to item, PG mirror bump, RU poll meta.
 */
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import { ROUTES } from '@/lib/routes';
import { formatPlatformCoreSampleStatusLabelRu } from '@/lib/platform/wave-wz-ru-noise-dedup-final';

export const WAVE_XC_FACTORY_SAMPLE_PATCH_API = '/api/workshop2/factory/sample-queue/';

export const WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH = 'sample-queue';

export const WAVE_XC_MFR_SAMPLE_QUEUE_POLL_BADGE_TESTID = 'mfr-dev-sample-queue-poll-badge';
export const WAVE_XC_FACTORY_SAMPLE_QUEUE_ITEM_TESTID = 'factory-w2-sample-queue-item';
export const WAVE_XC_FACTORY_SAMPLE_IN_PROGRESS_BTN_TESTID = 'factory-sample-in-progress-button';
export const WAVE_XC_FACTORY_SAMPLE_ACK_BTN_TESTID = 'factory-sample-ack-button';

export const WAVE_XC_MFR_SAMPLE_QUEUE_POLL_SSE_RU = 'SSE онлайн';
export const WAVE_XC_MFR_SAMPLE_QUEUE_POLL_FALLBACK_RU = 'Опрос 15с';
export const WAVE_XC_MFR_SAMPLE_QUEUE_SOURCE_PREFIX_RU = 'Источник';
export const WAVE_XC_MFR_SAMPLE_QUEUE_LOADING_RU = 'Загрузка очереди…';
export const WAVE_XC_MFR_SAMPLE_QUEUE_EMPTY_RU = 'Нет активных заказов образцов для цеха.';
export const WAVE_XC_MFR_SAMPLE_QUEUE_COUNT_SUFFIX_RU = 'в очереди';

export function factorySampleQueueItemDomId(orderId: string): string {
  return `${WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH}-${encodeURIComponent(orderId.trim())}`;
}

export function factorySampleQueueItemHash(orderId: string): string {
  return factorySampleQueueItemDomId(orderId);
}

export type FactorySampleQueueHashTarget = {
  section: typeof WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH;
  orderId?: string;
};

/** Parse location hash `#sample-queue` or `#sample-queue-{orderId}`. */
export function parseFactorySampleQueueHash(raw: string | null | undefined): FactorySampleQueueHashTarget | null {
  const h = (raw ?? '').replace(/^#/, '').trim();
  if (!h) return null;
  if (h === WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH) {
    return { section: WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH };
  }
  const prefix = `${WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH}-`;
  if (h.startsWith(prefix)) {
    try {
      const orderId = decodeURIComponent(h.slice(prefix.length)).trim();
      return orderId
        ? { section: WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH, orderId }
        : { section: WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH };
    } catch {
      return { section: WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH };
    }
  }
  return null;
}

export function factorySampleQueueDeepHref(input: {
  collectionId: string;
  articleId?: string;
  factoryId?: string;
  orderId?: string;
}): string {
  const sp = new URLSearchParams();
  sp.set('collection', input.collectionId.trim());
  if (input.articleId?.trim()) sp.set('article', input.articleId.trim());
  if (input.factoryId?.trim()) sp.set('factoryId', input.factoryId.trim());
  sp.set(PILLAR_CAPABILITY_FEATURE_PARAM, WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH);
  const hash = input.orderId?.trim()
    ? factorySampleQueueItemHash(input.orderId)
    : WAVE_XC_FACTORY_SAMPLE_QUEUE_SECTION_HASH;
  return `${ROUTES.factory.production}?${sp.toString()}#${hash}`;
}

export function formatMfrSampleQueueStatusLabelRu(status: string | null | undefined): string {
  return formatPlatformCoreSampleStatusLabelRu(status);
}

export function mfrSampleQueuePollLabelRu(sseConnected: boolean): string {
  return sseConnected ? WAVE_XC_MFR_SAMPLE_QUEUE_POLL_SSE_RU : WAVE_XC_MFR_SAMPLE_QUEUE_POLL_FALLBACK_RU;
}
