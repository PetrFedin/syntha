import { NextRequest, NextResponse } from 'next/server';

import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { getShopDevelopmentProgress } from '@/lib/server/shop-development-progress-server';
import { isWorkshop2PgConnectionError } from '@/lib/server/workshop2-pg-pool';

/** GET /api/shop/b2b/development-progress — read-only dossier snapshot + visit diff. */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const collectionId = req.nextUrl.searchParams.get('collection')?.trim() || 'SS27';
  const sinceToken = req.nextUrl.searchParams.get('sinceToken')?.trim() || undefined;
  const sinceRaw = req.nextUrl.searchParams.get('sinceSnapshot')?.trim();
  let sinceSnapshot: Parameters<typeof getShopDevelopmentProgress>[0]['sinceSnapshot'] = null;
  if (sinceRaw) {
    try {
      sinceSnapshot = JSON.parse(sinceRaw) as NonNullable<
        Parameters<typeof getShopDevelopmentProgress>[0]['sinceSnapshot']
      >;
    } catch {
      return NextResponse.json(
        { ok: false, messageRu: 'Некорректный sinceSnapshot JSON.' },
        { status: 400 }
      );
    }
  }

  try {
    const result = await getShopDevelopmentProgress({ collectionId, sinceToken, sinceSnapshot });
    return NextResponse.json({
      ok: true,
      collectionId,
      ...result,
    });
  } catch (err) {
    if (isWorkshop2PgConnectionError(err)) {
      return NextResponse.json(
        {
          ok: false,
          pgUnavailable: true,
          messageRu: 'PostgreSQL недоступен — прогресс разработки требует PG.',
        },
        { status: 503 }
      );
    }
    throw err;
  }
}
