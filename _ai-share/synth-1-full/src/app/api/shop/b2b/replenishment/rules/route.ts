import { NextRequest, NextResponse } from 'next/server';

import type { ShopReplenishmentRulesConfig } from '@/lib/shop/shop-replenishment-rules-store.types';
import {
  getShopReplenishmentRulesServer,
  putShopReplenishmentRulesServer,
  shopReplenishmentRulesStorageMode,
} from '@/lib/server/shop-replenishment-rules-repository';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

function resolveBuyerId(req: NextRequest, checkoutBuyerId: string, bodyBuyerId?: string): string {
  return resolveShopCoreBuyerIdFromRequest(
    req,
    bodyBuyerId ?? req.nextUrl.searchParams.get('buyerId') ?? checkoutBuyerId
  );
}

/** GET /api/shop/b2b/replenishment/rules — saved preset (PG / file / memory). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId);
  const config = await getShopReplenishmentRulesServer(buyerId);
  return NextResponse.json({
    ok: true,
    buyerId,
    config,
    storageMode: shopReplenishmentRulesStorageMode(),
    messageRu: config
      ? `Активное правило: ${config.activePresetId}.`
      : 'Правила не сохранены — выберите preset.',
  });
}

/** PUT — persist active replenishment preset. */
export async function PUT(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const buyerId = resolveBuyerId(req, checkoutAuth.buyerId, String(body.buyerId ?? ''));
  const activePresetId = String(body.activePresetId ?? '').trim();
  if (!activePresetId) {
    return NextResponse.json(
      { ok: false, messageRu: 'activePresetId обязателен.' },
      { status: 400 }
    );
  }

  const config = await putShopReplenishmentRulesServer({
    buyerId,
    activePresetId,
    updatedAt: new Date().toISOString(),
  } satisfies ShopReplenishmentRulesConfig);

  return NextResponse.json({
    ok: true,
    config,
    storageMode: shopReplenishmentRulesStorageMode(),
    messageRu: `Сохранено: ${config.activePresetId}.`,
  });
}
