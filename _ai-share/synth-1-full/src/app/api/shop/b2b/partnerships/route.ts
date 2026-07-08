import { NextRequest, NextResponse } from 'next/server';

import { buildShopB2bPartnershipsFallback } from '@/lib/shop/shop-b2b-partnerships';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';
import {
  connectShopB2bPartnershipDemo,
  listShopB2bPartnerships,
  requestShopB2bPartnershipAccess,
} from '@/lib/server/shop-b2b-partnerships';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { isWorkshop2PostgresEnabled } from '@/lib/server/workshop2-pg-pool';
import { isWorkshop2PgOnlyMode } from '@/lib/production/workshop2-hub-pg-only-policy';

/** GET /api/shop/b2b/partnerships — подключённые бренды магазина из W2 PG (orders + showroom + onboarding rows). */
export async function GET(req: NextRequest) {
  const explicitBuyer = req.nextUrl.searchParams.get('buyerId')?.trim();
  const checkoutAuth = await guardShopB2bCheckoutRoute(req, explicitBuyer);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = explicitBuyer || checkoutAuth.buyerId || resolveShopCoreBuyerIdFromRequest(req);
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() || 'SS27';

  const partnerships = await listShopB2bPartnerships(buyerId);
  const failClosed = isWorkshop2PostgresEnabled() || isWorkshop2PgOnlyMode();
  const usePgSource =
    partnerships.length > 0 &&
    (partnerships.some((p) => p.source === 'pg') || isWorkshop2PostgresEnabled());
  const source = usePgSource
    ? ('pg' as const)
    : failClosed
      ? ('pg' as const)
      : ('fallback' as const);
  const items = partnerships.length
    ? partnerships
    : failClosed
      ? []
      : buildShopB2bPartnershipsFallback(collectionId);

  return NextResponse.json({
    ok: true,
    buyerId,
    source: partnerships.length ? source : failClosed ? ('pg' as const) : ('fallback' as const),
    partnerships: items,
    messageRu: items.length
      ? source === 'pg'
        ? `W2: ${items.length} бренд(ов) для ${buyerId} (PG onboarding).`
        : `Статичный fallback: ${items.length} бренд(ов) (PG пуст или недоступен).`
      : failClosed
        ? 'Партнёры не найдены в PG (fail-closed).'
        : 'Партнёры не найдены.',
  });
}

/** POST — onboarding profile → requested → connected (Platform Core golden path). */
export async function POST(req: NextRequest) {
  let body: {
    action?: 'request' | 'connect';
    brandId?: string;
    buyerId?: string;
    collectionId?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, messageRu: 'Некорректный JSON.' }, { status: 400 });
  }

  const brandId = body.brandId?.trim();
  if (!brandId) {
    return NextResponse.json({ ok: false, messageRu: 'Укажите brandId.' }, { status: 400 });
  }

  const checkoutAuth = await guardShopB2bCheckoutRoute(req, body.buyerId);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId =
    body.buyerId?.trim() || checkoutAuth.buyerId || resolveShopCoreBuyerIdFromRequest(req);
  const collectionId = body.collectionId?.trim();
  const action = body.action === 'connect' ? 'connect' : 'request';

  const result =
    action === 'connect'
      ? await connectShopB2bPartnershipDemo({ buyerId, brandId, collectionId })
      : await requestShopB2bPartnershipAccess({ buyerId, brandId, collectionId });

  if (!result.ok) {
    return NextResponse.json(result, { status: isWorkshop2PostgresEnabled() ? 400 : 503 });
  }

  return NextResponse.json({
    ok: true,
    action,
    partnership: result.partnership,
    messageRu:
      action === 'connect'
        ? `Партнёрство с ${result.partnership.name} подключено в PostgreSQL.`
        : `Заявка на доступ к ${result.partnership.name} сохранена в PostgreSQL.`,
  });
}
