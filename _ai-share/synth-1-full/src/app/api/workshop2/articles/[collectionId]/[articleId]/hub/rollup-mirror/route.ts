/**
 * POST wave 35 #1: server PG rollup (collection-scoped) → hubCollectionRollupMirror в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import { persistWorkshop2HubCollectionRollupMirrorToDossier } from '@/lib/production/workshop2-hub-collection-rollup-persist';
import {
  loadWorkshop2HubCollectionPgCounts,
  loadWorkshop2HubPgMetricsServer,
} from '@/lib/server/workshop2-hub-pg-metrics-server';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  workshop2DossierPutFailureMessageRu,
  workshop2DossierPutFailureStatus,
} from '@/lib/server/workshop2-dossier-put-utils';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';

type RouteCtx = { params: Promise<{ collectionId: string; articleId: string }> };

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { collectionId, articleId } = await ctx.params;
  const cid = collectionId.trim();
  const aid = articleId.trim();
  if (!cid || !aid) {
    return jsonWorkshop2ErrorRu(400, 'invalid_path');
  }

  const metrics = await loadWorkshop2HubPgMetricsServer();
  const collectionCounts = await loadWorkshop2HubCollectionPgCounts(cid);
  const metricsSource =
    metrics.postgres === 'ok' && collectionCounts ? 'pg_primary' : 'ls_fallback';

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'hub-rollup-api';
  const nextDossier = persistWorkshop2HubCollectionRollupMirrorToDossier(record.dossier, {
    collectionId: cid,
    metrics,
    collectionCounts,
    metricsSource,
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: nextDossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_hub_rollup_mirror_sync' },
  });

  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  return NextResponse.json({
    ok: true,
    mirror: nextDossier.hubCollectionRollupMirror,
    dossierVersion: saved.record.version,
    metricsSource,
  });
}
