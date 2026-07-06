/**
 * POST /api/workshop2/factory/sample-queue/[orderId]/acknowledge
 * Фабрика подтверждает получение образца: sent|in_progress → received.
 */
import { jsonWorkshop2ErrorRu } from '@/lib/production/workshop2-api-error-ru';
import { withWorkshop2ApiErrorRu } from '@/lib/production/workshop2-api-route-ru';
import { NextRequest, NextResponse } from 'next/server';
import {
  listWorkshop2SampleOrders,
  transitionWorkshop2SampleOrder,
} from '@/lib/server/workshop2-sample-order-repository';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import { guardWorkshop2Route, WORKSHOP2_WRITE_ROLES } from '@/lib/server/workshop2-route-auth';
import { resolveWorkshop2UpdatedBy } from '@/lib/server/workshop2-api-context';
import {
  normalizeWorkshop2SampleOrderStatus,
  validateWorkshop2SampleOrderTransition,
} from '@/lib/production/workshop2-sample-order-transitions';

type RouteCtx = { params: Promise<{ orderId: string }> };

export const POST = withWorkshop2ApiErrorRu(async function postFactoryAcknowledge(
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
    body = {};
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
      messageRu: 'Укажите collectionId и articleId в body или query.',
    });
  }

  const orders = await listWorkshop2SampleOrders({ collectionId, articleId });
  const prev = orders.find((o) => o.id === oid);
  if (!prev) return jsonWorkshop2ErrorRu(404, 'not_found');

  const target = normalizeWorkshop2SampleOrderStatus(String(b.toStatus ?? '')) ?? 'received';
  const transition = validateWorkshop2SampleOrderTransition(prev.status, target);
  if (!transition.allowed) {
    return jsonWorkshop2ErrorRu(409, 'invalid_transition', {
      messageRu: transition.messageRu,
      from: transition.from,
      to: transition.to,
    });
  }

  const actor =
    resolveWorkshop2UpdatedBy(req, String(b.actor ?? ''), auth.actor) ?? 'factory-acknowledge';
  const note = b.note != null ? String(b.note) : 'Подтверждение получения (factory acknowledge)';

  const order = await transitionWorkshop2SampleOrder({
    id: oid,
    collectionId,
    articleId,
    toStatus: target,
    actor,
    note,
  });
  if (!order) return jsonWorkshop2ErrorRu(404, 'not_found');

  void enqueueWorkshop2DomainEvent({
    type: 'sample_order.status_changed',
    collectionId,
    articleId,
    payload: {
      orderId: order.id,
      status: order.status,
      previousStatus: prev.status,
      actor,
      source: 'factory_acknowledge',
    },
    dispatchNow: true,
  }).catch(() => {});

  const { bumpPlatformCoreDevelopmentStatus } =
    await import('@/lib/server/platform-core-development-status-hub');
  bumpPlatformCoreDevelopmentStatus([collectionId]);

  return NextResponse.json({
    ok: true,
    order,
    acknowledge: { from: prev.status, to: order.status, actor },
  });
});
