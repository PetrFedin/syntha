import { NextRequest, NextResponse } from 'next/server';
import { buildPgContextualThreadsResponse } from '@/lib/server/pg-contextual-message-threads-handler';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET /api/shop/messages/threads — contextual PG threads для кабинета байера (B2B only). */
export async function GET(request: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(request);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;
  return buildPgContextualThreadsResponse('shop', request);
}
