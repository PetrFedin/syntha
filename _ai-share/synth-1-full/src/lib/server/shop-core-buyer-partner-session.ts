import 'server-only';

import type { NextRequest } from 'next/server';

import { SHOP_CORE_DEMO_BUYER_ID } from '@/lib/order/shop-workshop2-b2b-order-ui';
import {
  resolveShopCoreBuyerIdFromOrganization,
  resolveShopCoreBuyerIdFromPartnerEmail,
  resolveShopCoreBuyerIdFromRequest,
  resolveShopCoreBuyerIdFromSessionUid,
  SHOP_B2B_CART_SESSION_COOKIE,
  SHOP_CORE_BUYER_COOKIE,
  SHOP_CORE_BUYER_QUERY,
} from '@/lib/order/shop-core-buyer-context';
import {
  getShopB2bPartnerSessionServer,
  peekShopB2bPartnerSessionMemory,
} from '@/lib/server/shop-b2b-partner-session-repository';

const VALID_BUYER_IDS = new Set(['shop1', 'shop2']);

async function resolveShopCoreBuyerIdFromPartnerPgSessionCookie(
  req: NextRequest
): Promise<string | undefined> {
  const cartSessionId = req.cookies.get(SHOP_B2B_CART_SESSION_COOKIE)?.value?.trim();
  if (!cartSessionId) return undefined;

  const fromMemory = peekShopB2bPartnerSessionMemory(cartSessionId);
  if (fromMemory) {
    return resolveShopCoreBuyerIdFromPartnerEmail(fromMemory.buyerEmail);
  }

  const { record } = await getShopB2bPartnerSessionServer(cartSessionId);
  if (!record) return undefined;
  return resolveShopCoreBuyerIdFromPartnerEmail(record.buyerEmail);
}

/**
 * Wave XK: checkout BFF resolves buyer from PG partner session (`b2b_cart_session` cookie)
 * before defaulting to shop1.
 */
export async function resolveShopCoreBuyerIdFromRequestAsync(
  req: NextRequest,
  explicitBuyerId?: string | null
): Promise<string> {
  const fromBody = explicitBuyerId?.trim();
  if (fromBody && VALID_BUYER_IDS.has(fromBody)) return fromBody;

  const fromQuery = req.nextUrl.searchParams.get(SHOP_CORE_BUYER_QUERY)?.trim();
  if (fromQuery && VALID_BUYER_IDS.has(fromQuery)) return fromQuery;

  const fromOrgHeader = req.headers.get('x-w2-organization-id')?.trim();
  const fromOrg = resolveShopCoreBuyerIdFromOrganization(fromOrgHeader);
  if (fromOrg) return fromOrg;

  const fromActorHeader = req.headers.get('x-w2-actor-id')?.trim();
  const fromSession = resolveShopCoreBuyerIdFromSessionUid(fromActorHeader);
  if (fromSession) return fromSession;

  const fromPartnerPg = await resolveShopCoreBuyerIdFromPartnerPgSessionCookie(req);
  if (fromPartnerPg) return fromPartnerPg;

  const fromCookie = req.cookies.get(SHOP_CORE_BUYER_COOKIE)?.value?.trim();
  if (fromCookie && VALID_BUYER_IDS.has(fromCookie)) return fromCookie;

  return SHOP_CORE_DEMO_BUYER_ID;
}

/** Dev fallback: sync resolver when async PG is unavailable. */
export function resolveShopCoreBuyerIdFromRequestWithPartnerMemory(
  req: NextRequest,
  explicitBuyerId?: string | null
): string {
  const base = resolveShopCoreBuyerIdFromRequest(req, explicitBuyerId);
  if (base !== SHOP_CORE_DEMO_BUYER_ID) return base;

  const cartSessionId = req.cookies.get(SHOP_B2B_CART_SESSION_COOKIE)?.value?.trim();
  if (!cartSessionId) return base;

  const fromMemory = peekShopB2bPartnerSessionMemory(cartSessionId);
  if (!fromMemory) return base;

  return resolveShopCoreBuyerIdFromPartnerEmail(fromMemory.buyerEmail) ?? base;
}
