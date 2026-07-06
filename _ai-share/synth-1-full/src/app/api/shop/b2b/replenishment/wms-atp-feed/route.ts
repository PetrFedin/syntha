import { NextRequest, NextResponse } from 'next/server';

import { getShopReplenishmentWmsAtpFeed } from '@/lib/server/shop-replenishment-wms-atp-feed-server';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET /api/shop/b2b/replenishment/wms-atp-feed — WMS ATP feed stub for replenishment badge. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const shopId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('shopId') ??
      req.nextUrl.searchParams.get('buyerId') ??
      checkoutAuth.buyerId
  );
  const collectionId = req.nextUrl.searchParams.get('collection')?.trim() || 'SS27';
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(Number(limitRaw) || 24, 1), 48) : 24;

  const result = await getShopReplenishmentWmsAtpFeed({ shopId, collectionId, limit });

  return NextResponse.json({
    ok: true,
    shopId,
    collectionId,
    ...result,
  });
}
