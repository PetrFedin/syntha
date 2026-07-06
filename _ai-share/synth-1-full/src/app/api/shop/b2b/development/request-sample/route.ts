import { NextRequest, NextResponse } from 'next/server';

import { appendPlatformCoreNotificationEvent } from '@/lib/server/platform-core-notification-events-repository';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { workshop2ArticleHref } from '@/lib/production/workshop2-url';

/** POST — запрос образца от магазина → уведомление бренду (S4). */
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
  const collectionId = body.collectionId?.trim() || 'SS27';
  const articleId = body.articleId?.trim() ?? '';
  if (!articleId) {
    return NextResponse.json({ ok: false, messageRu: 'articleId обязателен.' }, { status: 400 });
  }

  const note = body.note?.trim();
  const event = await appendPlatformCoreNotificationEvent({
    role: 'brand',
    scopeKey: `dev-sample:${collectionId}`,
    collectionId,
    articleId,
    kind: 'order_status',
    titleRu: 'Запрос образца от магазина',
    bodyRu: note
      ? `${buyerId} · ${articleId} · ${note}`
      : `${buyerId} запросил образец ${articleId}`,
    href: workshop2ArticleHref(collectionId, articleId),
  });

  return NextResponse.json({
    ok: true,
    eventId: event.id,
    messageRu: 'Запрос отправлен бренду.',
  });
}
