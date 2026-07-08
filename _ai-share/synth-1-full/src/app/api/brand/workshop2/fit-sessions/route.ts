import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import type { FitSession } from '@/lib/production/article-workspace/types';
import {
  readWorkshop2FitGoldSessionsFromDossier,
  upsertWorkshop2FitGoldSessionOnDossier,
} from '@/lib/production/workshop2-fit-sessions-dossier-update';
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

function resolveContext(
  req: Request,
  body?: Record<string, unknown>
): { collectionId: string; articleId: string } | null {
  const { searchParams } = new URL(req.url);
  const collectionId = String(body?.collectionId ?? searchParams.get('collectionId') ?? '').trim();
  const articleId = String(body?.articleId ?? searchParams.get('articleId') ?? '').trim();
  if (!collectionId || !articleId) return null;
  return { collectionId, articleId };
}

export const GET = withWorkshop2ApiErrorRu(async function getFitSessions(req: NextRequest) {
  const ctx = resolveContext(req);
  if (!ctx) {
    return NextResponse.json({ error: 'dossier_required' }, { status: 503 });
  }

  const record = await getWorkshop2ServerDossierRecord(ctx.collectionId, ctx.articleId);
  if (!record) {
    return NextResponse.json({ sessions: [] });
  }

  const sessions = readWorkshop2FitGoldSessionsFromDossier(record.dossier, ctx.articleId);
  return NextResponse.json({ sessions });
});

export const POST = withWorkshop2ApiErrorRu(async function postFitSession(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }

  const ctx = resolveContext(req, body);
  if (!ctx) {
    return NextResponse.json({ error: 'dossier_required' }, { status: 503 });
  }

  const session = body as Partial<FitSession>;
  const sampleType = session.sampleType;
  if (!sampleType || !['proto', 'sms', 'pps', 'top'].includes(sampleType) || !session.dateStr) {
    return jsonWorkshop2ErrorRu(400, 'invalid_body', {
      messageRu: 'Нужны sampleType и dateStr.',
    });
  }

  const record = await getWorkshop2ServerDossierRecord(ctx.collectionId, ctx.articleId);
  if (!record) return jsonWorkshop2ErrorRu(404, 'not_found');

  const fitSession: FitSession = {
    id: String(session.id ?? globalThis.crypto.randomUUID()),
    sampleType,
    status: session.status ?? 'pending',
    dateStr: String(session.dateStr),
    measurementsDelta: session.measurementsDelta ?? {},
    comments: session.comments ?? [],
    cadVersionId: session.cadVersionId ?? null,
    photoVaultDocumentId: session.photoVaultDocumentId,
    aiFitAnalysis: session.aiFitAnalysis,
  };

  const nextDossier = upsertWorkshop2FitGoldSessionOnDossier({
    dossier: record.dossier,
    articleId: ctx.articleId,
    session: fitSession,
  });

  const actor =
    resolveWorkshop2UpdatedBy(req, String(body.actor ?? ''), auth.actor) ?? 'brand-fit-session';

  const saved = await putWorkshop2ServerDossierRecord({
    collectionId: ctx.collectionId,
    articleId: ctx.articleId,
    dossier: nextDossier,
    baseVersion: record.version,
    updatedBy: actor,
    txMeta: {
      eventType: 'dossier.fit_session',
      eventPayload: { sessionId: fitSession.id, sampleType },
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
    payload: { source: 'fit_session', sessionId: fitSession.id },
    dispatchNow: true,
  }).catch(() => {});

  return NextResponse.json({ success: true, session: fitSession }, { status: 201 });
});
