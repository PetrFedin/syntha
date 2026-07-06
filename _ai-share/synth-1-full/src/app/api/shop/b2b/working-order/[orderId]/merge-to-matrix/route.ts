import { NextRequest, NextResponse } from 'next/server';

import { mergeShopWorkingOrderToMatrix } from '@/lib/server/shop-working-order-merge-to-matrix';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';

type RouteCtx = { params: Promise<{ orderId: string }> };

function resolveSessionId(req: NextRequest, bodySessionId?: string): string {
  return (
    bodySessionId?.trim() ||
    req.cookies.get('b2b_cart_session')?.value?.trim() ||
    `b2b-cart-wo-${Date.now()}`
  );
}

/** POST — merge последней версии working order → B2B cart / matrix. */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const { orderId: raw } = await ctx.params;
  const wholesaleOrderId = raw?.trim();
  if (!wholesaleOrderId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан orderId.' }, { status: 400 });
  }

  let body: { sessionId?: string; collectionId?: string; versionId?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const sessionId = resolveSessionId(req, body.sessionId);
  const result = await mergeShopWorkingOrderToMatrix({
    wholesaleOrderId,
    sessionId,
    buyerId: checkoutAuth.buyerId,
    collectionId: body.collectionId,
    versionId: body.versionId,
  });

  const res = NextResponse.json({
    ...result,
    storageMode: isWorkshop2PostgresEnabled() ? 'pg' : 'file',
  });
  if (result.ok) {
    res.cookies.set('b2b_cart_session', sessionId, { path: '/', sameSite: 'lax' });
  }
  return res;
}
