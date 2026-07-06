import { NextRequest, NextResponse } from 'next/server';

import {
  listShopBuyerAssortmentWishlistServer,
  removeShopBuyerAssortmentWishlistServer,
  replaceShopBuyerAssortmentWishlistServer,
  upsertShopBuyerAssortmentWishlistServer,
} from '@/lib/server/shop-buyer-assortment-wishlist-repository';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

/** GET — buyer assortment wishlist (shop dev bridge, read-only insight). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() || undefined;
  const { items, storageMode } = await listShopBuyerAssortmentWishlistServer({
    buyerId,
    collectionId,
  });

  return NextResponse.json({
    ok: true,
    buyerId,
    items,
    storageMode,
    messageRu: `Wishlist ассортимента: ${items.length} арт.`,
  });
}

/** POST — добавить артикул в wishlist (без редактирования ТЗ). */
export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: { buyerId?: string; collectionId?: string; articleId?: string; note?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное тело.' }, { status: 400 });
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(req, body.buyerId ?? checkoutAuth.buyerId);
  const collectionId = body.collectionId?.trim() ?? '';
  const articleId = body.articleId?.trim() ?? '';
  if (!collectionId || !articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и articleId обязательны.' },
      { status: 400 }
    );
  }

  const result = await upsertShopBuyerAssortmentWishlistServer({
    buyerId,
    collectionId,
    articleId,
    note: body.note,
  });

  return NextResponse.json({
    ok: result.ok,
    storageMode: result.storageMode,
    messageRu: result.ok ? 'Добавлено в wishlist ассортимента.' : 'Не удалось сохранить.',
  });
}

/** PUT — bulk replace wishlist for buyer+collection (PG polish). */
export async function PUT(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: {
    buyerId?: string;
    collectionId?: string;
    items?: { articleId?: string; note?: string; noteRu?: string }[];
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректное тело.' }, { status: 400 });
  }

  const buyerId = resolveShopCoreBuyerIdFromRequest(req, body.buyerId ?? checkoutAuth.buyerId);
  const collectionId = body.collectionId?.trim() || 'SS27';
  const items = (body.items ?? [])
    .map((item) => ({
      articleId: item.articleId?.trim() ?? '',
      note: item.note?.trim() || item.noteRu?.trim() || undefined,
    }))
    .filter((item) => item.articleId.length > 0);

  const result = await replaceShopBuyerAssortmentWishlistServer({
    buyerId,
    collectionId,
    items,
  });

  return NextResponse.json({
    ok: result.ok,
    storageMode: result.storageMode,
    messageRu: result.ok ? `Wishlist обновлён: ${items.length} арт.` : 'Не удалось сохранить.',
  });
}

/** DELETE — убрать из wishlist. */
export async function DELETE(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() ?? '';
  const articleId = req.nextUrl.searchParams.get('articleId')?.trim() ?? '';
  if (!collectionId || !articleId) {
    return NextResponse.json(
      { ok: false, messageRu: 'collectionId и articleId обязательны.' },
      { status: 400 }
    );
  }

  const { removed } = await removeShopBuyerAssortmentWishlistServer({
    buyerId,
    collectionId,
    articleId,
  });
  return NextResponse.json({
    ok: true,
    removed,
    messageRu: removed ? 'Удалено из wishlist.' : 'Запись не найдена.',
  });
}
