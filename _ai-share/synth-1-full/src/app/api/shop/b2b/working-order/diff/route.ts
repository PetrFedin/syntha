import { NextRequest, NextResponse } from 'next/server';

import { SHOP_WORKING_ORDER_DIFF_API_PATH } from '@/lib/b2b/shop-working-order-version-diff';
import {
  diffShopWorkingOrderVersions,
  shopWorkingOrderVersionJournalStorageMode,
} from '@/lib/server/shop-working-order-version-diff';

/** GET — diff двух версий working order (?orderId=, optional from/to). */
export async function GET(req: NextRequest) {
  const wholesaleOrderId =
    req.nextUrl.searchParams.get('orderId')?.trim() ||
    req.nextUrl.searchParams.get('wholesaleOrderId')?.trim() ||
    '';
  if (!wholesaleOrderId) {
    return NextResponse.json(
      {
        ok: false,
        path: SHOP_WORKING_ORDER_DIFF_API_PATH,
        messageRu: 'Не указан orderId.',
      },
      { status: 400 }
    );
  }

  const fromVersionId = req.nextUrl.searchParams.get('from')?.trim() || undefined;
  const toVersionId = req.nextUrl.searchParams.get('to')?.trim() || undefined;

  const diff = await diffShopWorkingOrderVersions({
    wholesaleOrderId,
    fromVersionId,
    toVersionId,
  });

  const storageMode = shopWorkingOrderVersionJournalStorageMode();

  return NextResponse.json({
    ok: diff.ok,
    path: SHOP_WORKING_ORDER_DIFF_API_PATH,
    diff,
    journalId: diff.journalId,
    changedSkuCount: diff.changedSkuCount,
    storageMode,
    pgHintRu:
      storageMode === 'postgres' || storageMode === 'pg'
        ? 'Журнал diff/merge в PostgreSQL (Wave XL).'
        : undefined,
    messageRu: diff.summaryRu,
  });
}
