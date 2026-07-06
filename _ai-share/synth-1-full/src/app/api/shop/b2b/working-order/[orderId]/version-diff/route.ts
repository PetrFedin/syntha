import { NextRequest, NextResponse } from 'next/server';

import {
  diffShopWorkingOrderVersions,
  shopWorkingOrderVersionJournalStorageMode,
} from '@/lib/server/shop-working-order-version-diff';

type RouteCtx = { params: Promise<{ orderId: string }> };

/** GET — diff двух версий working order (последние две по умолчанию). */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { orderId: raw } = await ctx.params;
  const wholesaleOrderId = raw?.trim();
  if (!wholesaleOrderId) {
    return NextResponse.json({ ok: false, messageRu: 'Не указан orderId.' }, { status: 400 });
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
    path: `/api/shop/b2b/working-order/${encodeURIComponent(wholesaleOrderId)}/version-diff`,
    diff,
    journalId: diff.journalId,
    changedSkuCount: diff.changedSkuCount,
    storageMode,
    messageRu: diff.summaryRu,
  });
}
