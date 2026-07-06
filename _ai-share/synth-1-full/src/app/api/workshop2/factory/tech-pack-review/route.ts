/**
 * POST /api/workshop2/factory/tech-pack-review — pins + accept/reject → PG dossier.
 */
import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { applyWorkshop2FactoryTechPackReview } from '@/lib/production/workshop2-factory-tech-pack-review';
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

export async function POST(req: NextRequest) {
  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES);
  if (auth instanceof NextResponse) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const collectionId = String(b.collectionId ?? '').trim();
  const articleId = String(b.articleId ?? '').trim();
  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_context', {
      messageRu: 'Укажите collectionId и articleId.',
    });
  }

  const action = String(b.action ?? '').trim();
  const actor =
    resolveWorkshop2UpdatedBy(req, String(b.actor ?? ''), auth.actor) ?? 'factory-tech-pack-review';

  const record = await getWorkshop2ServerDossierRecord(collectionId, articleId);
  if (!record) return jsonWorkshop2ErrorRu(404, 'not_found');

  if (action === 'pin') {
    const text = String(b.text ?? '').trim();
    const xPct = Number(b.xPct);
    const yPct = Number(b.yPct);
    if (!text || !Number.isFinite(xPct) || !Number.isFinite(yPct)) {
      return jsonWorkshop2ErrorRu(400, 'invalid_body', {
        messageRu: 'Для pin нужны text, xPct, yPct.',
      });
    }
    const applied = applyWorkshop2FactoryTechPackReview({
      dossier: record.dossier,
      actor,
      pin: { text, xPct, yPct },
    });
    const saved = await putWorkshop2ServerDossierRecord({
      collectionId,
      articleId,
      dossier: applied.dossier,
      baseVersion: record.version,
      updatedBy: actor,
      txMeta: {
        eventType: 'factory.tech_pack_pin',
        eventPayload: { pinId: applied.pinId },
      },
    });
    if (!saved.ok) {
      return NextResponse.json(workshop2DossierPutFailureBody(saved), {
        status: workshop2DossierPutFailureStatus(saved),
      });
    }
    bumpPlatformCoreDevelopmentStatus([collectionId]);
    void enqueueWorkshop2DomainEvent({
      type: 'dossier.gate_passed',
      collectionId,
      articleId,
      payload: { source: 'factory_tech_pack_pin', pinId: applied.pinId },
      dispatchNow: true,
    }).catch(() => {});
    return NextResponse.json({ ok: true, pinId: applied.pinId });
  }

  if (action === 'accept' || action === 'reject') {
    const comment = b.comment != null ? String(b.comment) : undefined;
    const applied = applyWorkshop2FactoryTechPackReview({
      dossier: record.dossier,
      actor,
      decision: action === 'accept' ? 'accepted' : 'rejected',
      comment,
    });
    const saved = await putWorkshop2ServerDossierRecord({
      collectionId,
      articleId,
      dossier: applied.dossier,
      baseVersion: record.version,
      updatedBy: actor,
      txMeta: {
        eventType: 'factory.tech_pack_review',
        eventPayload: { decision: action, handoffId: applied.handoffId ?? null },
      },
    });
    if (!saved.ok) {
      return NextResponse.json(workshop2DossierPutFailureBody(saved), {
        status: workshop2DossierPutFailureStatus(saved),
      });
    }
    bumpPlatformCoreDevelopmentStatus([collectionId]);
    void enqueueWorkshop2DomainEvent({
      type: 'dossier.gate_passed',
      collectionId,
      articleId,
      payload: {
        source: 'factory_tech_pack_review',
        decision: action,
        handoffId: applied.handoffId ?? null,
      },
      dispatchNow: true,
    }).catch(() => {});
    return NextResponse.json({
      ok: true,
      decision: action,
      handoffId: applied.handoffId ?? null,
    });
  }

  return jsonWorkshop2ErrorRu(400, 'invalid_action', {
    messageRu: 'action: pin | accept | reject',
  });
}
