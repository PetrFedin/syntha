import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { buildWorkshop2LabDipsFromDossier } from '@/lib/production/workshop2-lab-dip-from-dossier';
import {
  applyWorkshop2LabDipStatusUpdate,
  parseWorkshop2LabDipId,
} from '@/lib/production/workshop2-lab-dip-dossier-update';
import { syncColorLabDipStatusesFromColorways } from '@/lib/production/workshop2-colorway-lab-dip-sync';
import { LabDipStatusSchema } from '@/lib/types/material-engineering';
import { bumpPlatformCoreDevelopmentStatus } from '@/lib/server/platform-core-development-status-hub';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import {
  getWorkshop2ServerDossierRecord,
  putWorkshop2ServerDossierRecord,
} from '@/lib/server/workshop2-phase1-dossier-server-store';
import {
  workshop2DossierPutFailureBody,
  workshop2DossierPutFailureStatus,
} from '@/lib/server/workshop2-dossier-put-utils';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';

function resolveDossierContext(
  req: Request,
  body?: Record<string, unknown>
): { collectionId: string; articleId: string; materialId?: string } | null {
  const { searchParams } = new URL(req.url);
  const collectionId = String(body?.collectionId ?? searchParams.get('collectionId') ?? '').trim();
  const articleId = String(body?.articleId ?? searchParams.get('articleId') ?? '').trim();
  if (!collectionId || !articleId) return null;
  const materialId = String(body?.materialId ?? searchParams.get('materialId') ?? '').trim();
  return { collectionId, articleId, materialId: materialId || undefined };
}

export const GET = withWorkshop2ApiErrorRu(async function getLabDips(req: NextRequest) {
  const ctx = resolveDossierContext(req);
  if (!ctx) {
    return NextResponse.json({ error: 'dossier_required' }, { status: 503 });
  }

  const record = await getWorkshop2ServerDossierRecord(ctx.collectionId, ctx.articleId);
  if (!record) {
    return NextResponse.json({ labDips: [] });
  }

  const synced = syncColorLabDipStatusesFromColorways(record.dossier);
  const labDips = buildWorkshop2LabDipsFromDossier(synced.dossier, {
    materialId: ctx.materialId,
    updatedAtIso: record.updatedAt,
  });
  return NextResponse.json({ labDips, syncedKeys: synced.addedKeys });
});

export const POST = withWorkshop2ApiErrorRu(async function postLabDipStatus(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const ctx = resolveDossierContext(req, body);
  if (!ctx) {
    return NextResponse.json({ error: 'dossier_required' }, { status: 503 });
  }

  const id = String(body.id ?? '').trim();
  const statusParsed = LabDipStatusSchema.safeParse(body.status);
  if (!id || !statusParsed.success) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', {
      messageRu: 'Нужны id и status (pending|approved|rejected).',
    });
  }

  const parsedId = parseWorkshop2LabDipId(id);
  if (!parsedId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', { messageRu: 'Некорректный id lab dip.' });
  }

  const record = await getWorkshop2ServerDossierRecord(ctx.collectionId, ctx.articleId);
  if (!record) return jsonWorkshop2ErrorRu(404, 'not_found');

  const synced = syncColorLabDipStatusesFromColorways(record.dossier);
  const nextDossier = applyWorkshop2LabDipStatusUpdate({
    dossier: synced.dossier,
    paletteCode: parsedId.paletteCode,
    status: statusParsed.data,
  });

  const actor =
    resolveWorkshop2UpdatedBy(req, String(body.actor ?? ''), auth.actor) ?? 'brand-lab-dip';

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: ctx.collectionId,
    articleId: ctx.articleId,
    dossier: nextDossier,
    baseVersion: record.version,
    updatedBy: actor,
    txMeta: {
      eventType: 'dossier.lab_dip_status',
      eventPayload: {
        labDipId: id,
        paletteCode: parsedId.paletteCode,
        status: statusParsed.data,
      },
    },
  });

  if (!saved.ok) {
    return NextResponse.json(workshop2DossierPutFailureBody(saved), {
      status: workshop2DossierPutFailureStatus(saved),
    });
  }

  bumpPlatformCoreDevelopmentStatus([ctx.collectionId]);
  void enqueueWorkshop2DomainEvent({
    type: 'dossier.gate_passed',
    collectionId: ctx.collectionId,
    articleId: ctx.articleId,
    payload: {
      source: 'lab_dip_status',
      labDipId: id,
      status: statusParsed.data,
    },
    dispatchNow: true,
  }).catch(() => {});

  const labDips = buildWorkshop2LabDipsFromDossier(nextDossier, {
    materialId: ctx.materialId,
  });

  return NextResponse.json({ ok: true, labDips });
});
