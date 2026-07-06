import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  appendWorkshop2MaterialPhysicalTestLog,
  buildWorkshop2MaterialPhysicalTestLogsFromDossier,
} from '@/lib/production/workshop2-material-testing-dossier-persist';
import { CreatePhysicalTestLogSchema } from '@/lib/types/material-testing';
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
  const collectionId =
    String(body?.collectionId ?? searchParams.get('collectionId') ?? '').trim();
  const articleId = String(body?.articleId ?? searchParams.get('articleId') ?? '').trim();
  if (!collectionId || !articleId) return null;
  const materialId = String(body?.materialId ?? searchParams.get('materialId') ?? '').trim();
  return { collectionId, articleId, materialId: materialId || undefined };
}

export const GET = withWorkshop2ApiErrorRu(async function getMaterialTesting(req: NextRequest) {
  const ctx = resolveDossierContext(req);
  if (!ctx) {
    return NextResponse.json({ error: 'dossier_required' }, { status: 503 });
  }

  const record = await getWorkshop2ServerDossierRecord(ctx.collectionId, ctx.articleId);
  if (!record) {
    return NextResponse.json({ testingLogs: [] });
  }

  const testingLogs = buildWorkshop2MaterialPhysicalTestLogsFromDossier(record.dossier, {
    materialId: ctx.materialId,
  });
  return NextResponse.json({ testingLogs });
});

export const POST = withWorkshop2ApiErrorRu(async function postMaterialTesting(req: NextRequest) {
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

  const parsed = CreatePhysicalTestLogSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body');
  }

  const record = await getWorkshop2ServerDossierRecord(ctx.collectionId, ctx.articleId);
  if (!record) return jsonWorkshop2ErrorRu(404, 'not_found');

  const log = {
    id: `mt-${parsed.data.materialId}-${Date.now()}`,
    materialId: parsed.data.materialId,
    testCategory: parsed.data.testCategory,
    resultValue: parsed.data.resultValue,
    isPass: parsed.data.isPass,
    testedAt: new Date().toISOString(),
    notes: parsed.data.notes,
  };

  const nextDossier = appendWorkshop2MaterialPhysicalTestLog({
    dossier: record.dossier,
    log,
  });

  const actor =
    resolveWorkshop2UpdatedBy(req, String(body.actor ?? ''), auth.actor) ?? 'brand-material-test';

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: ctx.collectionId,
    articleId: ctx.articleId,
    dossier: nextDossier,
    baseVersion: record.version,
    updatedBy: actor,
    txMeta: {
      eventType: 'dossier.material_test',
      eventPayload: { logId: log.id, materialId: log.materialId, isPass: log.isPass },
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
    payload: { source: 'material_physical_test', logId: log.id, isPass: log.isPass },
    dispatchNow: true,
  }).catch(() => {});

  const testingLogs = buildWorkshop2MaterialPhysicalTestLogsFromDossier(nextDossier, {
    materialId: ctx.materialId,
  });

  return NextResponse.json({ ok: true, testingLog: log, testingLogs });
});
