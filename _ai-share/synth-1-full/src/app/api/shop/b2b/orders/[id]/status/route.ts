/**
 * PATCH /api/shop/b2b/orders/[id]/status — lifecycle + domain event b2b.order.status_changed.
 */
import { NextRequest, NextResponse } from 'next/server';

import {
  isWorkshop2B2bOrderStatus,
  summarizeWorkshop2B2bOrderStatusChangeRu,
  WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
  workshop2B2bOrderContextId,
  type Workshop2B2bOrderRecord,
} from '@/lib/production/workshop2-b2b-order-lifecycle';
import { calculateWorkshop2B2bCommission } from '@/lib/production/workshop2-b2b-commission';
import { appendWorkshop2ContextualSystemMessage } from '@/lib/server/workshop2-contextual-messages-repository';
import { enqueueWorkshop2DomainEvent } from '@/lib/server/workshop2-domain-events';
import {
  getWorkshop2B2bOrder,
  patchWorkshop2B2bOrderStatus,
} from '@/lib/server/workshop2-b2b-orders-repository';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { assertShopB2bOrderStatusPatchAllowed } from '@/lib/server/shop-b2b-order-status-policy';

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const { id } = await ctx.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите id заказа.' }, { status: 400 });
  }

  let body: { status?: string; repId?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }

  const statusRaw = String(body.status ?? '').trim();
  if (!isWorkshop2B2bOrderStatus(statusRaw)) {
    return NextResponse.json(
      { ok: false, messageRu: 'status: draft|submitted|confirmed|allocated|shipped|cancelled' },
      { status: 400 }
    );
  }

  const existingOrder = await getWorkshop2B2bOrder(orderId);
  if (!existingOrder) {
    return NextResponse.json({ ok: false, messageRu: 'B2B заказ не найден.' }, { status: 404 });
  }

  const actorPolicy = assertShopB2bOrderStatusPatchAllowed({
    targetStatus: statusRaw,
    orderBuyerId: existingOrder.buyerId,
    sessionBuyerId: checkoutAuth.buyerId,
  });
  if (!actorPolicy.ok) {
    return NextResponse.json(
      { ok: false, code: actorPolicy.code, messageRu: actorPolicy.messageRu },
      { status: actorPolicy.code === 'buyer_mismatch' ? 403 : 409 }
    );
  }

  let commissionPreview: Workshop2B2bOrderRecord['commissionPreview'];
  if (statusRaw === 'submitted' && body.repId?.trim()) {
    const existing = existingOrder;
    if (existing) {
      const line = calculateWorkshop2B2bCommission({
        orderId,
        repId: body.repId.trim(),
        orderTotalRub: existing.totalRub,
      });
      commissionPreview = {
        repId: line.repId,
        commissionRub: line.commissionRub,
        commissionPct: line.commissionPct,
      };
    }
  }

  const result = await patchWorkshop2B2bOrderStatus({
    orderId,
    status: statusRaw,
    commissionPreview,
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, code: result.code, messageRu: result.messageRu },
      {
        status: result.code === 'not_found' ? 404 : result.code === 'qc_gate_blocked' ? 403 : 409,
      }
    );
  }

  if (result.previousStatus !== result.order.status) {
    const collectionId = result.order.collectionId ?? 'SS27';
    const articleId = result.order.articleId ?? 'demo-ss27-01';
    void enqueueWorkshop2DomainEvent({
      type: 'b2b.order.status_changed',
      collectionId,
      articleId,
      payload: {
        orderId,
        from: result.previousStatus,
        to: result.order.status,
        repId: result.order.repId,
        messageRu: summarizeWorkshop2B2bOrderStatusChangeRu({
          orderId,
          from: result.previousStatus,
          to: result.order.status,
        }),
      },
      dispatchNow: true,
    }).catch(() => {
      /* best-effort */
    });
    void appendWorkshop2ContextualSystemMessage({
      contextType: WORKSHOP2_B2B_ORDER_CONTEXT_TYPE,
      contextId: workshop2B2bOrderContextId(orderId),
      message: summarizeWorkshop2B2bOrderStatusChangeRu({
        orderId,
        from: result.previousStatus,
        to: result.order.status,
      }),
    }).catch(() => {
      /* best-effort */
    });
  }

  if (statusRaw === 'submitted' && commissionPreview && body.repId?.trim()) {
    const existing = result.order;
    const line = calculateWorkshop2B2bCommission({
      orderId,
      repId: body.repId.trim(),
      orderTotalRub: existing.totalRub,
      commissionPct: commissionPreview.commissionPct,
      customerName:
        typeof existing.metadata?.buyerName === 'string' ? existing.metadata.buyerName : undefined,
    });
    const { upsertWorkshop2B2bCommissionLineOnOrderSubmit } =
      await import('@/lib/server/workshop2-b2b-commission-repository');
    void upsertWorkshop2B2bCommissionLineOnOrderSubmit({ line }).catch(() => {
      /* best-effort */
    });
  }

  return NextResponse.json({
    ok: true,
    order: result.order,
    messageRu: `Статус заказа: ${result.order.status}.`,
  });
}
