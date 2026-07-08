import { NextRequest, NextResponse } from 'next/server';

import {
  getShopGreenfieldOnboardingServer,
  markShopGreenfieldFirstOrderServer,
} from '@/lib/server/shop-greenfield-onboarding-repository';
import { shopGreenfieldOnboardingMessageRu } from '@/lib/b2b/shop-greenfield-registry-wave-xx';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET — greenfield shop2 onboarding (CRM + pricelist + matrix seed). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() || 'SS27';

  const { state, storageMode } = await getShopGreenfieldOnboardingServer({ buyerId, collectionId });

  return NextResponse.json({
    ok: true,
    state,
    storageMode,
    messageRu: shopGreenfieldOnboardingMessageRu({
      crmReady: state.crmReady,
      pricelistReady: state.pricelistReady,
      storageMode,
      buyerId,
    }),
  });
}

/** POST — отметить первый заказ greenfield (matrix seed href). */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: { buyerId?: string; collectionId?: string; orderId?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(req, body.buyerId ?? checkoutAuth.buyerId);
  const collectionId = body.collectionId?.trim() || 'SS27';
  const orderId = body.orderId?.trim() ?? '';
  if (!orderId) {
    return NextResponse.json({ ok: false, messageRu: 'orderId обязателен.' }, { status: 400 });
  }

  const state = await markShopGreenfieldFirstOrderServer({ buyerId, collectionId, orderId });
  return NextResponse.json({
    ok: true,
    state,
    messageRu: `Первый заказ ${orderId} · seed матрицы готов.`,
  });
}
