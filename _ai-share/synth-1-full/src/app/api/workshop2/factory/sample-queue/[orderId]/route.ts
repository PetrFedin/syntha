/**
 * PATCH — factory sample-queue: ограниченные поля status + note (Wave TZ / XC).
 */
import { NextRequest, NextResponse } from 'next/server';

import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import {
  validateFactorySamplePatch,
  validateFactorySampleStatusTransition,
} from '@/lib/production/workshop2-factory-sample-patch';
import type { Workshop2SampleOrderStatus } from '@/lib/production/workshop2-dossier-phase1.types';
import { bumpPlatformCoreDevelopmentStatus } from '@/lib/server/platform-core-development-status-hub';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import { handleWorkshop2SampleStateChangeWebhook } from '@/lib/server/workshop2-sample-state-change-webhook-handler';
import {
  listWorkshop2SampleOrders,
  transitionWorkshop2SampleOrder,
  updateWorkshop2SampleOrder,
} from '@/lib/server/workshop2-sample-order-repository';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';

type RouteCtx = { params: Promise<{ orderId: string }> };

export const PATCH = withWorkshop2ApiErrorRu(async function patchFactorySampleQueue(
  req: NextRequest,
  ctx: RouteCtx
) {
  const { orderId } = await ctx.params;
  const oid = orderId.trim();
  if (!oid) return jsonWorkshop2ErrorRu(400, 'invalid_path');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWorkshop2ErrorRu(400, 'invalid_json');
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const auth = await guardWorkshop2Route(req, WORKSHOP2_WRITE_ROLES, {
    bodyActorLabel: String(b.actor ?? ''),
  });
  if (auth instanceof NextResponse) return auth;

  const collectionId = String(
    b.collectionId ?? req.nextUrl.searchParams.get('collectionId') ?? ''
  ).trim();
  const articleId = String(b.articleId ?? req.nextUrl.searchParams.get('articleId') ?? '').trim();
  if (!collectionId || !articleId) {
    return jsonWorkshop2ErrorRu(400, 'invalid_context', {
      messageRu: 'Укажите collectionId и articleId.',
    });
  }

  const parsed = validateFactorySamplePatch({
    status: b.status != null ? String(b.status) : undefined,
    note: b.note != null ? String(b.note) : undefined,
  });
  if (!parsed.ok) {
    return jsonWorkshop2ErrorRu(400, 'invalid_patch', { messageRu: parsed.messageRu });
  }

  const orders = await listWorkshop2SampleOrders({ collectionId, articleId });
  const prev = orders.find((o) => o.id === oid);
  if (!prev) return jsonWorkshop2ErrorRu(404, 'not_found');

  const actor =
    resolveWorkshop2UpdatedBy(req, String(b.actor ?? ''), auth.actor) ?? 'factory-sample-patch';

  let order = prev;
  if (parsed.status && parsed.status !== prev.status) {
    const transition = validateFactorySampleStatusTransition(prev.status, parsed.status);
    if (!transition.allowed) {
      return jsonWorkshop2ErrorRu(409, 'invalid_transition', {
        messageRu: transition.messageRu,
      });
    }
    const transitioned = await transitionWorkshop2SampleOrder({
      id: oid,
      collectionId,
      articleId,
      toStatus: parsed.status,
      actor,
      note: parsed.note ?? 'Статус образца (factory PATCH)',
    });
    if (!transitioned) return jsonWorkshop2ErrorRu(404, 'not_found');
    order = transitioned;
  } else if (parsed.note) {
    const appended = [prev.notes?.trim(), parsed.note].filter(Boolean).join('\n— ');
    const updated = await updateWorkshop2SampleOrder({
      id: oid,
      collectionId,
      articleId,
      notes: appended.slice(0, 2000),
    });
    if (!updated) return jsonWorkshop2ErrorRu(404, 'not_found');
    order = updated;
  }

  bumpPlatformCoreDevelopmentStatus([collectionId]);
  if (parsed.status && parsed.status !== prev.status) {
    void handleWorkshop2SampleStateChangeWebhook({
      collectionId,
      articleId,
      orderId: order.id,
      eventId: `factory-patch:${order.id}:${parsed.status}:${order.updatedAt ?? Date.now()}`,
      fromStatus: prev.status as Workshop2SampleOrderStatus,
      toStatus: parsed.status,
      actorLabel: actor,
      note: parsed.note,
    }).catch(() => {});
  }
  void enqueueWorkshop2DomainEvent({
    type: 'sample_order.status_changed',
    collectionId,
    articleId,
    payload: {
      orderId: order.id,
      status: order.status,
      source: 'factory_sample_patch',
    },
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    order,
    messageRu: 'Образец обновлён (ограниченный PATCH цеха).',
  });
});
