import { NextRequest, NextResponse } from 'next/server';

import { applyShopReplenishmentMatrixLines } from '@/lib/server/shop-replenishment-matrix-apply-server';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';

/** POST — replenishment reorder rows → matrix cart (PG session file). */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: { buyerId?: string; collectionId?: string; orderId?: string; sessionId?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    body.buyerId ?? checkoutAuth.buyerId
  );
  const collectionId = body.collectionId?.trim() || 'SS27';
  const orderId = body.orderId?.trim() || '';
  const sessionId =
    body.sessionId?.trim() || req.cookies.get('b2b_cart_session')?.value?.trim() || undefined;

  const result = await applyShopReplenishmentMatrixLines({
    buyerId,
    collectionId,
    orderId,
    sessionId,
  });

  const res = NextResponse.json(result, { status: result.ok ? 200 : 422 });
  if (result.ok) {
    res.cookies.set('b2b_cart_session', result.sessionId, { path: '/', sameSite: 'lax' });
  }
  return res;
}
