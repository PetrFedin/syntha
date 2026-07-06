import { NextRequest, NextResponse } from 'next/server';

import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { getShopReplenishmentSuggest } from '@/lib/server/shop-replenishment-suggest-server';
import { isWorkshop2PgConnectionError } from '@/lib/server/workshop2-pg-pool';

/** GET /api/shop/b2b/replenishment/suggest — spine orders + ATP (не lib/products). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const shopId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ??
      req.nextUrl.searchParams.get('shopId') ??
      checkoutAuth.buyerId
  );
  const collectionId = req.nextUrl.searchParams.get('collection')?.trim() || 'SS27';
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(Number(limitRaw) || 6, 1), 24) : 6;

  try {
    const result = await getShopReplenishmentSuggest({ shopId, collectionId, limit });
    return NextResponse.json({
      ok: true,
      shopId,
      collectionId,
      recommendations: result.rows,
      source: result.source,
    });
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) {
      return NextResponse.json(
        {
          ok: false,
          pgUnavailable: true,
          messageRu: 'PostgreSQL недоступен — replenishment suggest требует PG/file store.',
        },
        { status: 503 }
      );
    }
    throw err;
  }
}
