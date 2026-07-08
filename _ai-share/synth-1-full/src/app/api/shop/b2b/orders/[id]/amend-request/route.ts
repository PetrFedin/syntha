import { NextRequest, NextResponse } from 'next/server';
import { submitShopWorkshop2B2bAmendmentRequest } from '@/lib/server/workshop2-b2b-amendment-service';
import type { Workshop2B2bOrderLine } from '@/lib/production/workshop2-b2b-order-lifecycle';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

type RouteCtx = { params: Promise<{ id: string }> };

/** POST — магазин отправляет структурированную заявку на изменение заказа. */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const { id } = await ctx.params;
  const orderId = id?.trim();
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан orderId.' }, { status: 400 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const result = await submitShopWorkshop2B2bAmendmentRequest({
    orderId,
    noteRu: String(body.noteRu ?? ''),
    buyerId: String(body.buyerId ?? '').trim() || checkoutAuth.buyerId,
    proposedLines: Array.isArray(body.proposedLines)
      ? (body.proposedLines as Workshop2B2bOrderLine[])
      : undefined,
  });

  if (!result.ok) {
    const status = result.code === 'not_found' ? 404 : result.code === 'amend_locked' ? 409 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({
    ok: true,
    amendment: result.amendment,
    messageRu: result.messageRu,
  });
}
