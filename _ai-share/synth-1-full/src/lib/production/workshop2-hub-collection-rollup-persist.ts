/**
 * Wave 21 #1 + wave 35: PG rollup хаба (collection-scoped) + gates sample/handoff/export.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';
import type { Workshop2HubPgMetrics } from '@/lib/production/workshop2-hub-pg-metrics';

export type Workshop2HubRollupCollectionCounts = {
  articles: number;
  dossiers: number;
  sampleOrders: number;
  events?: number;
};

export function buildWorkshop2HubCollectionRollupMirror(input: {
  collectionId: string;
  metrics: Workshop2HubPgMetrics;
  /** Wave 35: счётчики только по collection_id (серверный API). */
  collectionCounts?: Workshop2HubRollupCollectionCounts | null;
  /** Источник метрик: pg_primary = серверный rollup без LS. */
  metricsSource?: 'pg_primary' | 'ls_fallback';
}): NonNullable<Workshop2DossierPhase1['hubCollectionRollupMirror']> {
  const counts = input.metrics.counts;
  const postgres = input.metrics.postgres;
  const coll = input.collectionCounts;
  const metricsSource =
    input.metricsSource ?? (postgres === 'ok' && coll ? 'pg_primary' : 'ls_fallback');
  const serverRollupEnabled = metricsSource === 'pg_primary' && postgres === 'ok';

  const dossierCount = coll?.dossiers ?? counts?.dossiers ?? 0;
  const articleCount = coll?.articles ?? counts?.articles ?? 0;
  const sampleOrderCount = coll?.sampleOrders ?? counts?.sampleOrders ?? 0;
  const eventCount = coll?.events;

  let hintRu: string | undefined;
  if (postgres !== 'ok') {
    hintRu = 'PG rollup хаба недоступен — метрики коллекции только из localStorage.';
  } else if (metricsSource === 'ls_fallback') {
    hintRu = 'Rollup из LS — нажмите «Rollup PG → досье» на хабе для server-only метрик.';
  } else if (dossierCount === 0) {
    hintRu = 'В PG нет досье коллекции — проверьте seed/migrations.';
  }

  const blockerHandoff = postgres !== 'ok' || metricsSource === 'ls_fallback';
  const blockerSampleOrder = postgres !== 'ok' || metricsSource === 'ls_fallback';

  return {
    mirroredAt: new Date().toISOString(),
    collectionId: input.collectionId.trim(),
    postgres,
    metricsSource,
    serverRollupEnabled,
    dossierCount,
    articleCount,
    sampleOrderCount,
    eventCount,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function persistWorkshop2HubCollectionRollupMirrorToDossier(
  dossier: Workshop2DossierPhase1,
  input: {
    collectionId: string;
    metrics: Workshop2HubPgMetrics;
    collectionCounts?: Workshop2HubRollupCollectionCounts | null;
    metricsSource?: 'pg_primary' | 'ls_fallback';
  }
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    hubCollectionRollupMirror: buildWorkshop2HubCollectionRollupMirror(input),
  };
}

/** Wave 35: export-tz — rollup должен быть pg_primary. */
export function evaluateWorkshop2HubRollupExportGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.hubCollectionRollupMirror;
  if (!mirror) {
    return {
      id: 'hub.rollup.export_missing',
      severity: 'warning',
      messageRu: 'ZIP ТЗ: PG rollup не в досье — синхронизируйте с хаба.',
    };
  }
  if (!mirror.serverRollupEnabled || mirror.metricsSource === 'ls_fallback') {
    return {
      id: 'hub.rollup.export_ls_fallback',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ??
        'ZIP ТЗ: rollup не server-only — «Rollup PG → досье».',
    };
  }
  return null;
}

export function evaluateWorkshop2HubRollupSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.hubCollectionRollupMirror;
  if (!mirror) {
    return {
      id: 'hub.rollup.mirror_missing',
      severity: 'warning',
      messageRu: 'PG rollup хаба не зафиксирован в досье — откройте артикул после загрузки хаба.',
    };
  }
  if (mirror.blockerSampleOrder) {
    return {
      id: 'hub.rollup.pg_down',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ??
        'PG rollup хаба недоступен — заказ образца на сервере заблокирован.',
    };
  }
  if (mirror.postgres === 'ok' && mirror.dossierCount === 0) {
    return {
      id: 'hub.rollup.no_dossiers',
      severity: 'warning',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ??
        'В PostgreSQL 0 досье — заказ образца возможен, но audit коллекции не на сервере.',
    };
  }
  return null;
}

export function evaluateWorkshop2HubRollupHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.hubCollectionRollupMirror;
  if (!mirror) return null;
  if (!mirror.blockerHandoff) return null;
  return {
    id: 'hub.rollup.pg_down',
    severity: 'blocker',
    messageRu:
      workshop2PgMirrorStr(mirror, 'hintRu') ??
      'PG rollup хаба недоступен — handoff commit заблокирован до восстановления PG.',
  };
}
