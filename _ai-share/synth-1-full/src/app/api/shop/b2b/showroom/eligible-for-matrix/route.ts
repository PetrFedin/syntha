import { NextRequest, NextResponse } from 'next/server';

import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-hub-matrix';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { getShopShowroomEligibleForMatrixServer } from '@/lib/server/shop-showroom-eligible-for-matrix-server';

/** GET /api/shop/b2b/showroom/eligible-for-matrix — F-ELIGIBLE filter for shop matrix. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const collectionId =
    req.nextUrl.searchParams.get('collection')?.trim() ||
    req.nextUrl.searchParams.get('collectionId')?.trim() ||
    PLATFORM_CORE_DEMO.collectionId;
  const eligibleOnly =
    req.nextUrl.searchParams.get('eligibleOnly') === '1' ||
    req.nextUrl.searchParams.get('filter') === 'eligible';

  if (!collectionId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collection обязателен.' },
      { status: 400 }
    );
  }

  const snapshot = await getShopShowroomEligibleForMatrixServer({
    buyerId,
    collectionId,
    eligibleOnly,
  });

  return NextResponse.json({ ok: true, ...snapshot });
}
