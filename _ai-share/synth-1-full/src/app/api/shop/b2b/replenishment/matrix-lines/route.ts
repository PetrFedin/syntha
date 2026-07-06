import { NextRequest, NextResponse } from 'next/server';

import { getShopReplenishmentSuggest } from '@/lib/server/shop-replenishment-suggest-server';
import { shopB2bMatrixReorderHref } from '@/lib/routes';
import { guardShopB2bCheckoutRoute } from '@/lib/server/shop-b2b-checkout-route-auth';
import { resolveShopCoreBuyerIdFromRequest } from '@/lib/order/shop-core-buyer-context';

/** GET — строки replenishment → matrix (reorder only). */
export async function GET(req: NextRequest) {
  const checkoutAuth = await guardShopB2bCheckoutRoute(req);
  if (checkoutAuth instanceof NextResponse) return checkoutAuth;

  const buyerId = resolveShopCoreBuyerIdFromRequest(
    req,
    req.nextUrl.searchParams.get('buyerId') ?? checkoutAuth.buyerId
  );
  const collectionId = req.nextUrl.searchParams.get('collectionId')?.trim() || 'SS27';
  const orderId = req.nextUrl.searchParams.get('orderId')?.trim() || '';

  const { rows, source } = await getShopReplenishmentSuggest({
    shopId: buyerId,
    collectionId,
    limit: 12,
  });

  const lines = rows
    .filter((row) => row.action === 'reorder' && row.suggestedQty > 0)
    .map((row) => ({
      sku: row.sku,
      productId: row.productId,
      suggestedQty: row.suggestedQty,
      reason: row.reason,
      urgency: row.urgency,
    }));

  const matrixHref = orderId
    ? shopB2bMatrixReorderHref(collectionId, orderId)
    : shopB2bMatrixReorderHref(collectionId, '');

  return NextResponse.json({
    ok: true,
    buyerId,
    collectionId,
    source,
    lines,
    matrixHref,
    applyHref: '/api/shop/b2b/replenishment/matrix-lines/apply',
    messageRu:
      lines.length > 0
        ? `${lines.length} SKU готовы к переносу в матрицу.`
        : 'Нет позиций для автопереноса — проверьте ATP.',
  });
}
