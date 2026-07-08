/**
 * POST wave 35 #8: PG dossier events → hubActivityMirror в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import type { Workshop2ActivityEntry } from '@/lib/production/workshop2-activity-log';
import { persistWorkshop2HubActivityMirrorToDossier } from '@/lib/production/workshop2-hub-activity-dossier-persist';
import { listWorkshop2DossierEvents } from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  workshop2DossierPutFailureMessageRu,
  workshop2DossierPutFailureStatus,
} from '@/lib/server/workshop2-dossier-put-utils';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
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

  let limit = 25;
  try {
    const body = (await req.json()) as { limit?: number };
    if (typeof body.limit === 'number' && body.limit > 0 && body.limit <= 100) {
      limit = body.limit;
    }
  } catch {
    /* empty body OK */
  }

  const events = await listWorkshop2DossierEvents({ collectionId: cid, articleId: aid, limit });
  const entries: Workshop2ActivityEntry[] = events.map((e, i) => ({
    id: e.id ? `srv-${e.id}` : `srv-${i}`,
    at: e.createdAt,
    line: e.eventType,
    collectionId: cid,
    articleId: aid,
  }));
  const lastEventType = events[0]?.eventType;

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'hub-activity-api';
  const nextDossier = persistWorkshop2HubActivityMirrorToDossier(record.dossier, {
    entries,
    lastEventType,
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: nextDossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_hub_activity_mirror_sync' },
  });

  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  return NextResponse.json({
    ok: true,
    mirror: nextDossier.hubActivityMirror,
    dossierVersion: saved.record.version,
    eventCount: entries.length,
  });
}
