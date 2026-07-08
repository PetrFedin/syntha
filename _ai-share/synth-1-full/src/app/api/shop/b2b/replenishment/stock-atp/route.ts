import { NextRequest, NextResponse } from 'next/server';

import { readReplenishmentStockSliceFromSearchParams } from '@/lib/platform/shop-replenishment-stock-slices';
import { getShopReplenishmentStockAtpRows } from '@/lib/server/shop-replenishment-stock-atp-server';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

function resolveShopId(req: NextRequest, checkoutBuyerId: string): string {
  return resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('shopId') ??
      req.nextUrl.searchParams.get('buyerId') ??
      checkoutBuyerId
  );
}

/** GET /api/shop/b2b/replenishment/stock-atp — PG ledger grains → ATP rows. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const shopId = resolveShopId(req, checkoutAuth.buyerId);
  const collectionId = req.nextUrl.searchParams.get('collection')?.trim() || undefined;
  const limitRaw = req.nextUrl.searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(Number(limitRaw) || 12, 1), 48) : 12;
  const slice = readReplenishmentStockSliceFromSearchParams(req.nextUrl.searchParams);

  const result = await getShopReplenishmentStockAtpRows({
    shopId,
    collectionId,
    slice,
    limit,
  });

  return NextResponse.json({
    ok: true,
    shopId,
    ...result,
  });
}
