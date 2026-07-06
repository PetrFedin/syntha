/**
 * GET/POST /api/shop/b2b/checkout/payment-intent — probe + create YuKassa/Stripe intent (env-gated).
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  createShopCoCheckoutPaymentIntent,
  probeShopCoCheckoutPaymentIntent,
} from '@/lib/b2b/shop-co-checkout-payment-intent';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET — honest probe: keys missing vs configured (no payment URL). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const probe = probeShopCoCheckoutPaymentIntent();
  return NextResponse.json({ ok: true, ...probe });
}

/** POST — create payment intent when keys configured; instruction RU when not. */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: { amountRub?: number; orderId?: string; returnUrl?: string; descriptionRu?: string } =
    {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const amountRub = Number(body.amountRub ?? 0);
  if (!Number.isFinite(amountRub) || amountRub <= 0) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите amountRub > 0.', status: 'not_connected' },
      { status: 400 }
    );
  }

  const result = createShopCoCheckoutPaymentIntent({
    amountRub,
    orderId: body.orderId,
    returnUrl: body.returnUrl,
    descriptionRu: body.descriptionRu,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
