/**
 * POST /api/shop/b2b/accept-invite — принять token приглашения байера.
 */
import { NextRequest, NextResponse } from 'next/server';

import { normalizeShopCoreBuyerIdFromPartnerEmail } from '@/lib/b2b/resolve-shop-partner-session-buyer';
import {
  SHOP_B2B_PARTNER_SESSION_COOKIE,
  SHOP_B2B_PARTNER_TIER_COOKIE,
} from '@/lib/b2b/shop-partners-wave-xk';
import { SHOP_CORE_BUYER_COOKIE } from '@/lib/order/shop-core-buyer-context';
import { acceptWorkshop2B2bBuyerInviteToken } from '@/lib/production/workshop2-b2b-wave23-parity';
import { persistShopB2bPartnerSessionServer } from '@/lib/server/shop-b2b-partner-session-repository';

const PARTNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  let body: { token?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите token.' }, { status: 400 });
  }

  const result = acceptWorkshop2B2bBuyerInviteToken(token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, messageRu: result.messageRu }, { status: 404 });
  }

  const persisted = await persistShopB2bPartnerSessionServer({
    sessionId: result.sessionId,
    buyerEmail: result.buyerEmail,
    tier: result.tier,
    inviteToken: token,
  });

  const buyerId = normalizeShopCoreBuyerIdFromPartnerEmail(result.buyerEmail);

  const res = NextResponse.json({
    ok: true,
    buyerEmail: result.buyerEmail,
    buyerId,
    tier: result.tier,
    sessionId: result.sessionId,
    storageMode: persisted.storageMode,
    messageRu: `Partner session для ${result.buyerEmail}.`,
  });
  res.cookies.set(SHOP_B2B_PARTNER_SESSION_COOKIE, result.sessionId, {
    path: '/',
    maxAge: PARTNER_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  res.cookies.set(SHOP_B2B_PARTNER_TIER_COOKIE, result.tier, {
    path: '/',
    maxAge: PARTNER_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  res.cookies.set(SHOP_CORE_BUYER_COOKIE, buyerId, {
    path: '/',
    maxAge: PARTNER_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });
  return res;
}
