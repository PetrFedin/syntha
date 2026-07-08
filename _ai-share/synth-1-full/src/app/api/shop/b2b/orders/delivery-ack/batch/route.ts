/**
 * POST — batch acknowledge buyer delivery for shipped B2B orders.
 */
import { NextRequest, NextResponse } from 'next/server';
import { bulkAcknowledgeWorkshop2B2bBuyerDelivery } from '@/lib/server/workshop2-b2b-buyer-delivery-ack';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';

export async function POST(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  let body: { orderIds?: string[]; actor?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, messageRu: 'Некорректное тело запроса.' },
      { status: 400 }
    );
  }

  const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];
  if (orderIds.length === 0) {
    return NextResponse.json(
      { ok: false, messageRu: 'Укажите orderIds: string[].' },
      { status: 400 }
    );
  }

  const result = await bulkAcknowledgeWorkshop2B2bBuyerDelivery({
    orderIds,
    actor: body.actor?.trim() || `shop_buyer:${checkoutAuth.buyerId}`,
  });

  return NextResponse.json({
    ok: result.ok,
    acknowledged: result.acknowledged,
    skipped: result.skipped,
    errors: result.errors,
    messageRu:
      result.acknowledged.length > 0
        ? `Подтверждено получение: ${result.acknowledged.length}${result.skipped.length ? ` · уже было: ${result.skipped.length}` : ''}.`
        : result.skipped.length > 0
          ? `Все выбранные заказы уже подтверждены (${result.skipped.length}).`
          : (result.errors[0]?.messageRu ?? 'Не удалось подтвердить получение.'),
  });
}
