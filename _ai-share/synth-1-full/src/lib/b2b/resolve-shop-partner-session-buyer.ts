import 'server-only';

import {
  isShopCoreBuyerId,
  normalizeShopCoreBuyerId,
  resolveShopCoreBuyerIdFromPartnerEmail,
} from '@/lib/order/shop-core-buyer-context';
import { peekShopB2bPartnerSessionMemory } from '@/lib/server/shop-b2b-partner-session-repository';
import { SHOP_B2B_PARTNER_SESSION_COOKIE } from '@/lib/b2b/shop-partners-wave-xk';
import type { NextRequest } from 'next/server';

export { resolveShopCoreBuyerIdFromPartnerEmail };

export function resolveShopCoreBuyerIdFromPartnerSessionIdSync(
  sessionId?: string | null
): string | undefined {
  const sid = sessionId?.trim();
  if (!sid) return undefined;
  const record = peekShopB2bPartnerSessionMemory(sid);
  if (!record) return undefined;
  return resolveShopCoreBuyerIdFromPartnerEmail(record.buyerEmail);
}

export function readShopB2bPartnerSessionCookie(req: NextRequest): string | undefined {
  return req.cookies.get(SHOP_B2B_PARTNER_SESSION_COOKIE)?.value?.trim() || undefined;
}

export function resolveShopCoreBuyerIdFromPartnerSessionCookieSync(
  req: NextRequest
): string | undefined {
  return resolveShopCoreBuyerIdFromPartnerSessionIdSync(readShopB2bPartnerSessionCookie(req));
}

export async function resolveShopCoreBuyerIdFromPartnerSessionCookieAsync(
  req: NextRequest
): Promise<string | undefined> {
  const fromMemory = resolveShopCoreBuyerIdFromPartnerSessionCookieSync(req);
  if (fromMemory) return fromMemory;

  const sessionId = readShopB2bPartnerSessionCookie(req);
  if (!sessionId) return undefined;

  const { getShopB2bPartnerSessionServer } = await import(
    '@/lib/server/shop-b2b-partner-session-repository'
  );
  const { record } = await getShopB2bPartnerSessionServer(sessionId);
  if (!record) return undefined;
  return resolveShopCoreBuyerIdFromPartnerEmail(record.buyerEmail);
}

export function normalizeShopCoreBuyerIdFromPartnerEmail(
  buyerEmail?: string | null,
  fallback = 'shop1'
): string {
  const mapped = resolveShopCoreBuyerIdFromPartnerEmail(buyerEmail);
  if (mapped && isShopCoreBuyerId(mapped)) return mapped;
  return normalizeShopCoreBuyerId(fallback);
}
