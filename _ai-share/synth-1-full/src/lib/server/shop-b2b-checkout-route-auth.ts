import 'server-only';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  normalizeShopCoreBuyerId,
  resolveShopCoreBuyerIdFromOrganization,
  resolveShopCoreBuyerIdFromSessionUid,
} from '@/lib/order/shop-core-buyer-context';
import { resolveShopCoreBuyerIdFromRequestAsync } from '@/lib/server/shop-core-buyer-partner-session';
import {
  assertWorkshop2ApiAccess,
  workshop2AuthJsonResponse,
} from '@/lib/server/workshop2-api-auth';
import { shouldRequireShopB2bCheckoutJwt } from '@/lib/server/shop-b2b-checkout-auth-policy';

export { shouldRequireShopB2bCheckoutJwt } from '@/lib/server/shop-b2b-checkout-auth-policy';

export type ShopB2bCheckoutAuthOk = {
  ok: true;
  mode: 'jwt' | 'dev';
  buyerId: string;
};

/** Production: checkout только с JWT session / API secret, не с подменой x-w2-actor-id. */
export async function guardShopB2bCheckoutRoute(
  req: NextRequest,
  explicitBuyerId?: string | null
): Promise<ShopB2bCheckoutAuthOk | NextResponse> {
  if (!shouldRequireShopB2bCheckoutJwt()) {
    return {
      ok: true,
      mode: 'dev',
      buyerId: await resolveShopCoreBuyerIdFromRequestAsync(req, explicitBuyerId),
    };
  }

  const access = await assertWorkshop2ApiAccess(req);
  if (!access.ok) {
    return NextResponse.json(workshop2AuthJsonResponse(access), { status: access.status });
  }

  if (access.mode !== 'session' && access.mode !== 'api_secret') {
    return NextResponse.json(
      {
        ok: false,
        error: 'checkout_jwt_required',
        messageRu:
          'Checkout B2B в production требует JWT-сессию или API secret — заголовки x-w2-actor-id недостаточны.',
      },
      { status: 401 }
    );
  }

  const actor = access.actor;
  const buyerFromSession =
    resolveShopCoreBuyerIdFromOrganization(actor?.actorOrganization) ??
    resolveShopCoreBuyerIdFromSessionUid(actor?.actorId);

  const requested = explicitBuyerId?.trim();
  const resolvedFromPartnerSession = await resolveShopCoreBuyerIdFromRequestAsync(req, requested);

  if (requested && buyerFromSession && requested !== buyerFromSession) {
    return NextResponse.json(
      {
        ok: false,
        error: 'checkout_buyer_mismatch',
        messageRu: 'buyerId не совпадает с организацией JWT-сессии.',
      },
      { status: 403 }
    );
  }

  return {
    ok: true,
    mode: 'jwt',
    buyerId: normalizeShopCoreBuyerId(buyerFromSession ?? resolvedFromPartnerSession),
  };
}
