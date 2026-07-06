import { NextRequest, NextResponse } from 'next/server';

import {
  getShopReplenishmentFilterSlicesServer,
  postShopReplenishmentFilterSliceServer,
  shopReplenishmentFilterSlicesStorageMode,
} from '@/lib/server/shop-replenishment-filter-slices-repository';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

function resolveBuyerId(req: NextRequest, checkoutBuyerId: string, bodyBuyerId?: string): string {
  return resolveShopCoreBuyerIdFromRequest(
    req,
    bodyBuyerId ?? req.nextUrl.searchParams.get('buyerId') ?? checkoutBuyerId
  );
}

/** GET /api/shop/b2b/replenishment/filter-slices — presets + saved slices (PG). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId);
  const snapshot = await getShopReplenishmentFilterSlicesServer(buyerId);
  const storageMode = shopReplenishmentFilterSlicesStorageMode();

  return NextResponse.json({
    ok: true,
    buyerId,
    presets: snapshot.presets,
    savedSlices: snapshot.savedSlices,
    activeSlice: snapshot.activeSlice,
    activeSliceId: snapshot.activeSliceId,
    storageMode,
    messageRu: snapshot.activeSlice
      ? `Активный срез: ${snapshot.activeSlice.labelRu}.`
      : 'Срезы не сохранены — выберите preset.',
  });
}

/** POST — persist active replenishment filter slice (sidebar). */
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
  const sliceBody = (body.slice ?? body) as Record<string, unknown>;
  const orgId = String(sliceBody.orgId ?? 'shop1').trim();
  const seasonId = String(sliceBody.seasonId ?? 'all').trim();
  const collectionId = String(sliceBody.collectionId ?? 'all').trim();
  const labelRu = String(sliceBody.labelRu ?? `${orgId} · ${seasonId}`).trim();
  const sliceId = String(body.sliceId ?? '').trim() || undefined;

  const snapshot = await postShopReplenishmentFilterSliceServer({
    buyerId,
    sliceId,
    slice: { orgId, seasonId, collectionId, labelRu },
  });

  return NextResponse.json({
    ok: true,
    buyerId,
    savedSlices: snapshot.savedSlices,
    activeSlice: snapshot.activeSlice,
    activeSliceId: snapshot.activeSliceId,
    storageMode: shopReplenishmentFilterSlicesStorageMode(),
    messageRu: `Срез сохранён: ${snapshot.activeSlice.labelRu}.`,
  });
}
