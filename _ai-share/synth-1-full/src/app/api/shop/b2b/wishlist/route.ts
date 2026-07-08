/**
 * B2B wishlist: GET list · POST add · DELETE remove (Wave 22).
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  formatWorkshop2B2bCampaignId,
  parseWorkshop2B2bCampaignId,
} from '@/lib/production/workshop2-b2b-wave22-parity';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import {
  addWorkshop2B2bWishlistEntry,
  listWorkshop2B2bWishlist,
  removeWorkshop2B2bWishlistEntry,
} from '@/lib/server/workshop2-b2b-wishlist-repository';

function resolveBuyerId(req: NextRequest, checkoutBuyerId: string, bodyBuyerId?: string): string {
  return resolveShopCoreBuyerIdFromRequest(
    req,
    bodyBuyerId ?? req.nextUrl.searchParams.get('buyerId') ?? checkoutBuyerId
  );
}

export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId);
  const items = await listWorkshop2B2bWishlist(buyerId);
  return NextResponse.json({
    ok: true,
    buyerId,
    items,
    count: items.length,
    messageRu: `Избранное: ${items.length} кампаний.`,
  });
}

export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId, String(body.buyerId ?? ''));
  const campaignId =
    String(body.campaignId ?? '').trim() ||
    (body.collectionId && body.articleId
      ? formatWorkshop2B2bCampaignId(String(body.collectionId), String(body.articleId))
      : '');

  const parsed = parseWorkshop2B2bCampaignId(campaignId);
  if (!parsed) {
    return NextResponse.json(
      { ok: false, messageRu: 'campaignId должен быть collectionId::articleId.' },
      { status: 400 }
    );
  }

  await addWorkshop2B2bWishlistEntry({
    buyerId,
    campaignId,
    collectionId: parsed.collectionId,
    articleId: parsed.articleId,
    addedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    campaignId,
    messageRu: 'Добавлено в избранное B2B.',
  });
}

export async function DELETE(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId);
  const campaignId = req.nextUrl.searchParams.get('campaignId')?.trim() ?? '';
  if (!campaignId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите campaignId.' }, { status: 400 });
  }
  const result = await removeWorkshop2B2bWishlistEntry({ buyerId, campaignId });
  return NextResponse.json({
    ok: true,
    removed: result.removed,
    messageRu: result.removed ? 'Удалено из избранного.' : 'Запись не найдена.',
  });
}
