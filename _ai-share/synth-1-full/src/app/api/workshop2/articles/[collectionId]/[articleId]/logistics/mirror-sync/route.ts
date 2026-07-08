/**
 * POST wave 35 #65: PG logistics journal → logisticsShipmentMirror в досье.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { NextRequest, NextResponse } from 'next/server';
import { persistWorkshop2LogisticsShipmentMirrorToDossier } from '@/lib/production/workshop2-logistics-dossier-persist';
import { listWorkshop2LogisticsShipments } from '@/lib/server/workshop2-logistics-repository';
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

  const record = await getWorkshop2ServerDossierRecord(cid, aid);
  if (!record) {
    return jsonWorkshop2ErrorRu(404, 'dossier_not_found');
  }

  const shipments = await listWorkshop2LogisticsShipments({
    collectionId: cid,
    articleId: aid,
  });
  const primary = shipments[0];
  const activeRaw = record.dossier.sampleWorkflow?.activeSampleOrderId;
  const activeOrderId = typeof activeRaw === 'string' ? activeRaw.trim() : '';
  const linked =
    shipments.some((s) => s.sampleOrderId?.trim() === activeOrderId) ||
    Boolean(primary?.sampleOrderId?.trim());

  const actor = resolveWorkshop2UpdatedBy(req, '', auth.actor) ?? 'logistics-mirror-api';
  const nextDossier = persistWorkshop2LogisticsShipmentMirrorToDossier(record.dossier, {
    shipmentCount: shipments.length,
    linkedToSampleOrder: linked,
    currentStep: primary?.currentStep,
    status: primary?.status,
  });

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: cid,
    articleId: aid,
    dossier: nextDossier,
    updatedBy: actor,
    txMeta: { eventType: 'workshop2_logistics_mirror_sync' },
  });

  if (!saved.ok) {
    return jsonWorkshop2ErrorRu(
      workshop2DossierPutFailureStatus(saved),
      workshop2DossierPutFailureMessageRu(saved)
    );
  }

  return NextResponse.json({
    ok: true,
    mirror: nextDossier.logisticsShipmentMirror,
    dossierVersion: saved.record.version,
    shipmentCount: shipments.length,
  });
}
