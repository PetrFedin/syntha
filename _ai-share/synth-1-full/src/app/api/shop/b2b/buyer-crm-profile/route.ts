import { NextRequest, NextResponse } from 'next/server';

import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import {
  shopEmpty27BuyerProfileReadMessageRu,
  shopEmpty27BuyerProfileSeedNoteRu,
  shopEmpty27BuyerProfileWriteMessageRu,
} from '@/lib/b2b/shop-sc-empty27-buyer-profile-wave-ym';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import {
  assignShopBuyerCrmProfileServer,
  getShopBuyerCrmProfileServer,
} from '@/lib/server/shop-buyer-crm-profile-repository';

/** GET /api/shop/b2b/buyer-crm-profile — shop EMPTY27 onboarding read (wave YM). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const { profile, storageMode } = await getShopBuyerCrmProfileServer({ buyerId });

  return NextResponse.json({
    ok: true,
    buyerId,
    profile,
    storageMode,
    messageRu: shopEmpty27BuyerProfileReadMessageRu(profile),
  });
}

/** POST /api/shop/b2b/buyer-crm-profile — EMPTY27 onboarding PG seed (wave YM). */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: {
    buyerId?: string;
    collectionId?: string;
    action?: string;
    segmentKey?: string;
    onboardingNoteRu?: string;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    body.buyerId ?? checkoutAuth.buyerId
  );
  const segmentKey = body.segmentKey?.trim();
  if (!segmentKey) {
    return NextResponse.json(
      { ok: false, messageRu: 'segmentKey обязателен для записи CRM-профиля.' },
      { status: 400 }
    );
  }

  const onboardingNoteRu =
    typeof body.onboardingNoteRu === 'string' && body.onboardingNoteRu.trim()
      ? body.onboardingNoteRu.trim()
      : shopEmpty27BuyerProfileSeedNoteRu(buyerId);

  const { profile, storageMode } = await assignShopBuyerCrmProfileServer({
    buyerId,
    segmentKey,
    onboardingNoteRu,
  });

  if (!profile) {
    return NextResponse.json(
      { ok: false, messageRu: 'CRM-профиль покупателя недоступен.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    buyerId,
    collectionId: body.collectionId?.trim() || undefined,
    profile,
    storageMode,
    messageRu: shopEmpty27BuyerProfileWriteMessageRu(profile, storageMode),
  });
}
